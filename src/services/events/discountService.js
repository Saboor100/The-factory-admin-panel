// services/events/discountService.js
import api from '../api.js';

const discountService = {
  // Create new discount code
  async createDiscount(discountData) {
    try {
      const response = await api.post('/admin/discounts', discountData);
      return response.data;
    } catch (error) {
      console.error('Create discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Get all discount codes with filters
  async getDiscounts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discounts error:', error);
      throw error.response?.data || error;
    }
  },

  // Get single discount code by ID
  async getDiscount(discountId) {
    try {
      const response = await api.get(`/admin/discounts/${discountId}`);
      return response.data;
    } catch (error) {
      console.error('Get discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Update discount code
  async updateDiscount(discountId, discountData) {
    try {
      const response = await api.put(`/admin/discounts/${discountId}`, discountData);
      return response.data;
    } catch (error) {
      console.error('Update discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete discount code
  async deleteDiscount(discountId, hardDelete = false) {
    try {
      const response = await api.delete(`/admin/discounts/${discountId}?hardDelete=${hardDelete}`);
      return response.data;
    } catch (error) {
      console.error('Delete discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Validate discount code
  async validateDiscount(discountCode, eventId, userId = null) {
    try {
      const response = await api.post('/admin/discounts/validate', {
        code: discountCode,
        eventId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Validate discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Get discount usage statistics
  async getDiscountUsage(discountId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts/${discountId}/usage?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount usage error:', error);
      throw error.response?.data || error;
    }
  },

  // Get discount statistics
  async getDiscountStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Apply discount to order (for calculation purposes)
  async applyDiscount(discountCode, orderData) {
    try {
      const response = await api.post('/admin/discounts/apply', {
        code: discountCode,
        ...orderData
      });
      return response.data;
    } catch (error) {
      console.error('Apply discount error:', error);
      throw error.response?.data || error;
    }
  },

  // Bulk operations
  async bulkCreateDiscounts(discountsData) {
    try {
      const response = await api.post('/admin/discounts/bulk', discountsData);
      return response.data;
    } catch (error) {
      console.error('Bulk create discounts error:', error);
      throw error.response?.data || error;
    }
  },

  async bulkUpdateDiscounts(discountIds, updateData) {
    try {
      const response = await api.patch('/admin/discounts/bulk', {
        discountIds,
        updateData
      });
      return response.data;
    } catch (error) {
      console.error('Bulk update discounts error:', error);
      throw error.response?.data || error;
    }
  },

  async bulkDeleteDiscounts(discountIds, hardDelete = false) {
    try {
      const response = await api.delete('/admin/discounts/bulk', {
        data: { discountIds, hardDelete }
      });
      return response.data;
    } catch (error) {
      console.error('Bulk delete discounts error:', error);
      throw error.response?.data || error;
    }
  },

  // Export discounts
  async exportDiscounts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `discounts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error('Export discounts error:', error);
      throw error.response?.data || error;
    }
  },

  // Import discounts
  async importDiscounts(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/admin/discounts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Import discounts error:', error);
      throw error.response?.data || error;
    }
  },

  // Get discount analytics
  async getDiscountAnalytics(discountId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts/${discountId}/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount analytics error:', error);
      throw error.response?.data || error;
    }
  },

  // Get overall discount performance
  async getDiscountPerformance(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/admin/discounts/performance?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get discount performance error:', error);
      throw error.response?.data || error;
    }
  }
};

export default discountService;