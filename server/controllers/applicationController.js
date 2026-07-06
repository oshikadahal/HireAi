const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const notify = require('../utils/notify');
const { scoreMatch } = require('../services/matchService');
const { sendApplicationConfirmEmail, sendStatusUpdateEmail } = require('../services/emailService');

const STATUS_MESSAGES = {
  screening: 'Your application is now being screened.',
  shortlisted: "Great news — you've been shortlisted!",
  interview: "You've been moved to the interview stage.",
  selected: '🎉 Congratulations — you have been selected!',
  hired: '🎉 Congratulations — you got the job!',
  rejected: 'The recruiter has decided not to move forward at this time.',
};

// POST /api/applications  (candidate)
exports.applyToJob = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!jobId) {
    res.status(400);
    throw new Error('jobId is required');
  }

  const already = await Application.findOne({ candidate: req.user._id, job: jobId });
  if (already) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  const job = await Job.findById(jobId).populate('company', 'companyName');
  if (!job || !job.isActive) {
    res.status(404);
    throw new Error('Job not found or no longer accepting applications');
  }

  const candidateProfile = await Candidate.findOne({ user: req.user._id });
  const candidateSkills = candidateProfile?.skills || [];

  const { score, matchedSkills, missingSkills } = await scoreMatch({
    candidateSkills,
    jobTitle: job.title,
    jobDescription: job.description,
    jobSkills: job.skillsRequired,
  });

  const application = await Application.create({
    candidate: req.user._id,
    job: jobId,
    coverLetter,
    matchScore: score,
    matchedSkills,
    missingSkills,
    statusHistory: [{ status: 'applied', changedBy: req.user._id }],
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

  await notify({
    user: job.postedBy,
    title: 'New application received',
    message: `${req.user.name} applied to ${job.title}`,
    type: 'application',
    link: `/hr/jobs/${job._id}/applicants`,
  });

  sendApplicationConfirmEmail(req.user.email, req.user.name, job.title, job.company?.companyName || 'the company').catch(() => {});

  res.status(201).json({ success: true, application });
});

// GET /api/applications/my  (candidate)
exports.getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({
      path: 'job',
      select: 'title location jobType salaryMin salaryMax currency company',
      populate: { path: 'company', select: 'companyName logo' },
    })
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

// GET /api/applications/:id
exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email avatar')
    .populate({
      path: 'job',
      select: 'title location salaryMin salaryMax currency skillsRequired postedBy company',
      populate: { path: 'company', select: 'companyName logo' },
    });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const isOwner = application.candidate._id.toString() === req.user._id.toString();
  const isRecruiter = application.job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && !isRecruiter && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this application');
  }

  res.json({ success: true, application });
});

// PUT /api/applications/:id/status  (HR, owner of job only)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const application = await Application.findById(req.params.id)
    .populate('job', 'title postedBy')
    .populate('candidate', 'name email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this application');
  }

  application.status = status;
  if (notes !== undefined) application.notes = notes;
  application.statusHistory.push({ status, changedBy: req.user._id });
  await application.save();

  if (STATUS_MESSAGES[status]) {
    await notify({
      user: application.candidate._id,
      title: `Application update: ${application.job.title}`,
      message: STATUS_MESSAGES[status],
      type: 'application',
      link: '/candidate/applications',
    });
    sendStatusUpdateEmail(application.candidate.email, application.candidate.name, application.job.title, status).catch(() => {});
  }

  res.json({ success: true, application });
});
