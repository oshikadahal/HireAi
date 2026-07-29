const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { authenticator } = require('otplib');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');
const { sendWelcomeEmail } = require('../services/emailService');
const { bruteForceProtection, recordFailedAttempt } = require('../middleware/security');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15d' });

const sendAuthResponse = (res, statusCode, user, extra = {}) => {
  const token = signToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  res.status(statusCode).json({ success: true, token, user: user.toSafeObject(), ...extra });
};

const createActivity = async (userId, action, status, details, req, extra = {}) => {
  const alert = Boolean(extra.alert || (status === 'failed' && /login|mfa|reset|password/i.test(action)));
  const severity = extra.severity || (alert ? 'high' : status === 'failed' ? 'medium' : 'low');
  await ActivityLog.create({
    user: userId,
    action,
    status,
    details,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    severity,
    resource: extra.resource || 'auth',
    alert,
  }).catch(() => {});
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 12) return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
};

const passwordHasBeenUsed = async (user, password) => {
  if (!user || !password) return false;
  const history = user.passwordHistory || [];
  for (const previous of history) {
    if (previous && (await bcrypt.compare(password, previous))) return true;
  }
  return false;
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

exports.registerCandidate = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isString().isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    if (!validatePassword(password)) {
      res.status(400);
      throw new Error('Password must include uppercase, lowercase, number, and a special character');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error('An account with that email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'candidate',
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    await Candidate.create({ user: user._id });

    await createActivity(user._id, 'register_candidate', 'success', 'Candidate registered', req);
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    sendAuthResponse(res, 201, user);
  }),
];

exports.registerHR = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isString().isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, password, companyName, website, description } = req.body;

    if (!name || !email || !password || !companyName) {
      res.status(400);
      throw new Error('Name, email, password, and company name are required');
    }

    if (!validatePassword(password)) {
      res.status(400);
      throw new Error('Password must include uppercase, lowercase, number, and a special character');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error('An account with that email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'hr',
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    await Company.create({ user: user._id, companyName, website, description, isApproved: false });

    await createActivity(user._id, 'register_hr', 'success', 'HR registered', req);
    sendAuthResponse(res, 201, user, {
      message: 'Account created. Your company is pending admin approval before you can post jobs.',
    });
  }),
];

exports.login = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      res.status(423);
      throw new Error('Account temporarily locked. Try again later.');
    }

    if (!user || !(await user.matchPassword(password))) {
      if (user) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          user.loginAttempts = 0;
        }
        await user.save({ validateBeforeSave: false });
      }
      recordFailedAttempt(req);
      await createActivity(null, 'login', 'failed', 'Invalid login attempt', req, { resource: 'auth.login', alert: true, severity: 'high' });
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      await createActivity(user._id, 'login', 'failed', 'Deactivated account login attempt', req, { resource: 'auth.login', alert: true, severity: 'high' });
      res.status(403);
      throw new Error('This account has been deactivated. Contact support.');
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    if (!user.passwordExpiresAt || user.passwordExpiresAt <= new Date()) {
      user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
    await user.save({ validateBeforeSave: false });
    await createActivity(user._id, 'login', 'success', 'Successful login', req);
    sendAuthResponse(res, 200, user);
  }),
];

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.revokeSession = asyncHandler(async (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ success: true, message: 'Session invalidated' });
});

exports.changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 12 }).withMessage('New password must be at least 12 characters long'),
  validateRequest,
  asyncHandler(async (req, res) => {
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

    if (!validatePassword(newPassword)) {
      res.status(400);
      throw new Error('Password must include uppercase, lowercase, number, and a special character');
    }

    if (await passwordHasBeenUsed(user, newPassword)) {
      res.status(400);
      throw new Error('Please choose a password you have not used before');
    }

    const currentPasswordHash = user.password;
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    user.passwordHistory = [...(user.passwordHistory || []), currentPasswordHash].slice(-5);
    await user.save();
    await createActivity(user._id, 'change_password', 'success', 'Password changed', req);
    res.json({ success: true, message: 'Password updated successfully' });
  }),
];

exports.forgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    if (!user) {
      recordFailedAttempt(req);
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    console.log(`🔑 Password reset link for ${user.email}: ${resetUrl}`);

    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {}),
    });
  }),
];

exports.resetPassword = [
  body('password').isString().isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
      recordFailedAttempt(req);
      res.status(400);
      throw new Error('That reset link is invalid or has expired');
    }

    if (!validatePassword(password)) {
      res.status(400);
      throw new Error('Password must include uppercase, lowercase, number, and a special character');
    }

    if (await passwordHasBeenUsed(user, password)) {
      res.status(400);
      throw new Error('Please choose a password you have not used before');
    }

    const currentPasswordHash = user.password;
    user.password = password;
    user.passwordChangedAt = new Date();
    user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    user.passwordHistory = [...(user.passwordHistory || []), currentPasswordHash].slice(-5);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await createActivity(user._id, 'reset_password', 'success', 'Password reset', req);

    sendAuthResponse(res, 200, user);
  }),
];

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }
  const { publicPath } = require('../middleware/upload');
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: publicPath('avatars', req.file.filename) }, { new: true });
  res.json({ success: true, user: user.toSafeObject() });
});

exports.getCaptchaChallenge = asyncHandler(async (req, res) => {
  const challenge = `${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;
  res.json({ success: true, challenge, prompt: 'Enter the code shown below to prove you are human.' });
});

exports.enableMfa = asyncHandler(async (req, res) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(req.user.email, 'HireAI', secret);
  req.user.mfaSecret = secret;
  req.user.mfaEnabled = false;
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, secret, otpauth });
});

exports.verifyMfa = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error('MFA token is required');
  }
  const isValid = authenticator.check(token, req.user.mfaSecret || '');
  if (!isValid) {
    res.status(401);
    throw new Error('Invalid MFA token');
  }
  req.user.mfaEnabled = true;
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'MFA enabled successfully' });
});
