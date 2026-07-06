const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs, getApplicants,
} = require('../controllers/jobController');

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('hr'), getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('hr'), createJob);
router.put('/:id', protect, authorize('hr'), updateJob);
router.delete('/:id', protect, authorize('hr'), deleteJob);
router.get('/:id/applicants', protect, authorize('hr'), getApplicants);

module.exports = router;
