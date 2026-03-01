import api from './api';
import { AUTH_TOKEN_KEY, USER_ROLE_KEY, USER_DATA_KEY } from '../utils/constants';

const authService = {
  // ── Login ──────────────────────────────────────────────────────────
  // POST /api/auth/login
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, role, _id, name, email: userEmail } = response.data.data;

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (role) {
      localStorage.setItem(USER_ROLE_KEY, role);
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({ _id, name, email: userEmail }));

    return { token, role, _id, name, email: userEmail };
  },

  // ── Register ───────────────────────────────────────────────────────
  // POST /api/auth/register
  register: async (formData) => {
    const response = await api.post('/auth/register', formData);
    return response.data;
  },

  // ── Logout ─────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  // ── Get Profile ────────────────────────────────────────────────────
  getProfile: async () => {
    const response = await api.get('/auth/me');
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
      ...(userData ? JSON.parse(userData) : {}),
      role,
      token,
    };
  },

  // ── Check if authenticated ─────────────────────────────────────────
  isAuthenticated: () => !!localStorage.getItem(AUTH_TOKEN_KEY),
};

export default authService;
