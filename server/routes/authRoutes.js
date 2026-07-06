const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  registerCandidate, registerHR, login, getMe, changePassword,
  forgotPassword, resetPassword, uploadAvatar: uploadAvatarCtrl,
} = require('../controllers/authController');

router.post('/register/candidate', registerCandidate);
router.post('/register/hr', registerHR);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/upload-avatar', protect, uploadAvatar.single('avatar'), uploadAvatarCtrl);

module.exports = router;
