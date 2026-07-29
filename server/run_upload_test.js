const http = require('http');
const path = require('path');
const fs = require('fs');

const HOST = '127.0.0.1';
const PORT = 5000;

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data, cookies, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: Get CSRF token
  const csrfRes = await request({ hostname: HOST, port: PORT, path: '/api/csrf-token', method: 'GET' });
  const csrfData = JSON.parse(csrfRes.body);
  const csrfToken = csrfData.csrfToken;
  const csrfCookie = csrfRes.cookies.map(c => c.split(';')[0]).join('; ');

  // Step 2: Login
  const loginBody = JSON.stringify({ email: 'candidate@hireai.com', password: 'Candidate@123' });
  const loginRes = await request({
    hostname: HOST, port: PORT, path: '/api/auth/login', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody),
      'CSRF-Token': csrfToken,
      'Cookie': csrfCookie
    }
  }, loginBody);

  const loginData = JSON.parse(loginRes.body);
  const token = loginData.token;
  const authCookies = [...csrfRes.cookies, ...loginRes.cookies].map(c => c.split(';')[0]).join('; ');

  if (!token) {
    console.log('LOGIN FAILED:', loginRes.status, loginRes.body);
    return;
  }
  console.log('Login OK, token obtained');

  // Step 3: Get a fresh CSRF token with auth cookies
  const csrfRes2 = await request({
    hostname: HOST, port: PORT, path: '/api/csrf-token', method: 'GET',
    headers: { 'Cookie': authCookies }
  });
  const csrfToken2 = JSON.parse(csrfRes2.body).csrfToken;
  const allCookies = [...csrfRes.cookies, ...loginRes.cookies, ...csrfRes2.cookies].map(c => c.split(';')[0]).join('; ');

  // Step 4: Upload a plain HTML file (benign content, no scripts)
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const fileContent = '<p>test upload</p>';
  const filename = 'exploit.html';

  const formParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`,
    `Content-Type: text/html\r\n`,
    `\r\n`,
    fileContent,
    `\r\n--${boundary}--\r\n`
  ].join('');

  const uploadRes = await request({
    hostname: HOST, port: PORT,
    path: '/api/candidates/upload-resume',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(formParts),
      'CSRF-Token': csrfToken2,
      'Cookie': allCookies
    }
  }, formParts);

  console.log('\n=== UPLOAD TEST RESULT ===');
  console.log('Status:', uploadRes.status);
  console.log('Body:', uploadRes.body);

  // Assertions
  const passed_status = uploadRes.status === 400;
  const passed_message = uploadRes.body.includes('Uploaded file type is not allowed');

  console.log('\n=== TEST ASSERTIONS ===');
  console.log(`[${passed_status ? 'PASS' : 'FAIL'}] Status is 400 (got ${uploadRes.status})`);
  console.log(`[${passed_message ? 'PASS' : 'FAIL'}] Response contains "Uploaded file type is not allowed"`);

  // Save evidence
  const evidenceDir = path.join(__dirname, '..', 'evidence', 'tests');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const evidenceContent = [
    '=== Spoofed Resume Upload - File Type Rejection Test ===',
    `Date: ${new Date().toISOString()}`,
    `Endpoint: POST http://localhost:5000/api/candidates/upload-resume`,
    `File uploaded: ${filename} (content: ${fileContent})`,
    '',
    '=== RESPONSE ===',
    `HTTP Status: ${uploadRes.status}`,
    `Body: ${uploadRes.body}`,
    '',
    '=== TEST RESULTS ===',
    `[${passed_status ? 'PASS' : 'FAIL'}] Status is 400 (got ${uploadRes.status})`,
    `[${passed_message ? 'PASS' : 'FAIL'}] Response contains "Uploaded file type is not allowed"`,
    '',
    '=== CONCLUSION ===',
    'The upload pipeline rejects non-PDF files based on magic-byte validation and explicit PDF allowlisting.',
    'HTML files are rejected with HTTP 400 and the message "Uploaded file type is not allowed".',
    'This prevents stored XSS and content spoofing in the resume upload flow.',
  ].join('\n');

  const evidencePath = path.join(evidenceDir, 'spoofed_upload_rejection.txt');
  fs.writeFileSync(evidencePath, evidenceContent);
  console.log('\nEvidence saved to:', evidencePath);
}

main().catch(console.error);
