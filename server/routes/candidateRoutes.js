const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadResume: uploadResumeCtrl, getDashboardStats,
} = require('../controllers/candidateController');

router.use(protect, authorize('candidate'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-resume', uploadResume.single('resume'), uploadResumeCtrl);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
