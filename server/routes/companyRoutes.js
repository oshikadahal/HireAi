const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');
const {
  getCompanyProfile, updateCompanyProfile, getHRDashboard, getPublicCompany,
} = require('../controllers/companyController');

router.get('/:id/public', getPublicCompany);
router.get('/profile', protect, authorize('hr'), getCompanyProfile);
router.put('/profile', protect, authorize('hr'), uploadLogo.single('logo'), updateCompanyProfile);
router.get('/dashboard', protect, authorize('hr'), getHRDashboard);

module.exports = router;
