// Enhanced video service with better error handling and debugging
import api from './api'; // ✅ USE YOUR MAIN API INSTANCE
import { STORAGE_KEYS, VIDEO_ENDPOINTS } from '../utils/constants';

// ✅ Configure the main api instance for video uploads
const configureVideoApi = () => {
  // Set longer timeout for video operations
  api.defaults.timeout = 300000; // 5 minutes
};

configureVideoApi();

const videoService = {
  // Enhanced upload with better error handling and retry logic
  uploadVideo: async (videoData, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    console.log(`🎬 Starting video upload (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    
    try {
      // Validate token before upload
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Validate files
      if (!videoData.video) {
        throw new Error('Video file is required.');
      }
      
      // Check file sizes
      const videoSize = videoData.video.size;
      const thumbnailSize = videoData.thumbnail?.size || 0;
      const totalSize = videoSize + thumbnailSize;
      
      console.log('📊 Upload info:', {
        videoSize: `${(videoSize / 1024 / 1024).toFixed(2)}MB`,
        thumbnailSize: `${(thumbnailSize / 1024 / 1024).toFixed(2)}MB`,
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`
      });
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('video', videoData.video);
      
      if (videoData.thumbnail) {
        formData.append('thumbnail', videoData.thumbnail);
      }
      
      // Add metadata
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('category', videoData.category);
      formData.append('isPremium', String(videoData.isPremium));
      formData.append('price', String(videoData.price || 0));
      formData.append('featured', String(videoData.featured || false));
      
      if (videoData.tags && Array.isArray(videoData.tags)) {
        formData.append('tags', JSON.stringify(videoData.tags));
      }
      
      // Log FormData contents
      console.log('📋 FormData prepared:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Calculate dynamic timeout based on file size
      const baseTimeout = 60000; // 1 minute base
      const sizeTimeout = Math.max(totalSize / 1024 / 1024 * 10000, 0); // 10 seconds per MB
      const dynamicTimeout = Math.min(baseTimeout + sizeTimeout, 600000); // Max 10 minutes
      
      console.log(`⏱️ Using timeout: ${(dynamicTimeout / 1000).toFixed(0)} seconds`);
      
      // Make the upload request using the main api instance
      const response = await api.post(VIDEO_ENDPOINTS.UPLOAD, formData, {
        timeout: dynamicTimeout,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`📈 Upload progress: ${percentCompleted}%`);
            
            if (videoData.onProgress) {
              videoData.onProgress(percentCompleted);
            }
          }
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      console.log('✅ Upload successful:', response.data);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Upload attempt ${retryCount + 1} failed:`, error);
      
      // Retry logic for network errors
      if (retryCount < MAX_RETRIES && (
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNABORTED' ||
        error.response?.status >= 500
      )) {
        console.log(`🔄 Retrying upload in 2 seconds... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return videoService.uploadVideo(videoData, retryCount + 1);
      }
      
      // Format error for user
      let userMessage = 'Upload failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        userMessage = 'Upload timeout. The file may be too large. Try reducing file size or check your connection.';
      } else if (error.code === 'ERR_NETWORK') {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.status === 431) {
        userMessage = 'Request headers too large. Please try logging in again.';
        // Clear potentially corrupted token
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      } else if (error.response?.status === 401) {
        userMessage = 'Authentication failed. Please refresh the page and login again.';
      } else if (error.response?.data?.message) {
        userMessage = error.response.data.message;
      }
      
      throw new Error(userMessage);
    }
  },

  // All other methods using the main api instance
  getAllVideos: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.isPremium !== undefined) {
      params.append('isPremium', filters.isPremium);
    }
    if (filters.featured !== undefined) {
      params.append('featured', filters.featured);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.includeInactive) {
      params.append('includeInactive', filters.includeInactive);
    }
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    try {
      const response = await api.get(`${VIDEO_ENDPOINTS.GET_ALL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get videos error:', error);
      throw error;
    }
  },

  getVideoById: async (id) => {
    try {
      const response = await api.get(`${VIDEO_ENDPOINTS.GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get video by ID error:', error);
      throw error;
    }
  },

  updateVideo: async (id, updateData) => {
    try {
      console.log('🎬 Starting video update for ID:', id);
      console.log('📊 Update data type:', updateData.constructor.name);
      
      // Check if updateData is FormData (for file uploads) or regular object
      const isFormData = updateData instanceof FormData;
      
      if (isFormData) {
        console.log('📋 FormData contents:');
        for (let [key, value] of updateData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      } else {
        console.log('📋 Regular update data:', updateData);
      }

      // Configure request based on data type
      const config = {
        timeout: isFormData ? 300000 : 30000,
      };

      // For FormData, let browser set Content-Type with boundary
      if (isFormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      }

      const response = await api.put(`${VIDEO_ENDPOINTS.UPDATE}/${id}`, updateData, config);
      
      console.log('✅ Update response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Update video error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid data provided');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Video not found');
      }
      
      if (error.response?.status === 413) {
        throw new Error('File too large. Please reduce file size and try again.');
      }

      if (error.response?.status === 431) {
        throw new Error('Request headers too large. Please try logging in again.');
      }

      const updateError = new Error(error.response?.data?.message || error.message || 'Failed to update video');
      updateError.status = error.response?.status;
      updateError.response = error.response?.data;
      throw updateError;
    }
  },

  deleteVideo: async (id, hardDelete = false) => {
    const params = hardDelete ? '?hardDelete=true' : '';
    
    try {
      const response = await api.delete(`${VIDEO_ENDPOINTS.DELETE}/${id}${params}`);
      return response.data;
    } catch (error) {
      console.error('Delete video error:', error);
      throw error;
    }
  },

  toggleFeatured: async (id) => {
    try {
      const response = await api.patch(`${VIDEO_ENDPOINTS.TOGGLE_FEATURED}/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error('Toggle featured error:', error);
      throw error;
    }
  },

  bulkDelete: async (videoIds, hardDelete = false) => {
    try {
      const response = await api.delete(VIDEO_ENDPOINTS.BULK_DELETE, {
        data: {
          videoIds,
          hardDelete
        }
      });
      return response.data;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  },

  getVideoStats: async () => {
    try {
      const response = await api.get(VIDEO_ENDPOINTS.STATS);
      return response.data;
    } catch (error) {
      console.error('Get video stats error:', error);
      throw error;
    }
  },

  testConnection: async () => {
    try {
      console.log('🔍 Testing connection...');
      const response = await api.get('/admin/videos/test');
      console.log('✅ Connection test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      throw error;
    }
  },

  getServerStatus: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Server status check failed:', error);
      throw error;
    }
  },

  testAuth: async () => {
    try {
      const response = await api.get('/admin/videos/test');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Utility functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDuration: (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  validateVideoFile: (file) => {
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-flv',
      'video/x-ms-wmv'
    ];
    
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid video format. Allowed formats: ${allowedTypes.join(', ')}`
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Video file too large. Maximum size is ${videoService.formatFileSize(maxSize)}`
      };
    }
    
    return { valid: true };
  },

  validateThumbnailFile: (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid image format. Allowed formats: ${allowedTypes.join(', ')}`
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Thumbnail file too large. Maximum size is ${videoService.formatFileSize(maxSize)}`
      };
    }
    
    return { valid: true };
  }
};

export default videoService;