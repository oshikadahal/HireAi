const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const uploadRoutes = require('../routes/uploadRoutes');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

jest.mock('../models/Candidate');
const Candidate = require('../models/Candidate');

describe('Upload download routes', () => {
  let app;
  const filename = 'test-download-file.pdf';
  const resumeDir = path.join(UPLOAD_ROOT, 'resumes');
  const filePath = path.join(resumeDir, filename);

  beforeAll(() => {
    // ensure upload path exists and create a dummy file
    if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
    fs.writeFileSync(filePath, 'PDFDATA');

    app = express();

    // middleware to simulate authentication and set req.user
    app.use((req, res, next) => {
      // default: user id 'owner-id' and role 'candidate'
      req.user = { _id: 'owner-id', role: 'candidate' };
      next();
    });

    // mount the uploadRoutes
    app.use('/api', uploadRoutes);

    // error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  afterAll(() => {
    // cleanup file
    try { fs.unlinkSync(filePath); } catch (e) {}
  });

  test('owner can download their resume', async () => {
    // Candidate.findOne should return a candidate with user._id = 'owner-id'
    Candidate.findOne.mockResolvedValue({
      user: { _id: { toString: () => 'owner-id' }, role: 'candidate' },
    });

    const res = await request(app).get(`/api/uploads/resumes/${filename}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  test('non-owner without privilege is forbidden', async () => {
    // set req.user to different id by mounting a middleware specifically for this request
    const app2 = express();
    app2.use((req, res, next) => { req.user = { _id: 'other-id', role: 'candidate' }; next(); });
    app2.use('/api', uploadRoutes);

    Candidate.findOne.mockResolvedValue({ user: { _id: { toString: () => 'owner-id' }, role: 'candidate' } });

    const res = await request(app2).get(`/api/uploads/resumes/${filename}`);
    expect(res.status).toBe(403);
  });

  test('hr/admin can download any resume', async () => {
    const app3 = express();
    app3.use((req, res, next) => { req.user = { _id: 'someone', role: 'hr' }; next(); });
    app3.use('/api', uploadRoutes);

    Candidate.findOne.mockResolvedValue({ user: { _id: { toString: () => 'owner-id' }, role: 'candidate' } });

    const res = await request(app3).get(`/api/uploads/resumes/${filename}`);
    expect(res.status).toBe(200);
  });
});
