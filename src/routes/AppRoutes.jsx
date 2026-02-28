import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import OwnerDashboard from '../pages/dashboard/OwnerDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import PrivateRoute from '../components/PrivateRoute';
import { ROUTES, ROLES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Auth Routes ─────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* ── Protected: Super Admin ─────────────────────────────────── */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <PrivateRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Protected: Boarding Owner ──────────────────────────────── */}
      <Route
        path={ROUTES.OWNER_DASHBOARD}
        element={
          <PrivateRoute allowedRoles={[ROLES.BOARDING_OWNER]}>
            <OwnerDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Protected: Student ─────────────────────────────────────── */}
      <Route
        path={ROUTES.STUDENT_DASHBOARD}
        element={
          <PrivateRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* ── Fallback: Redirect to Login ────────────────────────────── */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
