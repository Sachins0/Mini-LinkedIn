import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost } from '../../services/postService';
import PostCard from './PostCard';
import toast from 'react-hot-toast';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const result = await getPost(id);
        
        if (result.success) {
          setPost(result.data.data.post);
        } else {
          toast.error(result.message);
          navigate('/');
        }
      } catch (error) {
        toast.error('Failed to load post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, navigate]);

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    toast.success('Post deleted successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="card animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600">The post you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary mt-4"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Post with Comments Auto-Expanded */}
        <PostCard
          post={post}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
          expandable={false} // Not expandable since we're already in expanded view
          showCommentsInitially={true} // 🎯 AUTO-EXPAND COMMENTS
          autoFocusComment={true} // 🎯 AUTO-FOCUS COMMENT INPUT
        />
      </div>
    </div>
  );
};

export default PostView;
