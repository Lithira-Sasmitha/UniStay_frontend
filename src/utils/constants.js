// ─── API Configuration ───────────────────────────────────────────────
export const API_BASE_URL = 'http://localhost:5000/api';

// ─── LocalStorage Keys ──────────────────────────────────────────────
export const AUTH_TOKEN_KEY = 'accessToken';
export const USER_ROLE_KEY = 'userRole';
export const USER_DATA_KEY = 'userData';

// ─── User Roles ─────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  BOARDING_OWNER: 'boardingowner',
  STUDENT: 'student',
};

// ─── Route Paths ────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_DASHBOARD: '/admin',
  OWNER_DASHBOARD: '/owner',
  STUDENT_DASHBOARD: '/student',
  LISTINGS: '/listings',
  LISTING_DETAIL: '/listings/:propertyId',
  CREATE_LISTING: '/owner/create-listing',
  EDIT_LISTING: '/owner/edit-listing/:propertyId',
  STUDENT_PAY: '/student/pay/:bookingId',
  REPORT_SAFETY: '/student/report-safety',
  ROOMMATE_FINDER: '/student/roommates',
  WISHLIST: '/wishlist',
};

// ─── Role → Dashboard Redirect Map ─────────────────────────────────
export const ROLE_DASHBOARD_MAP = {
  [ROLES.SUPER_ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.BOARDING_OWNER]: ROUTES.OWNER_DASHBOARD,
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
};

export const APP_NAME = 'UniStay';
