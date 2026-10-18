const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  getAllScholarships,
  getScholarshipById,
  getRecommendations,
  createScholarship,
  updateScholarship,
  deleteScholarship
} = require('../controllers/scholarshipController');
const { protect, requireAdmin, requireStudent, JWT_SECRET } = require('../middleware/authMiddleware');

// Optional auth middleware: extracts user token if available without blocking if absent
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // invalid token, proceed as guest
    }
  }
  next();
};

// Public or enhanced routes
router.get('/', optionalAuth, getAllScholarships);
router.get('/recommendations', protect, requireStudent, getRecommendations);
router.get('/:id', optionalAuth, getScholarshipById);

// Admin-only management routes
router.post('/', protect, requireAdmin, createScholarship);
router.put('/:id', protect, requireAdmin, updateScholarship);
router.delete('/:id', protect, requireAdmin, deleteScholarship);

module.exports = router;
