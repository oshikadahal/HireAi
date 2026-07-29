const path = require('path');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
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

const validateProfileRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

const sanitizeProfileUpdate = (body) => {
  const allowed = ['headline', 'bio', 'skills', 'education', 'experience', 'github', 'linkedin', 'portfolio', 'location'];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'skills') {
        updates[key] = Array.isArray(body[key]) ? body[key].slice(0, 30).map((s) => String(s).trim()).filter(Boolean) : [];
      } else if (['education', 'experience'].includes(key)) {
        updates[key] = Array.isArray(body[key]) ? body[key].slice(0, 10) : [];
      } else if (typeof body[key] === 'string') {
        updates[key] = body[key].trim();
      } else {
        updates[key] = body[key];
      }
    }
  }
  return updates;
};

// PUT /api/candidates/profile
exports.updateProfile = [
  body('headline').optional().isString().isLength({ max: 120 }).withMessage('Headline is too long'),
  body('bio').optional().isString().isLength({ max: 2000 }).withMessage('Bio is too long'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('education').optional().isArray().withMessage('Education must be an array'),
  body('experience').optional().isArray().withMessage('Experience must be an array'),
  validateProfileRequest,
  asyncHandler(async (req, res) => {
    const updates = sanitizeProfileUpdate(req.body);
    const profile = await Candidate.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true, upsert: true }
    ).populate('user', 'name email phone avatar');

    res.json({ success: true, profile });
  }),
];

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

// GET /api/candidates/export-profile
exports.exportProfile = asyncHandler(async (req, res) => {
  const profile = await Candidate.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: {
      headline: profile.headline || '',
      bio: profile.bio || '',
      skills: profile.skills || [],
      education: profile.education || [],
      experience: profile.experience || [],
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      portfolio: profile.portfolio || '',
      location: profile.location || '',
      resumeUrl: profile.resumeUrl || '',
    },
  };

  res.json({ success: true, export: exportPayload });
});

// POST /api/candidates/import-profile
exports.importProfile = [
  body('profile').isObject().withMessage('Profile payload must be an object'),
  validateProfileRequest,
  asyncHandler(async (req, res) => {
    const payload = req.body.profile;
    const allowed = ['headline', 'bio', 'skills', 'education', 'experience', 'github', 'linkedin', 'portfolio', 'location'];
    const updates = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        if (key === 'skills') {
          updates[key] = Array.isArray(payload[key]) ? payload[key].slice(0, 30).map((s) => String(s).trim()).filter(Boolean) : [];
        } else if (['education', 'experience'].includes(key)) {
          updates[key] = Array.isArray(payload[key]) ? payload[key].slice(0, 10) : [];
        } else if (typeof payload[key] === 'string') {
          updates[key] = payload[key].trim();
        } else {
          updates[key] = payload[key];
        }
      }
    }

    const profile = await Candidate.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true, upsert: true }
    ).populate('user', 'name email phone avatar');

    res.json({ success: true, profile, message: 'Profile imported securely' });
  }),
];

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
