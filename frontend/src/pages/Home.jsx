import React from 'react';
import PostFeed from '../components/posts/PostFeed';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Mini LinkedIn
          </h1>
          <p className="text-gray-600">
            {isAuthenticated 
              ? 'Share your thoughts and connect with others!' 
              : 'Join the community to share and connect with professionals'
            }
          </p>
        </div>

        {/* Feed */}
        <PostFeed />
      </div>
    </div>
  );
};

export default Home;
