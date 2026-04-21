import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import { ROUTES } from '../utils/constants';

// ─── PrivateRoute Component ──────────────────────────────────────────
// Wraps protected routes. Checks:
//   1. Is the user authenticated (token exists)?
//   2. Does the user's role match the allowedRoles?
// If not → redirects to /login

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = authService.getToken();
  const role = authService.getRole();

  // Not authenticated → redirect to login
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role check: if allowedRoles specified, verify user's role is included
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Authenticated but wrong role → redirect to login
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Authorized → render children
  return children;
};

export default PrivateRoute;
