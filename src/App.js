import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import ResetPassword from './pages/auth/ResetPassword';
// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Spinner from './components/common/Spinner';
import UserManagement from './components/UserManagement/UserManagement';

// Utils
import { ROUTES } from './utils/constants';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} 
      />

      <Route 
        path={ROUTES.REGISTER} 
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Register />} 
      />

      <Route 
        path={ROUTES.FORGOT_PASSWORD} 
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <ForgotPassword />} 
      />

      <Route 
        path={ROUTES.RESET_PASSWORD} 
        element={<ResetPassword />} 
      />

      {/* Protected Routes */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - MOVED BEFORE catch-all routes */}
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } 
      />

      {/* Root redirect */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />} 
      />

      {/* Catch-all route - MUST be last */}
      <Route 
        path="*" 
        element={<Navigate to={ROUTES.LOGIN} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;