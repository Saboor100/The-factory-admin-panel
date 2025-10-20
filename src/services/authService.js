import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Sign in user
  async signin(email, password) {
    try {
      console.log('🔐 Starting login...');
      
      // Clear any existing tokens before login
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      const response = await api.post(API_ENDPOINTS.SIGNIN, {
        email,
        password
      });
      
      console.log('✅ Login response received');
      
      // Extract token and user data from response
      const { token, admin } = response.data;
      
      // Validate token before storing
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('❌ Invalid token received from server');
        return {
          success: false,
          message: 'Invalid authentication token received'
        };
      }
      
      // Check token length (prevent 431 errors)
      if (token.length > 2048) {
        console.error('⚠️ Token is unusually large:', token.length, 'characters');
        return {
          success: false,
          message: 'Invalid token received from server'
        };
      }
      
      console.log('💾 Storing token (length:', token.length, 'chars)');
      
      // Store token directly (DO NOT stringify - it's already a string)
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
      
      // Store user data as JSON string
      if (admin) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(admin));
        console.log('👤 User data stored');
      }
      
      // Verify storage was successful
      const storedToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (storedToken !== token) {
        console.error('❌ Token storage verification failed');
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        return {
          success: false,
          message: 'Failed to store authentication token'
        };
      }
      
      console.log('✅ Login successful - token verified and stored');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Clear any partial data on error
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Sign up user
  async signup(name, email, password, confirmPassword) {
    try {
      console.log('📝 Starting registration...');
      
      // Clear any existing tokens
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      const response = await api.post(API_ENDPOINTS.SIGNUP, {
        name,
        email,
        password,
        confirmPassword
      });
      
      const { token, admin } = response.data;
      
      // Validate and store token if provided
      if (token && typeof token === 'string' && token.length < 2048) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
        
        if (admin) {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(admin));
        }
        
        console.log('✅ Registration successful - token stored');
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Clear any partial data on error
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Validate token
  async validateToken(token) {
    try {
      // Validate token format before sending
      if (!token || typeof token !== 'string' || token.trim() === '' || token === 'null' || token === 'undefined') {
        console.warn('⚠️ Invalid token format, skipping validation');
        return false;
      }
      
      if (token.length > 2048) {
        console.error('⚠️ Token too large for validation');
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        return false;
      }
      
      const response = await api.post(API_ENDPOINTS.TOKEN_VALIDATE, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      
      // Clear invalid token
      if (error.response?.status === 401 || error.response?.status === 431) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      
      return false;
    }
  }

  // Get user data
  async getUserData(token) {
    try {
      // Validate token format
      if (!token || typeof token !== 'string' || token.length > 2048) {
        return {
          success: false,
          message: 'Invalid token'
        };
      }
      
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
      console.error('❌ Get user data error:', error);
      
      // Clear invalid token on auth errors
      if (error.response?.status === 401 || error.response?.status === 431) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      
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

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    return token && 
           typeof token === 'string' && 
           token !== 'null' && 
           token !== 'undefined' && 
           token.trim() !== '' &&
           token.length < 2048;
  }

  // Get current token
  getToken() {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    // Validate token before returning
    if (!token || 
        typeof token !== 'string' || 
        token === 'null' || 
        token === 'undefined' || 
        token.trim() === '' ||
        token.length > 2048) {
      return null;
    }
    
    return token;
  }

  // Get current user data
  getUserDataFromStorage() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  }

  // Logout
  logout() {
    console.log('👋 Logging out...');
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = '/login';
  }

  // Clear corrupted auth data
  clearAuthData() {
    console.log('🧹 Clearing authentication data...');
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
}

const authService = new AuthService();
export default authService;