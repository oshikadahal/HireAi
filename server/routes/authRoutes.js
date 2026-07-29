const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { bruteForceProtection, ipAccessControl } = require('../middleware/security');
const {
  registerCandidate, registerHR, login, logout, revokeSession, getMe, changePassword,
  forgotPassword, resetPassword, uploadAvatar: uploadAvatarCtrl,
  enableMfa, verifyMfa, getCaptchaChallenge,
} = require('../controllers/authController');

router.use(ipAccessControl);
router.post('/register/candidate', bruteForceProtection, registerCandidate);
router.post('/register/hr', bruteForceProtection, registerHR);
router.post('/login', bruteForceProtection, login);
router.post('/logout', protect, logout);
router.post('/session/revoke', protect, revokeSession);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', bruteForceProtection, forgotPassword);
router.post('/reset-password/:token', bruteForceProtection, resetPassword);
router.get('/captcha', getCaptchaChallenge);
// Use secure upload middleware directly (drop-in) to validate content server-side
router.post('/upload-avatar', protect, uploadAvatar, uploadAvatarCtrl);
router.post('/mfa/enable', protect, enableMfa);
router.post('/mfa/verify', protect, verifyMfa);

module.exports = router;
