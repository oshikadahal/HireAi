const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
};

/** Verifies the JWT and attaches req.user. */
exports.protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    await ActivityLog.create({
      action: 'auth_failed',
      status: 'failed',
      details: 'Invalid or expired token',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});
    res.status(401);
    throw new Error('Not authorized — invalid or expired token');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('Not authorized — user no longer exists');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  req.user = user;
  req.session = {
    ...req.session,
    userId: user._id.toString(),
    role: user.role,
    lastActivityAt: new Date().toISOString(),
  };
  next();
});

/** Restricts a route to one or more roles. Use AFTER protect. */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' cannot access this resource`);
  }
  next();
};

exports.requireOwnership = (resourceUserField = 'user') => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const ownerId = req.params[resourceUserField] || req.body?.[resourceUserField];
  if (req.user.role === 'admin' || req.user.role === 'hr') {
    return next();
  }

  if (ownerId && ownerId.toString() === req.user._id.toString()) {
    return next();
  }

  res.status(403);
  throw new Error('You can only access your own resources');
};

exports.logActivity = asyncHandler(async (req, res, next) => {
  res.on('finish', async () => {
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: req.originalMethod || req.method,
        status: res.statusCode >= 400 ? 'failed' : 'success',
        details: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(() => {});
    }
  });
  next();
});
