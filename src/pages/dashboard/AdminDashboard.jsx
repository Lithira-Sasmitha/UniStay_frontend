import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  UserCog, 
  Trash2, 
  LogOut, 
  Activity, 
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  ChevronDown,
  Edit,
  ShieldCheck
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService';
import EditProfileModal from '../../components/modals/EditProfileModal';
import AdminEditUserModal from '../../components/modals/AdminEditUserModal';
import { ROLES } from '../../utils/constants';

// ── CUSTOM ROLE DROPDOWN ─────────────────────────────────────────────
const RoleDropdown = ({ currentRole, onRoleChange, disabled, userId, actionLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const roles = [
    { id: ROLES.STUDENT, label: 'Student', icon: UserIcon },
    { id: ROLES.BOARDING_OWNER, label: 'Owner', icon: UserCog },
    { id: ROLES.SUPER_ADMIN, label: 'Admin', icon: ShieldCheck },
  ];

  const selectedRole = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <div className="relative">
      <button
        disabled={disabled || actionLoading === userId}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 min-w-[130px] text-xs font-bold text-slate-700 transition-all shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 hover:bg-white active:scale-95'
        }`}
      >
        <span className="truncate">{selectedRole.label}</span>
        {actionLoading === userId ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            {/* Overlay to close on click outside */}
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white p-1.5 z-[70] overflow-hidden"
            >
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-bold ${
                    currentRole === role.id 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <role.icon className={`w-3.5 h-3.5 ${currentRole === role.id ? 'text-white/70' : 'text-slate-400'}`} />
                  {role.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

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
    show: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  // Glassmorphic card class
  const glassCard = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 rounded-[2rem] p-8";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans tracking-tight"
    >
      {/* Abstract Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      <div className="relative z-10 p-6 md:p-12 max-w-[1400px] mx-auto space-y-12 shrink-0">
        
        {/* Notification Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl flex items-center gap-3 border ${
                message.type === 'success' ? 'bg-emerald-50/90 border-emerald-200/50 text-emerald-700' : 'bg-red-50/90 border-red-200/50 text-red-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 drop-shadow-sm" /> : <AlertCircle className="w-5 h-5 drop-shadow-sm" />}
              <span className="font-semibold text-sm tracking-tight">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-100/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-200/50">
                Super Admin
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-[-0.03em] leading-tight">
              Control Center
            </h1>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed text-lg max-w-xl">
              System access granted. Welcome back, <span className="text-slate-800 font-semibold">{currentUserData?.name || 'Admin'}</span>.
            </p>
          </div>
          
          <div className="relative z-50">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white/60 backdrop-blur-xl p-2.5 pr-5 rounded-2xl border border-white max-w-[240px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-700 font-bold border border-white shadow-inner">
                {currentUserData?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left overflow-hidden">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1.5 truncate">{currentUserData?.name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Super Admin</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white p-2"
                >
                  <button 
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-slate-100/80 transition-colors text-slate-600 hover:text-slate-900"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-tight">Edit Profile</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-50/80 transition-colors text-slate-600 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-tight">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Edit Profile Modal */}
        <EditProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userData={currentUserData}
          onUpdate={(updated) => setCurrentUserData(updated)}
        />

        {/* Edit User Modal (Admin updating others) */}
        <AdminEditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
          }}
          userData={userToEdit}
          onUpdate={(updated) => {
            setUsersList(prev => prev.map(u => u._id === updated._id ? updated : u));
          }}
        />

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Users', value: usersList.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100/50', iconBg: 'bg-blue-500 shadow-blue-500/20' },
            { label: 'Boarding Owners', value: usersList.filter(u => u.role === ROLES.BOARDING_OWNER).length, icon: UserCog, color: 'text-indigo-600', bg: 'bg-indigo-100/50', iconBg: 'bg-indigo-500 shadow-indigo-500/20' },
            { label: 'Platform Activity', value: 'Live', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100/50', iconBg: 'bg-emerald-500 shadow-emerald-500/20' },
          ].map((stat, i) => (
            <div key={i} className={glassCard}>
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{stat.label}</p>
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* User Management Section */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 md:p-10 border-b border-white/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/20">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">User Registry</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Review platform identities and assign permissions.</p>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 border border-slate-200/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto p-4 md:p-6">
            <div className="bg-white/40 rounded-3xl overflow-hidden border border-white/50 shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/40">
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Identity</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Role Status</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-32 text-center">
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Vault...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-white/60 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg border border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[15px] mb-0.5 tracking-tight">{u.name}</p>
                              <p className="text-xs text-slate-500 font-medium tracking-tight">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                            u.role === ROLES.SUPER_ADMIN ? 'bg-red-50/80 border-red-200 text-red-700' :
                            u.role === ROLES.BOARDING_OWNER ? 'bg-amber-50/80 border-amber-200 text-amber-700' :
                            'bg-slate-50/80 border-slate-200 text-slate-700'
                          }`}>
                            {u.role === ROLES.SUPER_ADMIN && <Shield className="w-3 h-3 mr-1.5" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end gap-3">
                            <RoleDropdown 
                              currentRole={u.role}
                              onRoleChange={(newRole) => handleRoleChange(u._id, newRole)}
                              disabled={u.role === ROLES.SUPER_ADMIN}
                              userId={u._id}
                              actionLoading={actionLoading}
                            />
                            
                            <button 
                              onClick={() => {
                                setUserToEdit(u);
                                setIsEditUserModalOpen(true);
                              }}
                              className="p-2.5 text-slate-400 bg-white/80 border border-slate-200 shadow-sm hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button 
                              disabled={actionLoading === u._id || u.role === ROLES.SUPER_ADMIN}
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2.5 text-slate-400 bg-white/80 border border-slate-200 shadow-sm hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {actionLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-8 py-24 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-semibold tracking-tight">No identities match your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
