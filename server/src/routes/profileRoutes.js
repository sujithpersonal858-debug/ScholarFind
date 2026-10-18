const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile } = require('../controllers/profileController');
const { protect, requireStudent } = require('../middleware/authMiddleware');

router.get('/me', protect, requireStudent, getMyProfile);
router.put('/me', protect, requireStudent, updateProfile);

module.exports = router;
