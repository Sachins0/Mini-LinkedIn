import React, { useState, useEffect } from 'react';
import { getTrendingPosts } from '../services/postService';
import { getSuggestedUsers } from '../services/userService';
import PostCard from '../components/posts/PostCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Trending = () => {
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch trending posts
  const fetchTrendingPosts = async () => {
    try {
      setLoadingPosts(true);
      const result = await getTrendingPosts();
      
      if (result.success) {
        setTrendingPosts(result.data.data.posts);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch trending posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    try {
      setLoadingUsers(true);
      const result = await getSuggestedUsers(8);
      
      if (result.success) {
        setSuggestedUsers(result.data.data.users);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch suggested users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
    fetchSuggestedUsers();
  }, []);

  // Handle post update
  const handlePostUpdate = (updatedPost) => {
    setTrendingPosts(prev => 
      prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // Handle post deletion
  const handlePostDelete = (postId) => {
    setTrendingPosts(prev => prev.filter(post => post._id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Trending Posts */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🔥 Trending Posts
            </h1>
            <p className="text-gray-600 mb-8">
              Most popular posts from the last 24 hours
            </p>

            {loadingPosts ? (
              <div className="space-y-6">
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
            ) : trendingPosts.length === 0 ? (
              <div className="card text-center">
                <div className="py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Trending Posts</h3>
                  <p className="text-gray-600">
                    No posts are trending right now. Check back later!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {trendingPosts.map((post, index) => (
                  <div key={post._id} className="relative">
                    {/* Trending Rank */}
                    <div className="absolute -left-2 -top-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                      {index + 1}
                    </div>
                    <PostCard
                      post={post}
                      onPostUpdate={handlePostUpdate}
                      onPostDelete={handlePostDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Suggested Users */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💡 Suggested Users
              </h2>

              {loadingUsers ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestedUsers.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No suggested users available
                </p>
              ) : (
                <div className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          {user.bio && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
