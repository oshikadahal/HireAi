const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');

// GET /api/jobs  (public, filterable, paginated)
exports.getJobs = asyncHandler(async (req, res) => {
  const {
    search, location, category, jobType, experience,
    minSalary, maxSalary, page = 1, limit = 12,
  } = req.query;

  const query = { isActive: true };
  if (search) query.$text = { $search: search };
  if (location) query.location = { $regex: location, $options: 'i' };
  if (category) query.category = category;
  if (jobType) query.jobType = jobType;
  if (experience) query.experience = experience;
  if (minSalary) query.salaryMin = { $gte: Number(minSalary) };
  if (maxSalary) query.salaryMax = { $lte: Number(maxSalary) };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  const [total, jobs] = await Promise.all([
    Job.countDocuments(query),
    Job.find(query)
      .populate('company', 'companyName logo location isApproved')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    jobs,
    total,
    page: pageNum,
    pages: Math.max(1, Math.ceil(total / limitNum)),
  });
});

// GET /api/jobs/my-jobs  (HR)
exports.getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

// GET /api/jobs/:id  (public)
exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'companyName logo website description location industry size')
    .populate('postedBy', 'name');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json({ success: true, job });
});

// POST /api/jobs  (HR, company must be approved)
exports.createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }
  if (!company.isApproved) {
    res.status(403);
    throw new Error('Your company is awaiting admin approval before you can post jobs');
  }

  const { title, description, skillsRequired } = req.body;
  if (!title || !description || !Array.isArray(skillsRequired) || skillsRequired.length === 0) {
    res.status(400);
    throw new Error('Title, description, and at least one required skill are needed');
  }

  const job = await Job.create({
    ...req.body,
    company: company._id,
    postedBy: req.user._id,
  });

  res.status(201).json({ success: true, job });
});

// PUT /api/jobs/:id  (HR, owner only)
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found or you do not have permission to edit it');
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

// DELETE /api/jobs/:id  (HR, owner only)
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found or you do not have permission to delete it');
  }
  await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: 'Job deleted' });
});

// GET /api/jobs/:id/applicants  (HR, owner only)
exports.getApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found or you do not have permission to view its applicants');
  }

  const applications = await Application.find({ job: job._id })
    .populate('candidate', 'name email avatar')
    .sort({ matchScore: -1, createdAt: -1 });

  res.json({ success: true, job, applications });
});
