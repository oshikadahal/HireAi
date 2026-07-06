const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  scheduleInterview, getCandidateInterviews, getHRInterviews, updateInterview, getSchedulablePool,
} = require('../controllers/interviewController');

router.post('/', protect, authorize('hr'), scheduleInterview);
router.get('/candidate', protect, authorize('candidate'), getCandidateInterviews);
router.get('/hr', protect, authorize('hr'), getHRInterviews);
router.get('/schedulable-pool', protect, authorize('hr'), getSchedulablePool);
router.put('/:id', protect, authorize('hr'), updateInterview);

module.exports = router;
