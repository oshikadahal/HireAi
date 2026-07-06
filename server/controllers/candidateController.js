const path = require('path');
const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const { publicPath } = require('../middleware/upload');
const { parseResumeFile } = require('../services/resumeParser');

// GET /api/candidates/profile
exports.getProfile = asyncHandler(async (req, res) => {
  let profile = await Candidate.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
  if (!profile) {
    // Self-heal: a candidate user without a profile doc (shouldn't normally happen)
    profile = await Candidate.create({ user: req.user._id });
    profile = await Candidate.findById(profile._id).populate('user', 'name email phone avatar');
  }
  res.json({ success: true, profile });
});

// PUT /api/candidates/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['headline', 'bio', 'skills', 'education', 'experience', 'github', 'linkedin', 'portfolio', 'location'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const profile = await Candidate.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true, upsert: true }
  ).populate('user', 'name email phone avatar');

  res.json({ success: true, profile });
});

// POST /api/candidates/upload-resume
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF resume');
  }

  const resumeUrl = publicPath('resumes', req.file.filename);
  const absolutePath = path.join(__dirname, '..', 'uploads', 'resumes', req.file.filename);

  const parsed = await parseResumeFile(absolutePath);

  const existing = await Candidate.findOne({ user: req.user._id });
  const mergedSkills = Array.from(
    new Set([...(existing?.skills || []), ...parsed.skills])
  );

  const profile = await Candidate.findOneAndUpdate(
    { user: req.user._id },
    {
      resumeUrl,
      resumeText: parsed.rawText,
      parsedSkills: parsed.skills,
      lastParsedAt: new Date(),
      skills: mergedSkills,
    },
    { new: true, upsert: true }
  ).populate('user', 'name email phone avatar');

  res.json({
    success: true,
    resumeUrl,
    parsed: { skills: parsed.skills, education: parsed.education, experience: parsed.experience },
    profile,
  });
});

// GET /api/candidates/dashboard-stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id });
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    screening: applications.filter((a) => a.status === 'screening').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    selected: applications.filter((a) => ['selected', 'hired'].includes(a.status)).length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };
  res.json({ success: true, stats });
});
