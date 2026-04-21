import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { ROLE_DASHBOARD_MAP, ROUTES } from '../utils/constants';

const useAuth = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    try {
      const data = await authService.login(credentials);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Determine redirect path based on role
      const role = data.role || currentUser?.role;
      const redirectPath = ROLE_DASHBOARD_MAP[role] || ROUTES.LOGIN;

      return { success: true, redirectPath, role };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    window.location.href = ROUTES.LOGIN;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    logout,
  };
};

export default useAuth;
