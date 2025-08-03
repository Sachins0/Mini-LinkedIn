export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
    USER_POSTS: '/users/:id/posts',
  },
  POSTS: {
    ALL: '/posts',
    CREATE: '/posts',
    BY_ID: '/posts/:id',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  USER_PROFILE: '/profile/:id',
  DASHBOARD: '/dashboard',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  POST_MAX_LENGTH: 1000,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 300,
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    REGISTER: 'Account created successfully!',
    POST_CREATED: 'Post created successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION: 'Please check your input and try again.',
  },
};
