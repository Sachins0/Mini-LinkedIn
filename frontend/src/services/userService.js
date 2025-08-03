import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get user profile by ID
export const getUserProfile = async (id) => {
  try {
    const response = await api.get(`/users/profile/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user profile' 
    };
  }
};

// Update current user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update profile' 
    };
  }
};

// Get user's posts
export const getUserPosts = async (id, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users/${id}/posts?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user posts' 
    };
  }
};

// Search users
export const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to search users' 
    };
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch user statistics' 
    };
  }
};

// Get suggested users
export const getSuggestedUsers = async (limit = 5) => {
  try {
    const response = await api.get(`/users/suggested?limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch suggested users' 
    };
  }
};
