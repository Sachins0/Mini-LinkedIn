import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import PostForm from './PostForm';
import { getPosts } from '../../services/postService';
import toast from 'react-hot-toast';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
  });

  // Fetch posts
  const fetchPosts = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getPosts(page, pagination.limit);
      
      if (result.success) {
        const newPosts = result.data.data.posts;
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setPagination(result.data.data.pagination);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load initial posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Handle post update (like, comment)
  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // Handle post deletion
  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  // Load more posts
  const loadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchPosts(pagination.page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Creation Form */}
      <PostForm onPostCreated={handlePostCreated} />

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))}

          {/* Load More Button */}
          {pagination.hasNextPage && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}

          {/* End of Posts Message */}
          {!pagination.hasNextPage && posts.length > 0 && (
            <div className="text-center text-gray-500 py-4">
              <p>You've reached the end of the feed!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostFeed;
