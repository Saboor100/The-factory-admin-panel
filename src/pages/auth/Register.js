import React, { useState } from 'react';
import authService from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import './auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await authService.signup(
      form.name,
      form.email,
      form.password,
      form.confirmPassword
    );

    if (result.success) {
      alert("Registration successful! Please log in.");
      navigate(ROUTES.LOGIN);
    } else {
      setError(result.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2>Create Admin Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              className="custom-input"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Address */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="custom-input"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <input
              type="password"
              name="password"
              className="custom-input"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              className="custom-input"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={submitting}>
            {submitting ? "Registering..." : "Sign Up"}
          </button>

          {/* Error Message */}
          {error && <div className="error-msg">{error}</div>}
        </form>

        <p>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;