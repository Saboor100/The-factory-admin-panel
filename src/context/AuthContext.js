import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use ref for timer to avoid stale closure issues
  const tokenRefreshTimer = useRef(null);

  // Handle auth failure
  const handleAuthFailure = useCallback(() => {
    if (tokenRefreshTimer.current) {
      clearInterval(tokenRefreshTimer.current);
      tokenRefreshTimer.current = null;
    }
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Validate and refresh token
  const validateAndRefreshToken = useCallback(async (currentToken) => {
    try {
      const isValid = await authService.validateToken(currentToken);

      if (isValid) {
        const userResponse = await authService.getUserData(currentToken);
        if (userResponse.success) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userResponse.data));
          return true;
        }
      }

      // If we reach here, token needs refresh
      if (authService.refreshToken) {
        const refreshResponse = await authService.refreshToken(currentToken);
        if (refreshResponse.success && refreshResponse.data.token) {
          const { token: newToken, ...userData } = refreshResponse.data;
          localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, newToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          setToken(newToken);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Token validation/refresh failed:', error);
      return false;
    }
  }, []);

  // Setup periodic token validation
  useEffect(() => {
    if (token && isAuthenticated) {
      if (tokenRefreshTimer.current) {
        clearInterval(tokenRefreshTimer.current);
      }
      const timer = setInterval(async () => {
        const isValid = await validateAndRefreshToken(token);
        if (!isValid) {
          handleAuthFailure();
        }
      }, 4 * 60 * 1000); // 4 minutes
      tokenRefreshTimer.current = timer;
      return () => {
        if (tokenRefreshTimer.current) {
          clearInterval(tokenRefreshTimer.current);
          tokenRefreshTimer.current = null;
        }
      };
    }
    // Clean up timer if token or auth state changes
    return () => {
      if (tokenRefreshTimer.current) {
        clearInterval(tokenRefreshTimer.current);
        tokenRefreshTimer.current = null;
      }
    };
  }, [token, isAuthenticated, validateAndRefreshToken, handleAuthFailure]);

  // Check auth status on mount and token change
  const checkAuthStatus = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      const isValid = await validateAndRefreshToken(token);
      if (!isValid) {
        handleAuthFailure();
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      handleAuthFailure();
    } finally {
      setLoading(false);
    }
  }, [token, validateAndRefreshToken, handleAuthFailure]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.signin(email, password);
      console.log('LOGIN RESPONSE:', response);

      if (response.success && response.data.token) {
        const { token: newToken, ...userData } = response.data;
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        await validateAndRefreshToken(newToken);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = useCallback(() => {
    if (tokenRefreshTimer.current) {
      clearInterval(tokenRefreshTimer.current);
      tokenRefreshTimer.current = null;
    }
    authService.logout();
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Register, forgot password, etc. (implement as needed)
  const register = async (name, email, password, confirmPassword) => {
    // ... (keep existing register implementation)
  };

  const forgotPassword = async (email) => {
    // ... (keep existing forgotPassword implementation)
  };

  const verifyOTP = async (email, otp) => {
    // ... (keep existing verifyOTP implementation)
  };

  const resetPassword = async (email, otp, newPassword) => {
    // ... (keep existing resetPassword implementation)
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    checkAuthStatus,
    validateAndRefreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;