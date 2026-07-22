const onHeaders = require('on-headers');

// Simple request tracing middleware that scrubs common PII before logging.
module.exports = function traceLogging(req, res, next) {
  const start = Date.now();

  onHeaders(res, function () {
    const duration = Date.now() - start;
    try {
      const safeBody = { ...req.body };
      if (safeBody.password) safeBody.password = '[REDACTED]';
      if (safeBody.ssn) safeBody.ssn = '[REDACTED]';

      const entry = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: Object.keys(safeBody).length ? safeBody : undefined,
      };

      // Use console for simplicity; in production forward to structured logger.
      console.info('trace', JSON.stringify(entry));
    } catch (e) {
      // Do not throw logging errors
    }
  });

  next();
};
