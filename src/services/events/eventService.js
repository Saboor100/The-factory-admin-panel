// services/events/eventService.js
import api from '../api.js';

// Custom API instance for event endpoints that need x-admin-token header
const createEventApi = () => {
  const token = localStorage.getItem('adminToken');
  return {
    ...api,
    defaults: {
      ...api.defaults,
      headers: {
        ...api.defaults.headers,
        'x-admin-token': token,
      },
      timeout: 60000, // Default 60 seconds timeout
    },
    post: (url, data, config = {}) => api.post(url, data, {
      timeout: 60000, // 60 seconds timeout
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    get: (url, config = {}) => api.get(url, {
      timeout: 30000, // 30 seconds for GET requests
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    put: (url, data, config = {}) => api.put(url, data, {
      timeout: 60000, // 60 seconds timeout
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    patch: (url, data, config = {}) => api.patch(url, data, {
      timeout: 30000, // 30 seconds timeout
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    delete: (url, config = {}) => api.delete(url, {
      timeout: 30000, // 30 seconds timeout
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
  };
};

const eventService = {
  // Event Management
  async createEvent(eventData) {
    try {
      console.log('🚀 Starting event creation...');
      const eventApi = createEventApi();
      const formData = new FormData();
      
      // Add text fields
      Object.keys(eventData).forEach(key => {
        if (key === 'ticketTypes' || key === 'tags' || key === 'additionalInfo') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else if (key !== 'image') {
          formData.append(key, eventData[key]);
        }
      });
      
      // Add image file if present
      if (eventData.image && eventData.image instanceof File) {
        console.log('📎 Adding image file:', eventData.image.name);
        formData.append('image', eventData.image);
      }
      
      console.log('📤 Sending request to backend...');
      const response = await eventApi.post('/admin/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for event creation with image upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      console.log('✅ Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create event error:', error);
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        throw {
          message: 'Request timed out. The event might have been created successfully. Please check your events list.',
          code: 'TIMEOUT',
          type: 'timeout'
        };
      }
      
      if (error.response?.status === 400) {
        throw {
          message: error.response.data?.message || 'Invalid data provided',
          code: 'VALIDATION_ERROR',
          type: 'validation',
          details: error.response.data
        };
      }
      
      if (error.response?.status === 401) {
        throw {
          message: 'Authentication failed. Please login again.',
          code: 'AUTH_ERROR',
          type: 'authentication'
        };
      }
      
      throw error.response?.data || error;
    }
  },

  async getEvents(params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/events?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get events error:', error);
      throw error.response?.data || error;
    }
  },

  async getEvent(eventId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.get(`/admin/events/${eventId}?includeRegistrations=true`);
      return response.data;
    } catch (error) {
      console.error('Get event error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Toggle event's active/inactive status
   * @param {string} eventId 
   * @param {boolean} isActiveValue - true to activate, false to deactivate
   */
  async toggleEventActive(eventId, isActiveValue) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.put(`/admin/events/${eventId}`, { isActive: isActiveValue });
      return response.data;
    } catch (error) {
      console.error('Toggle event isActive error:', error);
      throw error.response?.data || error;
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      console.log('🔄 Starting event update...');
      const eventApi = createEventApi();
      const formData = new FormData();
      
      // Add text fields
      Object.keys(eventData).forEach(key => {
        if (key === 'ticketTypes' || key === 'tags' || key === 'additionalInfo') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else if (key !== 'image') {
          formData.append(key, eventData[key]);
        }
      });
      
      // Add image file if present
      if (eventData.image && eventData.image instanceof File) {
        console.log('📎 Adding updated image file:', eventData.image.name);
        formData.append('image', eventData.image);
      }
      
      const response = await eventApi.put(`/admin/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for event update with potential image upload
      });
      
      console.log('✅ Event updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update event error:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED') {
        throw {
          message: 'Update request timed out. The event might have been updated successfully.',
          code: 'TIMEOUT',
          type: 'timeout'
        };
      }
      
      throw error.response?.data || error;
    }
  },

  async deleteEvent(eventId, hardDelete = false) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.delete(`/admin/events/${eventId}?hardDelete=${hardDelete}`);
      return response.data;
    } catch (error) {
      console.error('Delete event error:', error);
      throw error.response?.data || error;
    }
  },

  async togglePublished(eventId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.patch(`/admin/events/${eventId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Toggle published error:', error);
      throw error.response?.data || error;
    }
  },

  async toggleFeatured(eventId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.patch(`/admin/events/${eventId}/featured`);
      return response.data;
    } catch (error) {
      console.error('Toggle featured error:', error);
      throw error.response?.data || error;
    }
  },

  async getEventStats() {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.get('/admin/events/stats');
      return response.data;
    } catch (error) {
      console.error('Get event stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Registration Management
  async getRegistrations(params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/registrations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registrations error:', error);
      throw error.response?.data || error;
    }
  },

  async getRegistration(registrationId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.get(`/admin/registrations/${registrationId}`);
      return response.data;
    } catch (error) {
      console.error('Get registration error:', error);
      throw error.response?.data || error;
    }
  },

  async updateRegistration(registrationId, registrationData) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.put(`/admin/registrations/${registrationId}`, registrationData);
      return response.data;
    } catch (error) {
      console.error('Update registration error:', error);
      throw error.response?.data || error;
    }
  },

  async checkInParticipant(registrationId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.patch(`/admin/registrations/${registrationId}/checkin`);
      return response.data;
    } catch (error) {
      console.error('Check in participant error:', error);
      throw error.response?.data || error;
    }
  },

  async generateTicket(registrationId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.post(`/admin/registrations/${registrationId}/ticket`);
      return response.data;
    } catch (error) {
      console.error('Generate ticket error:', error);
      throw error.response?.data || error;
    }
  },

  async getRegistrationStats(params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/registrations/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registration stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Discount Code Management
  async createDiscountCode(discountData) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.post('/admin/discounts', discountData);
      return response.data;
    } catch (error) {
      console.error('Create discount error:', error);
      throw error.response?.data || error;
    }
  },

  async getDiscountCodes(params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/discounts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discounts error:', error);
      throw error.response?.data || error;
    }
  },

  async getDiscountCode(discountId) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.get(`/admin/discounts/${discountId}`);
      return response.data;
    } catch (error) {
      console.error('Get discount error:', error);
      throw error.response?.data || error;
    }
  },

  async updateDiscountCode(discountId, discountData) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.put(`/admin/discounts/${discountId}`, discountData);
      return response.data;
    } catch (error) {
      console.error('Update discount error:', error);
      throw error.response?.data || error;
    }
  },

  async deleteDiscountCode(discountId, hardDelete = false) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.delete(`/admin/discounts/${discountId}?hardDelete=${hardDelete}`);
      return response.data;
    } catch (error) {
      console.error('Delete discount error:', error);
      throw error.response?.data || error;
    }
  },

  async validateDiscountCode(discountData) {
    try {
      const eventApi = createEventApi();
      const response = await eventApi.post('/admin/discounts/validate', discountData);
      return response.data;
    } catch (error) {
      console.error('Validate discount error:', error);
      throw error.response?.data || error;
    }
  },

  async getDiscountUsage(discountId, params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/discounts/${discountId}/usage?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount usage error:', error);
      throw error.response?.data || error;
    }
  },

  async getDiscountStats(params = {}) {
    try {
      const eventApi = createEventApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await eventApi.get(`/admin/discounts/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount stats error:', error);
      throw error.response?.data || error;
    }
  }
};

export default eventService;