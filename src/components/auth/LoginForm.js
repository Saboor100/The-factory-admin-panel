import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600 mt-2 text-sm">Sign in to your admin account</p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <Mail size={16} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                className="custom-input"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <Lock size={16} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="custom-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="input-icon clickable"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition duration-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {isLoading ? <Spinner size="small" color="white" /> : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-500 transition"
          >
            Forgot your password?
          </Link>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Need to create an admin account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 font-medium transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;