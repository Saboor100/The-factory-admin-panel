import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import './auth.css';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="form-card">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
