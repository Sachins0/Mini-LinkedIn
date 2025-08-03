import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get all posts (feed)
export const getPosts = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.POSTS.ALL}?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch posts' 
    };
  }
};

// Get single post
export const getPost = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.POSTS.BY_ID.replace(':id', id));
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch post' 
    };
  }
};

// Create new post
export const createPost = async (content) => {
  try {
    const response = await api.post(API_ENDPOINTS.POSTS.CREATE, { content });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create post' 
    };
  }
};

// Update post
export const updatePost = async (id, content) => {
  try {
    const response = await api.put(API_ENDPOINTS.POSTS.UPDATE.replace(':id', id), { content });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update post' 
    };
  }
};

// Delete post
export const deletePost = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.POSTS.DELETE.replace(':id', id));
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete post' 
    };
  }
};

// Toggle like on post
export const toggleLike = async (id) => {
  try {
    const response = await api.put(`/posts/${id}/like`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to like/unlike post' 
    };
  }
};

// Add comment to post
export const addComment = async (id, text) => {
  try {
    const response = await api.post(`/posts/${id}/comments`, { text });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add comment' 
    };
  }
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete comment' 
    };
  }
};

// Get trending posts
export const getTrendingPosts = async () => {
  try {
    const response = await api.get('/posts/trending');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch trending posts' 
    };
  }
};
