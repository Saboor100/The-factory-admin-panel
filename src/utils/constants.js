// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://the-factory-server.onrender.com/api',
  TIMEOUT: 10000,
};

// Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  USER_DATA: 'adminUserData',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// API Endpoints
export const API_ENDPOINTS = {
  SIGNIN: '/admin/login',
  SIGNUP: '/admin/register',
  TOKEN_VALIDATE: '/admin/tokenIsValid',
  USER_DATA: '/admin',
  FORGOT_PASSWORD: '/admin/forgot-password',
  VERIFY_OTP: '/admin/verify-otp',
  RESET_PASSWORD: '/admin/reset-password',
};

export const VIDEO_ROUTES = {
  VIDEO_MANAGEMENT: '/admin/videos',
  VIDEO_UPLOAD: '/admin/videos/upload',
  VIDEO_ANALYTICS: '/admin/videos/analytics',
};

// Video API Endpoints
export const VIDEO_ENDPOINTS = {
  UPLOAD: '/admin/videos/upload',
  GET_ALL: '/admin/videos',
  GET_BY_ID: '/admin/videos',
  UPDATE: '/admin/videos',
  DELETE: '/admin/videos',
  TOGGLE_FEATURED: '/admin/videos',
  BULK_DELETE: '/admin/videos/bulk',
  STATS: '/admin/videos/stats',
  PRESIGNED_URL: '/admin/videos/upload/presigned-url',
};

// Video Categories
export const VIDEO_CATEGORIES = [
  'training',
  'tutorial',
  'webinar',
  'demo',
  'presentation',
  'course',
  'workshop',
  'other'
];

// Video Quality Options
export const VIDEO_QUALITIES = ['480p', '720p', '1080p'];

// File Upload Limits
export const UPLOAD_LIMITS = {
  VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  THUMBNAIL_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};