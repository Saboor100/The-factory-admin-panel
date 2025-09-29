// services/events/registrationService.js
import api from '../api.js';

// Custom API instance for registration endpoints that need x-admin-token header
const createRegistrationApi = () => {
  const token = localStorage.getItem('adminToken');
  return {
    ...api,
    defaults: {
      ...api.defaults,
      headers: {
        ...api.defaults.headers,
        'x-admin-token': token,
      },
    },
    post: (url, data, config = {}) => api.post(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    get: (url, config = {}) => api.get(url, {
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    put: (url, data, config = {}) => api.put(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    patch: (url, data, config = {}) => api.patch(url, data, {
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
    delete: (url, config = {}) => api.delete(url, {
      ...config,
      headers: {
        ...config.headers,
        'x-admin-token': token,
      },
    }),
  };
};

const registrationService = {
  // Get all registrations with filters
  async getRegistrations(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await registrationApi.get(`/admin/registrations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Get single registration by ID
  async getRegistration(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/registrations/${registrationId}`);
      return response.data;
    } catch (error) {
      console.error('Get registration error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registrations for specific event
  async getEventRegistrations(eventId, params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams({ eventId, ...params });
      
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === '') {
          queryParams.delete(key);
        }
      });
      
      const response = await registrationApi.get(`/admin/events/${eventId}/registrations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get event registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Create new registration (admin)
  async createRegistration(registrationData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post('/admin/registrations', registrationData);
      return response.data;
    } catch (error) {
      console.error('Create registration error:', error);
      throw error.response?.data || error;
    }
  },

  // Update registration
  async updateRegistration(registrationId, registrationData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.put(`/admin/registrations/${registrationId}`, registrationData);
      return response.data;
    } catch (error) {
      console.error('Update registration error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete registration
  async deleteRegistration(registrationId, refund = false) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.delete(`/admin/registrations/${registrationId}?refund=${refund}`);
      return response.data;
    } catch (error) {
      console.error('Delete registration error:', error);
      throw error.response?.data || error;
    }
  },

  // Check-in participant
  async checkInParticipant(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/checkin`);
      return response.data;
    } catch (error) {
      console.error('Check in participant error:', error);
      throw error.response?.data || error;
    }
  },

  // Check-out participant (undo check-in)
  async checkOutParticipant(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/checkout`);
      return response.data;
    } catch (error) {
      console.error('Check out participant error:', error);
      throw error.response?.data || error;
    }
  },

  // Generate ticket for registration
  async generateTicket(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/ticket`);
      return response.data;
    } catch (error) {
      console.error('Generate ticket error:', error);
      throw error.response?.data || error;
    }
  },

  // Send confirmation email
  async sendConfirmationEmail(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/send-confirmation`);
      return response.data;
    } catch (error) {
      console.error('Send confirmation email error:', error);
      throw error.response?.data || error;
    }
  },

  // Update payment status
  async updatePaymentStatus(registrationId, paymentData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error.response?.data || error;
    }
  },

  // Process refund
  async processRefund(registrationId, refundData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/refund`, refundData);
      return response.data;
    } catch (error) {
      console.error('Process refund error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration statistics
  async getRegistrationStats(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await registrationApi.get(`/admin/registrations/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registration stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration analytics
  async getRegistrationAnalytics(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await registrationApi.get(`/admin/registrations/analytics?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registration analytics error:', error);
      throw error.response?.data || error;
    }
  },

  // Bulk operations
  async bulkCheckIn(registrationIds) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch('/admin/registrations/bulk-checkin', {
        registrationIds
      });
      return response.data;
    } catch (error) {
      console.error('Bulk check-in error:', error);
      throw error.response?.data || error;
    }
  },

  async bulkUpdateStatus(registrationIds, status) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch('/admin/registrations/bulk-status', {
        registrationIds,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw error.response?.data || error;
    }
  },

  async bulkSendEmails(registrationIds, emailType) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post('/admin/registrations/bulk-email', {
        registrationIds,
        emailType
      });
      return response.data;
    } catch (error) {
      console.error('Bulk send emails error:', error);
      throw error.response?.data || error;
    }
  },

  async bulkDelete(registrationIds, refund = false) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.delete('/admin/registrations/bulk', {
        data: { registrationIds, refund }
      });
      return response.data;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error.response?.data || error;
    }
  },

  // Export registrations
  async exportRegistrations(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await registrationApi.get(`/admin/registrations/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error('Export registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Import registrations
  async importRegistrations(eventId, file) {
    try {
      const registrationApi = createRegistrationApi();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      
      const response = await registrationApi.post('/admin/registrations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Import registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration form template
  async getRegistrationFormTemplate(eventId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/registrations/form-template/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Get form template error:', error);
      throw error.response?.data || error;
    }
  },

  // Update registration form template
  async updateRegistrationFormTemplate(eventId, templateData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.put(`/admin/registrations/form-template/${eventId}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Update form template error:', error);
      throw error.response?.data || error;
    }
  },

  // Get waitlist
  async getWaitlist(eventId, params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/events/${eventId}/waitlist?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get waitlist error:', error);
      throw error.response?.data || error;
    }
  },

  // Move waitlist to confirmed
  async moveFromWaitlist(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/confirm-from-waitlist`);
      return response.data;
    } catch (error) {
      console.error('Move from waitlist error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration timeline
  async getRegistrationTimeline(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/registrations/${registrationId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Get registration timeline error:', error);
      throw error.response?.data || error;
    }
  },

  // Add note to registration
  async addRegistrationNote(registrationId, note) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/notes`, { note });
      return response.data;
    } catch (error) {
      console.error('Add registration note error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration notes
  async getRegistrationNotes(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/registrations/${registrationId}/notes`);
      return response.data;
    } catch (error) {
      console.error('Get registration notes error:', error);
      throw error.response?.data || error;
    }
  },

  // Send custom email to participant
  async sendCustomEmail(registrationId, emailData) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/send-email`, emailData);
      return response.data;
    } catch (error) {
      console.error('Send custom email error:', error);
      throw error.response?.data || error;
    }
  },

  // Get participant communication history
  async getCommunicationHistory(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/registrations/${registrationId}/communications`);
      return response.data;
    } catch (error) {
      console.error('Get communication history error:', error);
      throw error.response?.data || error;
    }
  },

  // Generate certificate of participation
  async generateCertificate(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/registrations/${registrationId}/certificate`);
      return response.data;
    } catch (error) {
      console.error('Generate certificate error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration revenue report
  async getRevenueReport(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await registrationApi.get(`/admin/registrations/revenue-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get revenue report error:', error);
      throw error.response?.data || error;
    }
  },

  // Get attendance report
  async getAttendanceReport(eventId, params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/events/${eventId}/attendance-report?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance report error:', error);
      throw error.response?.data || error;
    }
  },

  // Send reminder emails
  async sendReminderEmails(eventId, reminderType = 'event_reminder') {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post(`/admin/events/${eventId}/send-reminders`, {
        reminderType
      });
      return response.data;
    } catch (error) {
      console.error('Send reminder emails error:', error);
      throw error.response?.data || error;
    }
  },

  // Get no-show participants
  async getNoShows(eventId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.get(`/admin/events/${eventId}/no-shows`);
      return response.data;
    } catch (error) {
      console.error('Get no-shows error:', error);
      throw error.response?.data || error;
    }
  },

  // Mark as no-show
  async markAsNoShow(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/no-show`);
      return response.data;
    } catch (error) {
      console.error('Mark as no-show error:', error);
      throw error.response?.data || error;
    }
  },

  // Remove no-show status
  async removeNoShowStatus(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/remove-no-show`);
      return response.data;
    } catch (error) {
      console.error('Remove no-show status error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration conflicts (same participant in multiple events)
  async getRegistrationConflicts(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/registrations/conflicts?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get registration conflicts error:', error);
      throw error.response?.data || error;
    }
  },

  // Resolve registration conflict
  async resolveConflict(conflictId, resolution) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/conflicts/${conflictId}/resolve`, {
        resolution
      });
      return response.data;
    } catch (error) {
      console.error('Resolve conflict error:', error);
      throw error.response?.data || error;
    }
  },

  // Get duplicate registrations
  async getDuplicateRegistrations(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/registrations/duplicates?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get duplicate registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Merge duplicate registrations
  async mergeDuplicateRegistrations(primaryRegistrationId, duplicateRegistrationIds) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post('/admin/registrations/merge-duplicates', {
        primaryRegistrationId,
        duplicateRegistrationIds
      });
      return response.data;
    } catch (error) {
      console.error('Merge duplicate registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Get registration form submissions
  async getFormSubmissions(eventId, params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/events/${eventId}/form-submissions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get form submissions error:', error);
      throw error.response?.data || error;
    }
  },

  // Archive old registrations
  async archiveRegistrations(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.post('/admin/registrations/archive', params);
      return response.data;
    } catch (error) {
      console.error('Archive registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Get archived registrations
  async getArchivedRegistrations(params = {}) {
    try {
      const registrationApi = createRegistrationApi();
      const queryParams = new URLSearchParams(params);
      
      const response = await registrationApi.get(`/admin/registrations/archived?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get archived registrations error:', error);
      throw error.response?.data || error;
    }
  },

  // Restore archived registration
  async restoreRegistration(registrationId) {
    try {
      const registrationApi = createRegistrationApi();
      const response = await registrationApi.patch(`/admin/registrations/${registrationId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Restore registration error:', error);
      throw error.response?.data || error;
    }
  }
};

export default registrationService;