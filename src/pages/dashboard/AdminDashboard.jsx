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
  ShieldCheck,
  ClipboardList,
  Award,
  ExternalLink,
  FileText,
  X,
  Eye,
  Building,
  Power,
  ShieldX,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService';
import {
  getVerificationQueue, setTrustBadge, rejectProperty,
  getAllProperties, toggleActive, deleteProperty as deletePropertyApi,
} from '../../services/propertyService';
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
        className={`flex items-center justify-between gap-3 bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 min-w-[130px] text-xs font-bold text-slate-700 transition-all shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 hover:bg-white active:scale-95'
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-bold ${currentRole === role.id
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


const BADGE_OPTIONS = [
  { value: 'gold', label: '🥇 Gold', desc: 'NIC + Utility Bill + Photos + Police Clearance' },
  { value: 'silver', label: '🥈 Silver', desc: 'NIC + Utility Bill + Photos' },
  { value: 'bronze', label: '🥉 Bronze', desc: 'NIC + Photos' },
  { value: 'unverified', label: '⚪ Unverified', desc: 'Remove verification' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
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

  // Verification state
  const [pendingProperties, setPendingProperties] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [badgeLoading, setBadgeLoading] = useState('');
  const [docPreview, setDocPreview] = useState(null); // { url, label }

  // Reject property modal
  const [rejectModal, setRejectModal] = useState(null); // propertyId
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Badge message modal
  const [badgeMessageModal, setBadgeMessageModal] = useState(null); // { propertyId, badge }
  const [badgeMessage, setBadgeMessage] = useState('');

  // All properties tab
  const [allProperties, setAllProperties] = useState([]);
  const [allPropsLoading, setAllPropsLoading] = useState(false);

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

  const fetchVerificationQueue = async () => {
    setVerificationLoading(true);
    try {
      const { data } = await getVerificationQueue();
      setPendingProperties(data.properties || []);
    } catch { /* silent */ }
    finally { setVerificationLoading(false); }
  };

  const fetchAllProperties = async () => {
    setAllPropsLoading(true);
    try {
      const { data } = await getAllProperties();
      setAllProperties(data.properties || []);
    } catch { /* silent */ }
    finally { setAllPropsLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    fetchVerificationQueue();
    fetchAllProperties();
  }, []);

  // Badge assignment: now opens a message modal first
  const handleBadgeClick = (propertyId, badge) => {
    setBadgeMessageModal({ propertyId, badge });
    setBadgeMessage('');
  };

  const handleSetBadge = async () => {
    if (!badgeMessageModal) return;
    const { propertyId, badge } = badgeMessageModal;
    setBadgeLoading(propertyId + badge);
    try {
      await setTrustBadge(propertyId, badge, badgeMessage);
      setMessage({ type: 'success', text: `Badge set to ${badge} successfully!` });
      if (badge !== 'unverified') {
        setPendingProperties(prev => prev.filter(p => p._id !== propertyId));
      }
      setBadgeMessageModal(null);
      setBadgeMessage('');
      fetchAllProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign badge' });
    } finally {
      setBadgeLoading('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectModal || rejectReason.length < 10) return;
    setRejectLoading(true);
    try {
      await rejectProperty(rejectModal, rejectReason);
      setMessage({ type: 'success', text: 'Property rejected. Owner has been notified via email.' });
      setPendingProperties(prev => prev.filter(p => p._id !== rejectModal));
      setRejectModal(null);
      setRejectReason('');
      fetchAllProperties();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject property' });
    } finally {
      setRejectLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAdminToggleActive = async (propertyId) => {
    setActionLoading(propertyId);
    try {
      await toggleActive(propertyId);
      fetchAllProperties();
      setMessage({ type: 'success', text: 'Property status toggled' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle status' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAdminDeleteProperty = async (propertyId, propertyName) => {
    if (!window.confirm(`Delete "${propertyName}"? Pending bookings will be cancelled.`)) return;
    setActionLoading(propertyId);
    try {
      await deletePropertyApi(propertyId);
      setAllProperties(prev => prev.filter(p => p._id !== propertyId));
      setMessage({ type: 'success', text: 'Property deleted' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete property' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

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

      <div className="relative z-10 p-6 md:p-12 max-w-[1400px] mx-auto space-y-8 shrink-0">

        {/* Notification Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50/90 border-emerald-200/50 text-emerald-700' : 'bg-red-50/90 border-red-200/50 text-red-700'
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

        {/* Document Preview Modal */}
        <AnimatePresence>
          {docPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setDocPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{docPreview.label}</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={docPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-800 p-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => setDocPreview(null)} className="text-slate-500 hover:text-slate-800 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
                  {(() => {
                    const url = docPreview.url;
                    const isPdf = url.match(/\.pdf/i) || url.includes('/raw/upload/');
                    if (isPdf) {
                      return (
                        <iframe
                          src={url}
                          title={docPreview.label}
                          className="w-full h-[70vh] rounded-lg border border-slate-200"
                        />
                      );
                    }
                    return (
                      <img
                        src={url}
                        alt={docPreview.label}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      />
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tab Switcher ──────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-xl rounded-2xl p-1.5 border border-white/60 w-fit shadow-sm">
          {[
            { id: 'users', label: 'User Registry', icon: Users, count: null },
            { id: 'verification', label: 'Verification', icon: ClipboardList, count: pendingProperties.length },
            { id: 'properties', label: 'All Properties', icon: Building, count: null },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== null && count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                  }`}>{count}</span>
              )}
            </button>
          ))}
          <button
              onClick={() => window.location.href = '/admin/safety'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-orange-600 hover:text-orange-800 hover:bg-white/60`}
          >
              <ShieldAlert className="w-4 h-4" />
              Safety Incidents
          </button>
        </motion.div>

        {/* Stats Grid — shown in users tab only */}
        {activeTab === 'users' && <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </motion.div>}

        {/* ── Verification Tab ───────────────────────────────── */}
        {activeTab === 'verification' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`${glassCard} rounded-[2.5rem]`}>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Verification Queue</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">Review property documents and assign trust badges.</p>

              {verificationLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-lg">All Clear!</p>
                  <p className="text-slate-400 text-sm">No pending properties to review.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingProperties.map((prop) => {
                    const docs = prop.verificationDocs || {};
                    return (
                      <div key={prop._id} className="bg-white/70 rounded-3xl border border-slate-100 shadow-sm p-6">
                        {/* Property info */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="font-black text-slate-900 text-lg">{prop.name}</h3>
                            <p className="text-slate-500 text-sm">{prop.address}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              Owner: <span className="font-semibold text-slate-600">{prop.owner?.name}</span>
                              {' '}· {prop.owner?.email}
                              {prop.owner?.phonenumber && <> · {prop.owner.phonenumber}</>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {prop.photos?.length > 0 && (
                              <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-lg">
                                {prop.photos.length} photo{prop.photos.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cover photo */}
                        {prop.photos?.[0]?.url && (
                          <img src={prop.photos[0].url} alt={prop.name} className="w-full h-40 object-cover rounded-2xl mb-4 border border-slate-100" />
                        )}

                        {/* Verification docs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                          {[
                            { key: 'nicPhoto', label: 'NIC Photo', required: true },
                            { key: 'utilityBill', label: 'Utility Bill', required: true },
                            { key: 'policeReport', label: 'Police Clearance', required: false },
                          ].map(({ key, label, required }) => (
                            <div
                              key={key}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold ${docs[key]?.url
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : required
                                  ? 'bg-red-50 border-red-200 text-red-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{label}</span>
                              {docs[key]?.url ? (
                                <button
                                  onClick={() => setDocPreview({ url: docs[key].url, label })}
                                  className="text-emerald-600 hover:text-emerald-800"
                                  title={`View ${label}`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px]">{required ? 'MISSING' : 'Optional'}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Badge assignment + Reject */}
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" /> Assign Trust Badge
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {BADGE_OPTIONS.map(({ value, label, desc }) => (
                                <button
                                  key={value}
                                  title={desc}
                                  disabled={!!badgeLoading}
                                  onClick={() => handleBadgeClick(prop._id, value)}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all disabled:opacity-50 ${prop.trustBadge === value
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => { setRejectModal(prop._id); setRejectReason(''); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                          >
                            <ShieldX className="w-4 h-4" /> Reject Property
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── User Management Tab ─────────────────────────── */}
        {/* ── All Properties Tab ──────────────────────────── */}
        {activeTab === 'properties' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`${glassCard} rounded-[2.5rem]`}>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">All Properties</h2>
              <p className="text-slate-500 text-sm font-medium mb-6">Manage all properties on the platform.</p>

              {allPropsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : allProperties.length === 0 ? (
                <div className="text-center py-20">
                  <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-lg">No Properties</p>
                  <p className="text-slate-400 text-sm">No properties have been created yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allProperties.map((prop) => {
                    const totalRooms = (prop.rooms || []).length;
                    const totalOccupied = (prop.rooms || []).reduce((a, r) => a + (r.currentOccupants?.length || 0), 0);
                    const statusColors = {
                      verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                      rejected: 'bg-red-50 text-red-600 border-red-200',
                    };
                    return (
                      <div key={prop._id} className="bg-white/70 rounded-2xl border border-slate-100 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-900">{prop.name}</h3>
                            <p className="text-sm text-slate-500">{prop.address}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Owner: <span className="font-semibold text-slate-600">{prop.owner?.name}</span> · {prop.owner?.email}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${statusColors[prop.verificationStatus] || ''}`}>
                                {prop.verificationStatus}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${prop.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                {prop.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {prop.trustBadge !== 'unverified' && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-purple-50 text-purple-700 border-purple-200 capitalize">
                                  {prop.trustBadge} Badge
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-blue-50 text-blue-700 border-blue-200">
                                {totalRooms} rooms · {totalOccupied} occupied
                              </span>
                            </div>
                            {prop.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1.5">Rejection: {prop.rejectionReason}</p>
                            )}
                            {prop.badgeMessage && (
                              <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {prop.badgeMessage}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAdminToggleActive(prop._id)}
                              disabled={actionLoading === prop._id}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${prop.isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                            >
                              {actionLoading === prop._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                              {prop.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleAdminDeleteProperty(prop._id, prop.name)}
                              disabled={actionLoading === prop._id}
                              className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                            <a
                              href={`/listings/${prop._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── User Management Tab ─────────────────────────── */}
        {activeTab === 'users' && <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-[2.5rem] overflow-hidden">
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
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-sm ${u.role === ROLES.SUPER_ADMIN ? 'bg-red-50/80 border-red-200 text-red-700' :
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
        </motion.div>}
      </div>

      {/* ── Badge Message Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {badgeMessageModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setBadgeMessageModal(null); setBadgeMessage(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">
                  Assign {badgeMessageModal.badge.charAt(0).toUpperCase() + badgeMessageModal.badge.slice(1)} Badge
                </h3>
                <button onClick={() => { setBadgeMessageModal(null); setBadgeMessage(''); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Add an optional note explaining this badge assignment. This will be visible to the property owner.
              </p>

              <textarea
                value={badgeMessage}
                onChange={(e) => setBadgeMessage(e.target.value)}
                placeholder="e.g., All documents verified and property inspected"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900 resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setBadgeMessageModal(null); setBadgeMessage(''); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetBadge}
                  disabled={badgeLoading}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {badgeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  Assign Badge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Property Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setRejectModal(null); setRejectReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-red-600 flex items-center gap-2">
                  <ShieldX className="w-5 h-5" /> Reject Property
                </h3>
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Provide a reason for rejecting this property. The owner will be notified via email and can re-submit after making changes.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., NIC photo is blurry. Please upload a clear photo of your National ID card."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-slate-900 resize-none mb-2"
              />
              <p className={`text-xs mb-4 ${rejectReason.length < 10 ? 'text-red-400' : 'text-slate-400'}`}>
                {rejectReason.length}/10 characters minimum
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectProperty}
                  disabled={rejectLoading || rejectReason.length < 10}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rejectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                  Reject Property
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
