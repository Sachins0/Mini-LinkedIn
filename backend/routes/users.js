const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getUserPosts,
  searchUsers,
  getUserStats,
  getSuggestedUsers,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/search', optionalAuth, searchUsers);
router.get('/suggested', getSuggestedUsers);
router.get('/profile/:id', optionalAuth, getUserProfile);
router.get('/:id/posts', optionalAuth, getUserPosts);

// Protected routes
router.get('/stats', protect, getUserStats); // NEW
router.put('/profile', protect, validateProfileUpdate, updateProfile);

module.exports = router;
