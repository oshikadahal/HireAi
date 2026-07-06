const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Company = require('../models/Company');
const { sendWelcomeEmail } = require('../services/emailService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendAuthResponse = (res, statusCode, user, extra = {}) => {
  res.status(statusCode).json({
    success: true,
    token: signToken(user._id),
    user: user.toSafeObject(),
    ...extra,
  });
};

// POST /api/auth/register/candidate
exports.registerCandidate = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({ name, email, password, phone, role: 'candidate' });
  await Candidate.create({ user: user._id });

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  sendAuthResponse(res, 201, user);
});

// POST /api/auth/register/hr
exports.registerHR = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, website, description } = req.body;

  if (!name || !email || !password || !companyName) {
    res.status(400);
    throw new Error('Name, email, password, and company name are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({ name, email, password, role: 'hr' });
  await Company.create({ user: user._id, companyName, website, description, isApproved: false });

  sendAuthResponse(res, 201, user, {
    message: 'Account created. Your company is pending admin approval before you can post jobs.',
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact support.');
  }

  sendAuthResponse(res, 200, user);
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }

  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way whether or not the user exists (avoid leaking which emails are registered)
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  console.log(`🔑 Password reset link for ${user.email}: ${resetUrl}`);

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
    // Included only so local/dev testing works without email configured:
    ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {}),
  });
});

// POST /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('That reset link is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendAuthResponse(res, 200, user);
});

// POST /api/auth/upload-avatar
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }
  const { publicPath } = require('../middleware/upload');
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: publicPath('avatars', req.file.filename) },
    { new: true }
  );
  res.json({ success: true, user: user.toSafeObject() });
});
