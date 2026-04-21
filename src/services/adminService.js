import api from './api';

// ─── ADMIN SERVICE ───────────────────────────────────────────────────
// Endpoints for Super Admin operations
// All require Bearer token + superadmin role

const adminService = {
  // ── Update User Role ───────────────────────────────────────────────
  // PATCH /api/users/:id/role
  // Body: { role: "boardingowner" | "student" | "superadmin" }
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  // ── List All Users ────────────────────────────────────────────────
  // GET /api/users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // ── Delete User ────────────────────────────────────────────────────
  // DELETE /api/users/:id
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // ── Update Any User Detials ────────────────────────────────────────
  // PUT /api/users/:id
  updateUser: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },
};

export default adminService;
