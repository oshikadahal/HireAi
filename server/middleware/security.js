const rateLimit = require('express-rate-limit');

const createLimiter = (options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
    ...options,
  });

const bruteForceStore = new Map();
const BLOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 6;

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getAllowedIps = () => (process.env.ALLOWED_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

const resetBruteForceStore = () => bruteForceStore.clear();

const recordFailedAttempt = (req) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = bruteForceStore.get(ip) || { count: 0, firstFailedAt: now };
  record.count += 1;
  record.firstFailedAt = record.firstFailedAt || now;
  bruteForceStore.set(ip, record);
  return record;
};

const bruteForceProtection = (req, res, next) => {
  const ip = getClientIp(req);
  const record = bruteForceStore.get(ip);
  if (!record) return next();

  if (record.count >= MAX_FAILED_ATTEMPTS && Date.now() - record.firstFailedAt < BLOCK_WINDOW_MS) {
    res.status(429).set('Retry-After', String(Math.ceil((BLOCK_WINDOW_MS - (Date.now() - record.firstFailedAt)) / 1000))).json({
      success: false,
      message: 'Too many failed authentication attempts. Access temporarily blocked for this IP.',
    });
    return;
  }

  if (Date.now() - record.firstFailedAt >= BLOCK_WINDOW_MS) {
    bruteForceStore.delete(ip);
  }

  return next();
};

const ipAccessControl = (req, res, next) => {
  const allowedIps = getAllowedIps();
  if (!allowedIps.length) return next();

  const ip = getClientIp(req);
  if (!allowedIps.includes(ip)) {
    res.status(403).json({ success: false, message: 'Access denied for this IP address.' });
    return;
  }

  next();
};

exports.generalLimiter = createLimiter();

exports.authLimiter = createLimiter({
  max: 20,
  message: { success: false, message: 'Too many login/signup attempts. Try again in 15 minutes.' },
});

exports.passwordResetLimiter = createLimiter({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' },
});

exports.loginAttemptLimiter = createLimiter({
  max: 8,
  windowMs: 15 * 60 * 1000,
  message: { success: false, message: 'Too many login attempts. Please try again shortly.' },
});

exports.bruteForceProtection = bruteForceProtection;
exports.ipAccessControl = ipAccessControl;
exports.recordFailedAttempt = recordFailedAttempt;
exports.resetBruteForceStore = resetBruteForceStore;
exports.getClientIp = getClientIp;
exports.getAllowedIps = getAllowedIps;
