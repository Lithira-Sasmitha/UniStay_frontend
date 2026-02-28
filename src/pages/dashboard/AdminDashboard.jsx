import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  UserCog, 
  Trash2, 
  LogOut, 
  BarChart3, 
  Activity, 
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores userId currently being updated
  const [message, setMessage] = useState(null);

  // ── Fetch Users ──────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Handle Role Change ───────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const data = await adminService.updateUserRole(userId, newRole);
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        setMessage({ type: 'success', text: `Role updated to ${newRole}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // ── Handle Delete User ──────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setActionLoading(userId);
    try {
      const data = await adminService.deleteUser(userId);
      if (data.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
        setMessage({ type: 'success', text: 'User deleted successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-slate-50 p-6 md:p-10"
    >
      {/* ── Notification Toast ─────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            System Control Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{user?.name || 'Admin'}</span>.
          </p>
        </div>
        <Button
          onClick={logout}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </motion.div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Users', value: usersList.length, icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
          { label: 'Boarding Owners', value: usersList.filter(u => u.role === ROLES.BOARDING_OWNER).length, icon: UserCog, color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
          { label: 'Platform Activity', value: 'Live', icon: Activity, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${stat.shadow}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ── User Management Section ─────────────────────────────────── */}
      <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h2>
            <p className="text-slate-500 text-sm font-medium">Review identities and assign platform permissions</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-red-100 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Role</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Identity Vault...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          u.role === ROLES.SUPER_ADMIN ? 'bg-red-50 border-red-100 text-red-600' :
                          u.role === ROLES.BOARDING_OWNER ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <select 
                          disabled={actionLoading === u._id || u.role === ROLES.SUPER_ADMIN}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-red-100 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={ROLES.STUDENT}>Set Student</option>
                          <option value={ROLES.BOARDING_OWNER}>Set Owner</option>
                          <option value={ROLES.SUPER_ADMIN}>Set Admin</option>
                        </select>
                        
                        <button 
                          disabled={actionLoading === u._id || u.role === ROLES.SUPER_ADMIN}
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                        >
                          {actionLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-slate-400 font-medium">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
