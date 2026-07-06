const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyToJob, getMyApplications, updateStatus, getApplicationById,
} = require('../controllers/applicationController');

router.post('/', protect, authorize('candidate'), applyToJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, authorize('hr'), updateStatus);

module.exports = router;
