const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');
const {
  getCompanyProfile, updateCompanyProfile, getHRDashboard, getPublicCompany,
} = require('../controllers/companyController');

router.get('/:id/public', getPublicCompany);
router.get('/profile', protect, authorize('hr'), getCompanyProfile);
// Use secure upload middleware directly (drop-in) to validate content server-side
router.put('/profile', protect, authorize('hr'), uploadLogo, updateCompanyProfile);
router.get('/dashboard', protect, authorize('hr'), getHRDashboard);

module.exports = router;
