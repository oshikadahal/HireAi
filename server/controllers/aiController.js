const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const { recommendJobs, generateInterviewQuestions } = require('../services/matchService');

// GET /api/ai/recommend-jobs  (candidate)
exports.getRecommendations = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne({ user: req.user._id });
  const skills = candidate?.skills || [];

  const appliedJobIds = (await Application.find({ candidate: req.user._id }).select('job')).map((a) => a.job);

  const openJobs = await Job.find({ isActive: true })
    .populate('company', 'companyName logo')
    .limit(100);

  const ranked = recommendJobs(skills, openJobs, appliedJobIds, 6);

  res.json({
    success: true,
    recommendations: ranked.map((r) => ({ job: r.job, score: r.score, matchedSkills: r.matchedSkills })),
  });
});

// POST /api/ai/generate-questions  (HR — standalone tool, not tied to a saved interview)
exports.generateQuestions = asyncHandler(async (req, res) => {
  const { jobTitle, skills = [] } = req.body;
  if (!jobTitle) {
    res.status(400);
    throw new Error('jobTitle is required');
  }
  const questions = generateInterviewQuestions(jobTitle, skills);
  res.json({ success: true, questions });
});
