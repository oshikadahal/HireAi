const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const notify = require('../utils/notify');
const { sendStatusUpdateEmail } = require('../services/emailService');

const STATUS_MESSAGES = {
  screening: 'Your application is now being screened.',
  shortlisted: "Great news — you've been shortlisted!",
  interview: "You've been moved to the interview stage.",
  selected: '🎉 Congratulations — you have been selected!',
  hired: '🎉 Congratulations — you got the job!',
  rejected: 'The recruiter has decided not to move forward at this time.',
};

// GET /api/admin/jobs — every job on the platform, regardless of who posted it
exports.getAllJobsAdmin = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [total, jobs] = await Promise.all([
    Job.countDocuments(query),
    Job.find(query)
      .populate('company', 'companyName logo isApproved')
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({ success: true, jobs, total, page: pageNum, pages: Math.max(1, Math.ceil(total / limitNum)) });
});

// GET /api/admin/jobs/:id — single job, no ownership restriction
exports.getJobByIdAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'companyName logo').populate('postedBy', 'name role');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json({ success: true, job });
});

// POST /api/admin/jobs — admin posts a job on behalf of any company, bypassing approval checks
exports.createJobAdmin = asyncHandler(async (req, res) => {
  const { companyId, title, description, skillsRequired } = req.body;

  if (!companyId) {
    res.status(400);
    throw new Error('companyId is required — pick a company or create one first');
  }
  if (!title || !description || !Array.isArray(skillsRequired) || skillsRequired.length === 0) {
    res.status(400);
    throw new Error('Title, description, and at least one required skill are needed');
  }

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const job = await Job.create({
    ...req.body,
    company: company._id,
    postedBy: req.user._id, // attributed to the admin who created it
  });

  res.status(201).json({ success: true, job });
});

// PUT /api/admin/jobs/:id — admin can edit any job, regardless of who posted it
exports.updateJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const allowed = [
    'title', 'description', 'skillsRequired', 'salaryMin', 'salaryMax', 'currency',
    'experience', 'location', 'jobType', 'category', 'isActive', 'deadline',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) job[key] = req.body[key];
  }
  await job.save();

  res.json({ success: true, job });
});

// DELETE /api/admin/jobs/:id — admin can delete any job
exports.deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: 'Job deleted' });
});

// GET /api/admin/jobs/:id/applicants — admin can view applicants for any job
exports.getApplicantsAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'companyName');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const applications = await Application.find({ job: job._id })
    .populate('candidate', 'name email avatar')
    .sort({ matchScore: -1, createdAt: -1 });

  res.json({ success: true, job, applications });
});

// PUT /api/admin/applications/:id/status — admin can update status on any application
exports.updateApplicationStatusAdmin = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const application = await Application.findById(req.params.id)
    .populate('job', 'title')
    .populate('candidate', 'name email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
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
