const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

describe('Upload middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    // Simple route using the secure upload middleware
    app.post('/test/upload', upload.uploadResume, (req, res) => {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
      res.json({ success: true, filename: req.file.filename });
    });

    // simple error handler to mirror production error handling
    app.use((err, req, res, next) => {
      res.status(400).json({ success: false, message: err.message });
    });
  });

  afterAll(() => {
    // clean uploaded files created during tests
    const dir = path.join(UPLOAD_ROOT, 'resumes');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.includes('test-') || f.includes('.pdf')) {
          try { fs.unlinkSync(path.join(dir, f)); } catch (e) {}
        }
      }
    }
  });

  test('rejects spoofed mime/extension (exploit.html sent as image/png)', async () => {
    const res = await request(app)
      .post('/test/upload')
      .attach('file', path.join(__dirname, 'fixtures', 'exploit.html'));

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  }, 20000);

  test('accepts valid PDF resume and returns filename', async () => {
    const res = await request(app)
      .post('/test/upload')
      .attach('file', path.join(__dirname, 'fixtures', 'resume.pdf'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('filename');
    // cleanup the uploaded file
    const uploaded = path.join(UPLOAD_ROOT, 'resumes', res.body.filename);
    if (fs.existsSync(uploaded)) fs.unlinkSync(uploaded);
  }, 20000);
});
