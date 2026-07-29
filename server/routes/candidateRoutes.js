const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadResume: uploadResumeCtrl, getDashboardStats,
  exportProfile, importProfile,
} = require('../controllers/candidateController');

router.use(protect, authorize('candidate'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/export-profile', exportProfile);
router.post('/import-profile', importProfile);
// Use the secure upload middleware directly (drop-in) — previously multer-style .single('resume') was used
router.post('/upload-resume', uploadResume, uploadResumeCtrl);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
