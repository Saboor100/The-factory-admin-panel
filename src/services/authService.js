import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class AuthService {
  // Sign in user
  async signin(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.SIGNIN, {
        email,
        password
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Sign up user
  async signup(name, email, password, confirmPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.SIGNUP, {
        name,
        email,
        password,
        confirmPassword
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Validate token
  async validateToken(token) {
    try {
      const response = await api.post(API_ENDPOINTS.TOKEN_VALIDATE, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Get user data
  async getUserData(token) {
    try {
      const response = await api.get(API_ENDPOINTS.USER_DATA, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user data'
      };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_OTP, {
        email,
        otp
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid OTP'
      };
    }
  }

  // Reset password
  async resetPassword(email, otp, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        email,
        otp,
        newPassword
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUserData');
    window.location.href = '/login';
  }
}

const authService = new AuthService();
export default authService;