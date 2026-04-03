import api from './api';
import { AUTH_TOKEN_KEY, USER_ROLE_KEY, USER_DATA_KEY } from '../utils/constants';

// ─── AUTH SERVICE ────────────────────────────────────────────────────
// Handles login, register, logout, and profile retrieval
// Endpoints match Postman collection: POST /users/login, POST /users/register

const authService = {
  // ── Login ──────────────────────────────────────────────────────────
  // POST /api/users/login
  // Body: { email, password }
  // Response: { accessToken, role, ... }
  login: async ({ email, password }) => {
    const response = await api.post('/users/login', { email, password });
    const { accessToken, role, ...userData } = response.data;

    // Store token, role, and user data in localStorage
    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    }
    if (role) {
      localStorage.setItem(USER_ROLE_KEY, role);
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

    return response.data;
  },

  register: async (formData) => {
    const response = await api.post('/users/register', formData);
    return response.data;
  },

  // ── Logout ─────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  // ── Get Profile ────────────────────────────────────────────────────
  // GET /api/users/profile (requires Bearer token)
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // ── Update Profile ─────────────────────────────────────────────────
  // PUT /api/users/profile (requires Bearer token)
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // ── Get current token ──────────────────────────────────────────────
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),

  // ── Get current role from localStorage ─────────────────────────────
  getRole: () => localStorage.getItem(USER_ROLE_KEY),

  // ── Get stored user data ───────────────────────────────────────────
  getCurrentUser: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const role = localStorage.getItem(USER_ROLE_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);

    if (!token || !role) return null;

    return {
      ...( userData ? JSON.parse(userData) : {} ),
      role,
      token,
    };
  },

  // ── Verification ───────────────────────────────────────────────────
  sendOTP: async (email) => {
    const response = await api.post('/users/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (otp) => {
    const response = await api.post('/users/verify-otp', { otp });
    return response.data;
  },

   // ── Roommates ─────────────────────────────────────────────────────
  getRoommates: async (params = {}) => {
    const response = await api.get('/roommates', { params });
    return response.data;
  },

  // ── Messages/Notifications ──────────────────────────────────────────
  getMessages: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  updateMessageStatus: async (id, status) => {
    const response = await api.patch(`/messages/${id}/status`, { status });
    return response.data;
  },

  // ── Roommate Preferences & Matching ──────────────────────────────────
  savePreferences: async (data) => {
    const response = await api.post('/preferences', data);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/preferences');
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get('/preferences/matches');
    return response.data;
  },

  getRecommendedBoardings: async () => {
    const response = await api.get('/preferences/boardings');
    return response.data;
  },

  // ── Check if authenticated ─────────────────────────────────────────
  isAuthenticated: () => !!localStorage.getItem(AUTH_TOKEN_KEY),
};

export default authService;
