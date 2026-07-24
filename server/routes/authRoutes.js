const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  registerCandidate, registerHR, login, logout, getMe, changePassword,
  forgotPassword, resetPassword, uploadAvatar: uploadAvatarCtrl,
  enableMfa, verifyMfa,
} = require('../controllers/authController');

router.post('/register/candidate', registerCandidate);
router.post('/register/hr', registerHR);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
// Use secure upload middleware directly (drop-in) to validate content server-side
router.post('/upload-avatar', protect, uploadAvatar, uploadAvatarCtrl);
router.post('/mfa/enable', protect, enableMfa);
router.post('/mfa/verify', protect, verifyMfa);

module.exports = router;
