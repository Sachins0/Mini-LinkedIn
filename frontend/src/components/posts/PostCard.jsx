import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleLike, deletePost, addComment } from '../../services/postService';
import { formatRelativeTime, formatAbsoluteTime } from '../../utils/timeUtils';
import toast from 'react-hot-toast';

const PostCard = ({ 
  post, 
  onPostUpdate, 
  onPostDelete, 
  expandable = true,
  showCommentsInitially = false, // NEW PROP
  autoFocusComment = false // NEW PROP for auto-focusing comment input
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Use the prop to set initial state
  const [showComments, setShowComments] = useState(showCommentsInitially);
  const [newComment, setNewComment] = useState('');
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const isPostOwner = user && post.author._id === user._id;
  const isLiked = user && post.likes.includes(user._id);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like posts');
      return;
    }

    setLoadingLike(true);
    try {
      const result = await toggleLike(post._id);
      if (result.success) {
        onPostUpdate(result.data.data.post);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoadingComment(true);
    try {
      const result = await addComment(post._id, newComment.trim());
      if (result.success) {
        setNewComment('');
        onPostUpdate(result.data.data.post);
        toast.success('Comment added successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setLoadingDelete(true);
    try {
      const result = await deletePost(post._id);
      if (result.success) {
        onPostDelete(post._id);
        toast.success('Post deleted successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Navigate to user profile
  const handleUserClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.author._id}`);
  };

  // Handle post click for expansion (only if expandable)
  const handlePostClick = () => {
    if (expandable) {
      // Navigate to individual post view
      navigate(`/post/${post._id}`);
    }
  };

  return (
    <div className="card">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
          onClick={handleUserClick}
        >
          <img
            src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=3b82f6&color=fff`}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              {post.author.name}
            </h3>
            <p 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title={formatAbsoluteTime(post.createdAt)}
            >
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        {isPostOwner && (
          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Post Content - Clickable for expansion only if expandable */}
      <div 
        className={`mb-4 ${expandable ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors' : ''}`}
        onClick={handlePostClick}
        title={expandable ? 'Click to view full post' : ''}
      >
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <button 
          onClick={() => setShowComments(true)}
          className="hover:text-gray-700 transition-colors"
        >
          {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
        </button>
        <button 
          onClick={() => setShowComments(true)}
          className="hover:text-gray-700 transition-colors"
        >
          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pb-3 border-b border-gray-200">
        <button
          onClick={handleLike}
          disabled={loadingLike}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{loadingLike ? 'Loading...' : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
            showComments ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{showComments ? 'Comments' : 'Comments'}</span>
        </button>
      </div>

      {/* Comments Section - Always shown if showCommentsInitially is true */}
      {showComments && (
        <div className="mt-4">
          {/* Add Comment Form */}
          {isAuthenticated && (
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-3">
                <img
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="input-field"
                    disabled={loadingComment}
                    autoFocus={autoFocusComment} // Auto-focus if specified
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingComment || !newComment.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {post.comments.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Comments ({post.comments.length})
              </h4>
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${comment.user._id}`);
                    }}
                    className="flex-shrink-0"
                  >
                    <img
                      src={comment.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=3b82f6&color=fff`}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-primary-300 transition-all"
                    />
                  </button>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${comment.user._id}`);
                        }}
                        className="font-semibold text-sm text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {comment.user.name}
                      </button>
                      <p className="text-gray-800 mt-1">{comment.text}</p>
                    </div>
                    <p 
                      className="text-xs text-gray-500 mt-1 hover:text-gray-700 transition-colors cursor-help"
                      title={formatAbsoluteTime(comment.createdAt)}
                    >
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-t border-gray-200">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-sm">
                No comments yet. {isAuthenticated ? 'Be the first to comment!' : 'Log in to comment.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
