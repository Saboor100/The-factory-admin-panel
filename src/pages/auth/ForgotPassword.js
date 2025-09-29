import React, { useState, useRef } from "react";
import authService from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import "./auth.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const inputsRef = useRef([]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const result = await authService.forgotPassword(email);

    if (result.success) {
      setStep(2);
      setInfo("✅ If your email is valid, an OTP has been sent to your inbox.");
    } else {
      setError(result.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const fullOTP = otp.join("");

    if (fullOTP.length < 4) {
      setError("Please enter all 4 digits");
      return;
    }

    const result = await authService.verifyOTP(email, fullOTP);

    if (result.success) {
      setInfo("✅ OTP verified! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", { state: { email, otp: fullOTP } });
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const handleOTPChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updatedOTP = [...otp];
      updatedOTP[index] = value;
      setOTP(updatedOTP);

      // Focus next input
      if (value && index < otp.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="auth-container">
      <div className="form-card">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <input
                type="email"
                className="custom-input"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <label className="mt-16 block text-sm font-medium text-gray-300">
              Enter 4-digit OTP
            </label>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOTPChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputsRef.current[index] = el)}
                />
              ))}
            </div>
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {error && <div className="error-msg">{error}</div>}
        {info && <div className="info-msg">{info}</div>}

        <p className="auth-footer mt-8">
          Back to <Link to={ROUTES.LOGIN}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;