const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getRecommendations, generateQuestions } = require('../controllers/aiController');

router.get('/recommend-jobs', protect, authorize('candidate'), getRecommendations);
router.post('/generate-questions', protect, authorize('hr'), generateQuestions);

module.exports = router;
