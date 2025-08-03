const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getTrendingPosts,
  getFeed,
  getPostAnalytics,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePost, validateComment } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/trending', getTrendingPosts);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.get('/user/feed', protect, getFeed); // NEW
router.get('/:id/analytics', protect, getPostAnalytics); // NEW
router.post('/', protect, validatePost, createPost);
router.put('/:id', protect, validatePost, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, validateComment, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
