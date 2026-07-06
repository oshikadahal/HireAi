const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAssessment, getMyAssessments, getAssessmentsByJob, getAssessmentToTake,
  submitAssessment, getMyResults, getAssessmentResults,
} = require('../controllers/assessmentController');

router.post('/', protect, authorize('hr'), createAssessment);
router.get('/my-created', protect, authorize('hr'), getMyAssessments);
router.get('/my-results', protect, authorize('candidate'), getMyResults);
router.get('/job/:jobId', protect, getAssessmentsByJob);
router.get('/:id/take', protect, authorize('candidate'), getAssessmentToTake);
router.post('/:id/submit', protect, authorize('candidate'), submitAssessment);
router.get('/:id/results', protect, authorize('hr'), getAssessmentResults);

module.exports = router;
