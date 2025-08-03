import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/userService';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNextPage: false,
  });

  // Fetch search results
  // Memoize fetch function
  const fetchSearchResults = useCallback(async (page = 1) => {
    if (!query) return;

    try {
      if (page === 1) {
        setLoading(true);
      }

      const result = await searchUsers(query, page, pagination.limit);
      
      if (result.success) {
        const newUsers = result.data.data.users;
        
        if (page === 1) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }
        
        setPagination(result.data.data.pagination);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [query, pagination.limit]); // Dependencies for fetchSearchResults

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]); // ✅ Fixed: Include fetchSearchResults dependency


  // Load more results
  const loadMore = () => {
    if (pagination.hasNextPage) {
      fetchSearchResults(pagination.page + 1);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Search Query</h2>
          <p className="text-gray-600">Please enter a search term to find users.</p>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            Results for "{query}" • {pagination.total} users found
          </p>
        </div>

        {/* Loading State */}
        {loading && users.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center">
            <div className="py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                We couldn't find any users matching "{query}". Try a different search term.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user._id} className="card">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="btn-primary mt-3 w-full"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Users'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
