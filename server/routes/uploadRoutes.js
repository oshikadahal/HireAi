const path = require('path');
const express = require('express');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const FileType = require('file-type');

const router = express.Router();

// Helper to safely resolve file paths and avoid path traversal
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const safeJoin = (base, subfolder, filename) => {
  const resolved = path.resolve(base, subfolder, filename);
  if (!resolved.startsWith(path.resolve(base))) throw new Error('Invalid file path');
  return resolved;
};

// GET /api/uploads/:subfolder/:filename
// - Avatars and logos: served as public resources (inline images) with safe headers
// - Resumes: protected — only the owner or users with role 'admin' or 'hr' may download
router.get('/uploads/:subfolder/:filename', asyncHandler(async (req, res) => {
  const { subfolder, filename } = req.params;

  // disallow path traversal by ensuring filename is a basename
  if (filename !== path.basename(filename)) return res.status(400).json({ success: false, message: 'Invalid filename' });

  const absolutePath = safeJoin(UPLOAD_ROOT, subfolder, filename);

  // Check file exists
  if (!fs.existsSync(absolutePath)) return res.status(404).json({ success: false, message: 'File not found' });

  // For resumes, require authentication and ownership/admin/hr
  if (subfolder === 'resumes') {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    // Lazy lookup: candidate.resumeUrl contains the API path; matching by filename is sufficient
    const Candidate = require('../models/Candidate');
    const candidate = await Candidate.findOne({ resumeUrl: { $regex: filename + '$' } }).populate('user', 'role _id');

    if (!candidate) return res.status(404).json({ success: false, message: 'Resume owner not found' });

    const isOwner = candidate.user && candidate.user._id && candidate.user._id.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'hr'].includes(req.user.role);
    if (!isOwner && !isPrivileged) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Serve as attachment for privacy
    const detected = await FileType.fromFile(absolutePath);
    const contentType = detected?.mime || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    return fs.createReadStream(absolutePath).pipe(res);
  }

  // For avatars and logos: serve publicly but sanitize headers and force safe types
  if (['avatars', 'logos'].includes(subfolder)) {
    const detected = await FileType.fromFile(absolutePath);
    const contentType = detected?.mime || 'application/octet-stream';

    // Only allow image content types here
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Invalid content type' });
    }

    res.setHeader('Content-Type', contentType);
    // Inline for images so browser can render
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(absolutePath).pipe(res);
  }

  // Deny any other folders by default
  return res.status(403).json({ success: false, message: 'Access to this resource is not allowed' });
}));

module.exports = router;
