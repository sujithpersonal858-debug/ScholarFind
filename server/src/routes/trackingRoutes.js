const express = require('express');
const router = express.Router();
const {
  getSavedScholarships,
  saveScholarship,
  removeSavedScholarship,
  getTrackingList,
  updateTrackingStatus,
  getStudentSummary
} = require('../controllers/trackingController');
const { protect, requireStudent } = require('../middleware/authMiddleware');

// Saved scholarships endpoints
router.get('/saved', protect, requireStudent, getSavedScholarships);
router.post('/saved', protect, requireStudent, saveScholarship);
router.delete('/saved/:scholarshipId', protect, requireStudent, removeSavedScholarship);

// Application tracking endpoints
router.get('/status', protect, requireStudent, getTrackingList);
router.post('/status', protect, requireStudent, updateTrackingStatus);

// Student dashboard summary endpoint
router.get('/summary', protect, requireStudent, getStudentSummary);

module.exports = router;
