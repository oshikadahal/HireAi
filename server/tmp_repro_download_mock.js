const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create a mocked Candidate module in require cache before requiring routes
const mockCandidate = { findOne: () => Promise.resolve({ user: { _id: { toString: () => 'owner-id' }, role: 'candidate' } }) };
const candidatePath = require.resolve('./models/Candidate');
require.cache[candidatePath] = { id: candidatePath, filename: candidatePath, loaded: true, exports: mockCandidate };

const uploadRoutes = require('./routes/uploadRoutes');
const UPLOAD_ROOT = path.join(__dirname, 'uploads');
const filename = 'test-download-file.pdf';
const resumeDir = path.join(UPLOAD_ROOT, 'resumes');
const filePath = path.join(resumeDir, filename);
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
fs.writeFileSync(filePath, 'PDFDATA');

const app = express();
app.use((req, res, next) => { req.user = { _id: 'owner-id', role: 'candidate' }; next(); });
app.use('/api', uploadRoutes);
app.use((err, req, res, next) => { console.error('ERR HANDLER', err && err.message); res.status(500).json({ success: false, message: err && err.message }); });

(async()=>{
  const res = await request(app).get(`/api/uploads/resumes/${filename}`);
  console.log('STATUS', res.status);
  console.log('BODY', res.body);
})();
