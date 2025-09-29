import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/constants";
import "./auth.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // Get email and OTP from navigation state (passed from ForgotPassword component)
  const { email, otp } = location.state || {};

  // Redirect if no email or OTP is provided
  React.useEffect(() => {
    if (!email || !otp) {
      setError("Invalid access. Please start the password reset process again.");
      setTimeout(() => {
        navigate(ROUTES.FORGOT_PASSWORD);
      }, 3000);
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    if (!email || !otp) {
      setError("Missing required information. Please restart the process.");
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to reset password for:', email);
      
      // Call the resetPassword function from AuthContext
      const result = await resetPassword(email, otp, password);
      
      console.log('Reset password result:', result);
      
      if (result.success) {
        setInfo("✅ Password has been reset successfully! Redirecting to login...");
        setPassword("");
        setConfirmPassword("");
        
        // Redirect to login after success
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2 className="auth-title">Reset Your Password</h2>
        
        {email && (
          <p className="text-sm text-gray-400 mb-4">
            Resetting password for: <strong>{email}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <input
              type="password"
              className="custom-input"
              placeholder="Enter new password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <input
              type="password"
              className="custom-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !email || !otp}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {error && <div className="error-msg">{error}</div>}
        {info && <div className="info-msg">{info}</div>}

        <p className="auth-footer mt-8">
          Back to <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password</Link> | 
          <Link to={ROUTES.LOGIN}> Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;