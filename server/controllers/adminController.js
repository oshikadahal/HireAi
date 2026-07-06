const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const notify = require('../utils/notify');

// GET /api/admin/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalCandidates, totalHR, totalCompanies,
    totalJobs, totalApplications, pendingCompanies,
    recentUsers, recentJobs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'hr' }),
    Company.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments({ isApproved: false }),
    User.find().sort({ createdAt: -1 }).limit(6).select('name email role createdAt'),
    Job.find().sort({ createdAt: -1 }).limit(6).populate('company', 'companyName'),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyRegistrationsRaw = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalCandidates, totalHR, totalCompanies, totalJobs, totalApplications, pendingCompanies },
    recentUsers,
    recentJobs,
    monthlyRegistrations: monthlyRegistrationsRaw,
  });
});

// GET /api/admin/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
  ]);

  res.json({ success: true, users, total, page: pageNum, pages: Math.max(1, Math.ceil(total / limitNum)) });
});

// PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admin accounts cannot be deactivated');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: user.toSafeObject() });
});

// GET /api/admin/companies/pending
exports.getPendingCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ isApproved: false }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, companies });
});

// GET /api/admin/companies
exports.getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, companies });
});

// PUT /api/admin/companies/:id/approve
exports.approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).populate('user', 'name email');
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // House companies (created directly by admin) have no linked HR user to notify
  if (company.user?._id) {
    await notify({
      user: company.user._id,
      title: 'Company approved! 🎉',
      message: `${company.companyName} has been approved. You can now post jobs.`,
      type: 'company',
      link: '/hr',
    });
  }

  res.json({ success: true, message: 'Company approved', company });
});

// PUT /api/admin/companies/:id/toggle-approval
exports.toggleCompanyApproval = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('user', 'name email');
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }
  company.isApproved = !company.isApproved;
  await company.save();

  if (company.isApproved && company.user?._id) {
    await notify({
      user: company.user._id,
      title: 'Company approved! 🎉',
      message: `${company.companyName} has been approved. You can now post jobs.`,
      type: 'company',
      link: '/hr',
    });
  }

  res.json({ success: true, message: `Company ${company.isApproved ? 'approved' : 'unapproved'}`, company });
});

// POST /api/admin/companies — admin creates a "house" company directly (no HR account required)
exports.createCompany = asyncHandler(async (req, res) => {
  const { companyName, website, description, industry, size, location } = req.body;
  if (!companyName) {
    res.status(400);
    throw new Error('Company name is required');
  }

  const { publicPath } = require('../middleware/upload');
  const company = await Company.create({
    companyName,
    website,
    description,
    industry,
    size,
    location,
    isApproved: true, // admin-created companies don't need self-approval
    createdByAdmin: true,
    ...(req.file ? { logo: publicPath('logos', req.file.filename) } : {}),
  });

  res.status(201).json({ success: true, company });
});
