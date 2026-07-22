// Optional session binding middleware — verifies a device fingerprint stored in session
module.exports = function sessionBinding(req, res, next) {
  // This middleware expects req.session.deviceFingerprint to be set on login
  if (req.user && req.session) {
    const fingerprint = req.get('user-agent') || 'unknown';
    if (!req.session.deviceFingerprint) req.session.deviceFingerprint = fingerprint;
    if (req.session.deviceFingerprint !== fingerprint) {
      // Possible session theft — invalidate
      req.session.regenerate(() => {});
      return res.status(401).json({ success: false, message: 'Session invalidated' });
    }
  }
  next();
};
