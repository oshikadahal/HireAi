const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadLogo } = require('../middleware/upload');
const {
  getDashboard, getAllUsers, toggleUserStatus,
  getPendingCompanies, getAllCompanies, approveCompany, toggleCompanyApproval, createCompany,
} = require('../controllers/adminController');
const {
  getAllJobsAdmin, getJobByIdAdmin, createJobAdmin, updateJobAdmin, deleteJobAdmin,
  getApplicantsAdmin, updateApplicationStatusAdmin,
} = require('../controllers/adminJobController');

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Companies
router.get('/companies/pending', getPendingCompanies);
router.get('/companies', getAllCompanies);
router.post('/companies', uploadLogo.single('logo'), createCompany);
router.put('/companies/:id/approve', approveCompany);
router.put('/companies/:id/toggle-approval', toggleCompanyApproval);

// Jobs (full platform-wide management)
router.get('/jobs', getAllJobsAdmin);
router.get('/jobs/:id', getJobByIdAdmin);
router.post('/jobs', createJobAdmin);
router.put('/jobs/:id', updateJobAdmin);
router.delete('/jobs/:id', deleteJobAdmin);
router.get('/jobs/:id/applicants', getApplicantsAdmin);

// Applications
router.put('/applications/:id/status', updateApplicationStatusAdmin);

module.exports = router;
