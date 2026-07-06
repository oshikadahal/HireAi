const asyncHandler = require('express-async-handler');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { publicPath } = require('../middleware/upload');

// GET /api/companies/profile  (HR)
exports.getCompanyProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }
  res.json({ success: true, company });
});

// PUT /api/companies/profile  (HR) - also accepts an optional logo file
exports.updateCompanyProfile = asyncHandler(async (req, res) => {
  const allowed = ['companyName', 'website', 'description', 'industry', 'size', 'location'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.file) {
    updates.logo = publicPath('logos', req.file.filename);
  }

  const company = await Company.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  res.json({ success: true, company });
});

// GET /api/companies/dashboard  (HR)
exports.getHRDashboard = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });

  const [totalJobs, activeJobs] = await Promise.all([
    Job.countDocuments({ postedBy: req.user._id }),
    Job.countDocuments({ postedBy: req.user._id, isActive: true }),
  ]);

  const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  const [totalApplications, totalInterviews, applicationsByStatus] = await Promise.all([
    Application.countDocuments({ job: { $in: jobIds } }),
    Interview.countDocuments({ recruiter: req.user._id }),
    Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    company,
    stats: { totalJobs, activeJobs, totalApplications, totalInterviews },
    applicationsByStatus,
  });
});

// GET /api/companies/:id/public  (public company page)
exports.getPublicCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).select(
    'companyName logo website description industry size location isApproved'
  );
  if (!company || !company.isApproved) {
    res.status(404);
    throw new Error('Company not found');
  }
  const jobs = await Job.find({ company: company._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, company, jobs });
});
