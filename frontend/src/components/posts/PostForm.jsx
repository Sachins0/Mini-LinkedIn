import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/postService';
import { VALIDATION_RULES, MESSAGES } from '../../utils/constants';
import toast from 'react-hot-toast';

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (content.length > VALIDATION_RULES.POST_MAX_LENGTH) {
      toast.error(`Post content cannot exceed ${VALIDATION_RULES.POST_MAX_LENGTH} characters`);
      return;
    }

    setLoading(true);
    
    try {
      const result = await createPost(content.trim());
      
      if (result.success) {
        setContent('');
        toast.success(MESSAGES.SUCCESS.POST_CREATED);
        if (onPostCreated) {
          onPostCreated(result.data.data.post);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(MESSAGES.ERROR.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Please log in to create a post</p>
      </div>
    );
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <img
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="input-field resize-none"
              rows="3"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {content.length}/{VALIDATION_RULES.POST_MAX_LENGTH}
              </span>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
