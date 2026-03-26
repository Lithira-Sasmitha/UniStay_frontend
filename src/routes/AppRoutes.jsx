import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import OwnerDashboard from '../pages/dashboard/OwnerDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import ListingsPage from '../pages/listings/ListingsPage';
import PropertyDetailPage from '../pages/listings/PropertyDetailPage';
import CreateListingPage from '../pages/listings/CreateListingPage';
import EditListingPage from '../pages/listings/EditListingPage';
import PaymentPage from '../pages/payment/PaymentPage';
import ReportSafetyPage from '../pages/dashboard/ReportSafetyPage';
import ReportIncidentPage from '../pages/dashboard/ReportIncidentPage';
import MyIncidentsPage from '../pages/dashboard/MyIncidentsPage';
import AdminIncidentDashboard from '../pages/dashboard/AdminIncidentDashboard';
import OwnerIncidentsPage from '../pages/dashboard/OwnerIncidentsPage';
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

      {/* ── Public Listing Routes (wrapped in MainLayout) ────────── */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.LISTINGS} element={<ListingsPage />} />
        <Route path={ROUTES.LISTING_DETAIL} element={<PropertyDetailPage />} />
        <Route path={ROUTES.REPORT_SAFETY} element={<ReportSafetyPage />} />
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
      <Route
        path="/admin/safety"
        element={
          <PrivateRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AdminIncidentDashboard />
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
      <Route
        path="/owner/incidents"
        element={
          <PrivateRoute allowedRoles={[ROLES.BOARDING_OWNER]}>
            <OwnerIncidentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_LISTING}
        element={
          <PrivateRoute allowedRoles={[ROLES.BOARDING_OWNER]}>
            <CreateListingPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.EDIT_LISTING}
        element={
          <PrivateRoute allowedRoles={[ROLES.BOARDING_OWNER]}>
            <EditListingPage />
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
      <Route
        path={ROUTES.STUDENT_PAY}
        element={
          <PrivateRoute allowedRoles={[ROLES.STUDENT]}>
            <PaymentPage />
          </PrivateRoute>
        }
      />

      {/* Pages needing MainLayout wrapper */}
      <Route element={<MainLayout />}>
        <Route
          path="/student/report-incident"
          element={
            <PrivateRoute allowedRoles={[ROLES.STUDENT]}>
              <ReportIncidentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/incidents"
          element={
            <PrivateRoute allowedRoles={[ROLES.STUDENT]}>
              <MyIncidentsPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* ── Fallback: Redirect to Login ────────────────────────────── */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
