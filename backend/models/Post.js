const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [1000, 'Post content cannot exceed 1000 characters'],
      minlength: [1, 'Post content cannot be empty'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes': 1 });

// Virtual for likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Instance method to check if user liked the post
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.includes(userId);
};

// Instance method to add like
postSchema.methods.addLike = function (userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
  }
  return this.save();
};

// Instance method to remove like
postSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter(like => !like.equals(userId));
  return this.save();
};

// Static method to get posts with author info
postSchema.statics.getPostsWithAuthor = function (filter = {}) {
  return this.find({ isActive: true, ...filter })
    .populate('author', 'name email profilePicture')
    .populate('comments.user', 'name email profilePicture')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Post', postSchema);
