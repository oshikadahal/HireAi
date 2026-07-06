const asyncHandler = require('express-async-handler');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const notify = require('../utils/notify');
const { generateInterviewQuestions } = require('../services/matchService');
const { sendInterviewEmail } = require('../services/emailService');

// POST /api/interviews  (HR)
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const { applicationId, date, duration, meetingLink, type } = req.body;

  if (!applicationId || !date) {
    res.status(400);
    throw new Error('applicationId and date are required');
  }

  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('candidate', 'name email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to schedule this interview');
  }

  const aiQuestions = generateInterviewQuestions(application.job.title, application.job.skillsRequired);

  const interview = await Interview.create({
    application: application._id,
    candidate: application.candidate._id,
    recruiter: req.user._id,
    job: application.job._id,
    date,
    duration: duration || 60,
    meetingLink,
    type: type || 'video',
    aiQuestions,
  });

  application.status = 'interview';
  application.statusHistory.push({ status: 'interview', changedBy: req.user._id });
  await application.save();

  await notify({
    user: application.candidate._id,
    title: 'Interview scheduled',
    message: `Your interview for ${application.job.title} is set for ${new Date(date).toLocaleString()}`,
    type: 'interview',
    link: '/candidate/interviews',
  });

  sendInterviewEmail(application.candidate.email, application.candidate.name, application.job.title, date, meetingLink).catch(() => {});

  res.status(201).json({ success: true, interview });
});

// GET /api/interviews/candidate
exports.getCandidateInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ candidate: req.user._id })
    .populate('job', 'title location')
    .populate('recruiter', 'name')
    .sort({ date: 1 });
  res.json({ success: true, interviews });
});

// GET /api/interviews/hr
exports.getHRInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ recruiter: req.user._id })
    .populate('candidate', 'name email avatar')
    .populate('job', 'title')
    .sort({ date: 1 });
  res.json({ success: true, interviews });
});

// GET /api/interviews/shortlisted-pool  (HR - candidates eligible to be scheduled)
exports.getSchedulablePool = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).select('_id title');
  const jobIds = jobs.map((j) => j._id);
  const jobTitleMap = Object.fromEntries(jobs.map((j) => [j._id.toString(), j.title]));

  const applications = await Application.find({
    job: { $in: jobIds },
    status: { $in: ['shortlisted', 'screening'] },
  })
    .populate('candidate', 'name email avatar')
    .sort({ matchScore: -1 });

  const pool = applications.map((a) => ({
    _id: a._id,
    candidate: a.candidate,
    jobId: a.job,
    jobTitle: jobTitleMap[a.job.toString()] || 'Job',
    matchScore: a.matchScore,
  }));

  res.json({ success: true, pool });
});

// PUT /api/interviews/:id  (HR)
exports.updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!interview) {
    res.status(404);
    throw new Error('Interview not found or not authorized');
  }

  const allowed = ['date', 'duration', 'meetingLink', 'type', 'status', 'notes', 'feedback'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) interview[key] = req.body[key];
  }
  await interview.save();

  res.json({ success: true, interview });
});
