const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts with author info, sorted by creation date
    const posts = await Post.getPostsWithAuthor()
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
          hasNextPage: page < Math.ceil(totalPosts / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.create({
      content: content.trim(),
      author: req.user._id,
    });

    // Populate author info before sending response
    await post.populate('author', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author only)
const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    post.content = content.trim();
    await post.save();

    // Populate author info
    await post.populate('author', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Soft delete - mark as inactive
    post.isActive = false;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isLiked = post.isLikedBy(req.user._id);
    let message;

    if (isLiked) {
      await post.removeLike(req.user._id);
      message = 'Post unliked successfully';
    } else {
      await post.addLike(req.user._id);
      message = 'Post liked successfully';
    }

    // Populate author info
    await post.populate('author', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message,
      data: {
        post,
        isLiked: !isLiked,
        likesCount: post.likesCount,
      },
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment and author info
    await post.populate([
      { path: 'author', select: 'name email profilePicture' },
      { path: 'comments.user', select: 'name email profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        post,
        comment: post.comments[post.comments.length - 1],
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (comment author only)
const deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    comment.remove();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get trending posts (most liked in last 24 hours)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await Post.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: oneDayAgo },
        },
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      {
        $sort: { likesCount: -1, commentsCount: -1, createdAt: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                profilePicture: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: '$author',
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
      },
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add these new functions to the existing postController.js

// @desc    Get user's feed (posts from followed users + own posts)
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For now, get all posts (in future, implement following system)
    const posts = await Post.getPostsWithAuthor()
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
          hasNextPage: page < Math.ceil(totalPosts / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get post analytics
// @route   GET /api/posts/:id/analytics
// @access  Private (post owner only)
const getPostAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate('likes', 'name email')
      .populate('comments.user', 'name email');

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user owns the post
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this post',
      });
    }

    const analytics = {
      totalLikes: post.likes.length,
      totalComments: post.comments.length,
      likesList: post.likes,
      commentsList: post.comments,
      createdAt: post.createdAt,
      engagement: {
        likesPerDay: post.likes.length / Math.max(1, Math.ceil((Date.now() - post.createdAt) / (1000 * 60 * 60 * 24))),
        commentsPerDay: post.comments.length / Math.max(1, Math.ceil((Date.now() - post.createdAt) / (1000 * 60 * 60 * 24))),
      }
    };

    res.status(200).json({
      success: true,
      data: {
        post,
        analytics,
      },
    });
  } catch (error) {
    console.error('Get post analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Add to exports
module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getTrendingPosts,
  getFeed,        // NEW
  getPostAnalytics, // NEW
};
