const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('postsCount');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's posts count and recent posts
    const postsCount = await Post.countDocuments({ 
      author: req.params.id, 
      isActive: true 
    });

    const recentPosts = await Post.getPostsWithAuthor({ author: req.params.id })
      .limit(5);

    const profileData = {
      ...user.getPublicProfile(),
      postsCount,
      recentPosts,
    };

    res.status(200).json({
      success: true,
      data: {
        user: profileData,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/users/:id/posts
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's posts
    const posts = await Post.getPostsWithAuthor({ author: req.params.id })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      author: req.params.id, 
      isActive: true 
    });

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
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Search users by name or email
    const searchRegex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
      ],
    })
      .select('name email bio profilePicture createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalUsers = await User.countDocuments({
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit),
          hasNextPage: page < Math.ceil(totalUsers / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's posts statistics
    const postsCount = await Post.countDocuments({ 
      author: userId, 
      isActive: true 
    });

    // Get total likes on user's posts
    const userPosts = await Post.find({ 
      author: userId, 
      isActive: true 
    }).select('likes');
    
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);

    // Get total comments on user's posts
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0);

    // Get recent activity (posts created in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPostsCount = await Post.countDocuments({
      author: userId,
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = {
      postsCount,
      totalLikes,
      totalComments,
      recentPostsCount,
      joinedDate: req.user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get suggested users (users with recent activity)
// @route   GET /api/users/suggested
// @access  Public
const getSuggestedUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get users who have posted recently
    const recentActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts',
          pipeline: [
            {
              $match: {
                isActive: true,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
              }
            },
            { $limit: 1 }
          ]
        }
      },
      {
        $match: {
          isActive: true,
          posts: { $ne: [] }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          bio: 1,
          profilePicture: 1,
          createdAt: 1,
          postsCount: { $size: '$posts' }
        }
      },
      { $sort: { postsCount: -1, createdAt: -1 } },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: recentActiveUsers,
      },
    });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching suggested users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getUserPosts,
  searchUsers,
  getUserStats,
  getSuggestedUsers,
};
