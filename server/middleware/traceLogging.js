const onHeaders = require('on-headers');

const redactSensitive = (value) => {
  if (typeof value !== 'object' || value === null) return value;
  const clone = { ...value };
  for (const key of Object.keys(clone)) {
    if (/password|token|secret|authorization|cookie|session/i.test(key)) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = redactSensitive(clone[key]);
    }
  }
  return clone;
};

// Simple request tracing middleware that scrubs common PII before logging.
module.exports = function traceLogging(req, res, next) {
  const start = Date.now();

  onHeaders(res, function () {
    const duration = Date.now() - start;
    try {
      const safeBody = redactSensitive(req.body || {});
      const entry = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: Object.keys(safeBody).length ? safeBody : undefined,
      };

      if (res.statusCode >= 500 || /auth|login|mfa|reset|token/i.test(req.originalUrl)) {
        entry.alert = true;
      }

      console.info('trace', JSON.stringify(entry));
    } catch (e) {
      // Do not throw logging errors
    }
  });

  next();
};
