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
