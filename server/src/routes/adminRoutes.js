const express = require('express');
const router = express.Router();
const {
  getOverview,
  getStudents,
  updateStudent,
  getApplications,
  updateApplication,
  getEligibilityRules,
  getReports
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);
router.get('/applications', getApplications);
router.put('/applications/:id', updateApplication);
router.get('/rules', getEligibilityRules);
router.get('/reports', getReports);

module.exports = router;
