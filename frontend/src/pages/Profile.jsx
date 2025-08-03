import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserPosts } from '../services/userService';
import PostCard from '../components/posts/PostCard';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import toast from 'react-hot-toast';
import { formatJoinDate } from '../utils/timeUtils';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
  });

  const isOwnProfile = currentUser && currentUser._id === id;

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const result = await getUserProfile(id);
      
      if (result.success) {
        setUser(result.data.data.user);
      } else {
        toast.error(result.message);
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (page = 1) => {
    try {
      if (page === 1) {
        setLoadingPosts(true);
      }
      
      const result = await getUserPosts(id, page);
      
      if (result.success) {
        const newPosts = result.data.data.posts;
        
        if (page === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setPagination(result.data.data.pagination);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [id]);

  // Handle post update
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

  // Handle profile update
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Load more posts
  const loadMore = () => {
    if (pagination.hasNextPage) {
      fetchUserPosts(pagination.page + 1);
    }
  };

  // Format date
//   const formatJoinDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long'
//     });
//   };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-64"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=96`}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
            />
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">{user.postsCount || 0}</span> Posts
                </div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {formatJoinDate(user.createdAt)}
                  </span> Joined
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
          </h2>
          
          {loadingPosts && posts.length === 0 ? (
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
          ) : posts.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "You haven't posted anything yet. Share your first post!"
                  : `${user.name} hasn't posted anything yet.`
                }
              </p>
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
                    disabled={loadingPosts}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPosts ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
