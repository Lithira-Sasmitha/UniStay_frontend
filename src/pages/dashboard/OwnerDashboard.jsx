import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Building, Plus, LogOut, BarChart3,
  User as UserIcon, ChevronDown, Grid3X3, Bell, X,
  CheckCircle, XCircle, Loader2, ChevronRight,
  Users, Mail, Phone, Calendar, DoorOpen, Edit3, Trash2,
  Power, ShieldX, AlertTriangle, Eye, GraduationCap, MapPin, CreditCard,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import EditProfileModal from '../../components/modals/EditProfileModal';
import BoardingArrangeView from '../../components/BoardingArrangeView';
import {
  getOwnerListings, getBoardingArrangeView, getOwnerBoarding,
  toggleActive, deleteProperty as deletePropertyApi,
} from '../../services/propertyService';
import { getOwnerBookings, approveBooking, rejectBooking } from '../../services/bookingService';

const STATUS_BADGE = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  approved: 'bg-blue-50 text-blue-700 border-blue-300',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  rejected: 'bg-red-50 text-red-600 border-red-300',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const VERIFICATION_BADGE = {
  verified: { label: 'Verified', class: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: '✅' },
  pending: { label: 'Pending', class: 'bg-yellow-50 text-yellow-700 border-yellow-300', icon: '⏳' },
  rejected: { label: 'Rejected', class: 'bg-red-50 text-red-600 border-red-300', icon: '❌' },
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const [activeTab, setActiveTab] = useState('overview');

  // Data
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [boardingProperties, setBoardingProperties] = useState([]);
  const [boardingArrangeData, setBoardingArrangeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, property: null });
  const [actionLoading, setActionLoading] = useState('');
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propRes, bookRes, boardRes] = await Promise.all([
        getOwnerListings(),
        getOwnerBookings(),
        getOwnerBoarding(),
      ]);
      setProperties(propRes.data.properties || []);
      setBookings(bookRes.data.bookings || []);
      setBoardingProperties(boardRes.data.properties || []);
    } catch (e) {
      console.error('Error fetching owner data:', e);
    } finally {
      setLoading(false);
    }
  };

  const openBoardingArrange = async (propertyId) => {
    try {
      const res = await getBoardingArrangeView(propertyId);
      setBoardingArrangeData(res.data);
      setActiveTab('boarding-arrange');
    } catch (e) {
      console.error('Error loading boarding arrange:', e);
    }
  };

  const handleToggleActive = async (propertyId) => {
    setActionLoading(propertyId + '-toggle');
    try {
      const res = await toggleActive(propertyId);
      const { isActive, pendingBookingsCount } = res.data;
      // Update local state
      setProperties(prev => prev.map(p => p._id === propertyId ? { ...p, isActive } : p));
      setBoardingProperties(prev => prev.map(p => p._id === propertyId ? { ...p, isActive } : p));
      if (pendingBookingsCount > 0 && !isActive) {
        setSuccessMsg(`Property deactivated. ${pendingBookingsCount} pending booking(s) exist but won't be affected.`);
      } else {
        setSuccessMsg(`Property ${isActive ? 'activated' : 'deactivated'} successfully.`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setSuccessMsg('');
      alert(e.response?.data?.message || 'Failed to toggle property status');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteProperty = async () => {
    const prop = deleteModal.property;
    if (!prop) return;
    setActionLoading(prop._id + '-delete');
    try {
      const res = await deletePropertyApi(prop._id);
      setProperties(prev => prev.filter(p => p._id !== prop._id));
      setBoardingProperties(prev => prev.filter(p => p._id !== prop._id));
      setDeleteModal({ open: false, property: null });
      setSuccessMsg(`Property deleted. ${res.data.cancelledBookings || 0} booking(s) cancelled.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete property');
    } finally {
      setActionLoading('');
    }
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId + '-approve');
    try {
      await approveBooking(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'approved' } : b));
    } catch { /* silent */ }
    finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.length < 10) return;
    const { bookingId } = rejectModal;
    setActionLoading(bookingId + '-reject');
    try {
      await rejectBooking(bookingId, rejectReason);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'rejected', rejectionReason: rejectReason } : b));
      setRejectModal({ open: false, bookingId: null });
      setRejectReason('');
      setSuccessMsg('Booking rejected. Student has been notified via email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch { /* silent */ }
    finally { setActionLoading(''); }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const totalOccupied = properties.reduce((acc, p) =>
    acc + (p.rooms || []).reduce((a, r) => a + (r.currentOccupants?.length || 0), 0), 0);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'manage', label: 'Manage Boarding', icon: DoorOpen },
    { id: 'bookings', label: `Bookings ${pendingBookings.length > 0 ? `(${pendingBookings.length})` : ''}`, icon: Bell },
    { id: 'boarding-arrange', label: 'Boarding Arrange', icon: Grid3X3 },
  ];

  // Reusable property action buttons
  const PropertyActions = ({ prop, size = 'sm' }) => {
    const isRejected = prop.verificationStatus === 'rejected';
    const btnBase = size === 'sm'
      ? 'px-2.5 py-1.5 text-xs rounded-lg'
      : 'px-3 py-2 text-sm rounded-xl';
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/owner/edit-listing/${prop._id}`); }}
          className={`${btnBase} bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors flex items-center gap-1`}
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
        {!isRejected && (
          <button
            onClick={(e) => { e.stopPropagation(); openBoardingArrange(prop._id); }}
            className={`${btnBase} bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold transition-colors flex items-center gap-1`}
          >
            <Grid3X3 className="w-3 h-3" /> Arrange
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(prop._id); }}
          disabled={actionLoading === prop._id + '-toggle'}
          className={`${btnBase} font-bold transition-colors flex items-center gap-1 ${prop.isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
        >
          {actionLoading === prop._id + '-toggle' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
          {prop.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, property: prop }); }}
          className={`${btnBase} bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors flex items-center gap-1`}
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    );
  };

  // Verification status badge
  const VerificationBadge = ({ status }) => {
    const config = VERIFICATION_BADGE[status] || VERIFICATION_BADGE.pending;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-screen bg-slate-50 p-6 md:p-10">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-200">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Boarding Owner
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{currentUserData?.name || 'Owner'}</span>.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">
              {currentUserData?.name?.[0] || 'O'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none mb-1">{currentUserData?.name || 'Owner'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Property Manager</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 p-2 z-100"
              >
                <button
                  onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-amber-600"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">Edit Profile</span>
                </button>
                <div className="h-px bg-slate-50 my-1" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={currentUserData}
        onUpdate={(updated) => setCurrentUserData(updated)}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm z-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === id
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {/* ── Overview Tab ───────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
              {/* Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'My Properties', value: properties.length, icon: Home, color: 'bg-amber-600', shadow: 'shadow-amber-200' },
                  { label: 'Pending Requests', value: pendingBookings.length, icon: Bell, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
                  { label: 'Current Occupants', value: totalOccupied, icon: BarChart3, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
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

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/owner/create-listing')}
                    className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-amber-50 hover:border-amber-200 border border-slate-100 transition-all group"
                  >
                    <Plus className="w-6 h-6 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-slate-900">Add New Property</p>
                    <p className="text-xs text-slate-500 mt-1">List a new boarding place</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
                  >
                    <Bell className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-slate-900">View Booking Requests</p>
                    <p className="text-xs text-slate-500 mt-1">{pendingBookings.length} pending approval</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('boarding-arrange')}
                    className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all group"
                  >
                    <Grid3X3 className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-slate-900">Boarding Arrange</p>
                    <p className="text-xs text-slate-500 mt-1">Room & occupancy management</p>
                  </button>
                </div>
              </motion.div>

              {/* Properties */}
              {properties.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-5">My Properties</h2>
                  <div className="space-y-3">
                    {properties.map((prop) => (
                      <div key={prop._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        {/* Rejection banner */}
                        {prop.verificationStatus === 'rejected' && (
                          <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                            <ShieldX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-red-700">Rejected by Admin</p>
                              {prop.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{prop.rejectionReason}</p>}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800">{prop.name}</p>
                            <p className="text-xs text-slate-500">{prop.address}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <VerificationBadge status={prop.verificationStatus} />
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${prop.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-red-50 text-red-600 border-red-300'}`}>
                                {prop.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {prop.trustBadge !== 'unverified' && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-purple-50 text-purple-700 border-purple-300 capitalize">
                                  {prop.trustBadge} Badge
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-blue-50 text-blue-700 border-blue-300">
                                {(prop.rooms || []).length} room{(prop.rooms || []).length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <PropertyActions prop={prop} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Manage Boarding Tab ────────────────────────────────── */}
          {activeTab === 'manage' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-2">Manage Boarding</h2>
                <p className="text-sm text-slate-500 mb-6">View your properties, rooms, and current student occupants.</p>

                {boardingProperties.length === 0 ? (
                  <div className="text-center py-16">
                    <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold">No properties yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Create a property to start managing your boarding.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {boardingProperties.map((prop) => {
                      const isExpanded = expandedProperty === prop._id;
                      const totalSlots = (prop.rooms || []).reduce((a, r) => a + r.totalCapacity, 0);
                      const occupied = (prop.rooms || []).reduce((a, r) => a + (r.currentOccupants?.length || 0), 0);
                      const occupancyPct = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

                      return (
                        <div key={prop._id} className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
                          {/* Rejection banner */}
                          {prop.verificationStatus === 'rejected' && (
                            <div className="flex items-start gap-2 px-5 pt-4 pb-0">
                              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl w-full">
                                <ShieldX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-red-700">Rejected by Admin</p>
                                  {prop.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{prop.rejectionReason}</p>}
                                  <button
                                    onClick={() => navigate(`/owner/edit-listing/${prop._id}`)}
                                    className="text-xs font-bold text-red-600 hover:underline mt-1"
                                  >
                                    Edit & Re-submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Property Header */}
                          <button
                            onClick={() => setExpandedProperty(isExpanded ? null : prop._id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-100 transition-colors text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-bold text-lg">
                                {prop.name?.[0] || 'P'}
                              </div>
                              <div>
                                <p className="font-black text-slate-800">{prop.name}</p>
                                <p className="text-xs text-slate-500">{prop.address}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <VerificationBadge status={prop.verificationStatus} />
                                  <span className="text-xs text-slate-500 font-semibold">
                                    {(prop.rooms || []).length} room{(prop.rooms || []).length !== 1 ? 's' : ''} · {occupied}/{totalSlots} occupied
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <PropertyActions prop={prop} size="sm" />
                              <div className="hidden sm:block">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${occupancyPct}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 text-right">{occupancyPct}% full</p>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Rooms + Occupants */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 space-y-4">
                                  {(prop.rooms || []).map((room) => {
                                    const available = room.totalCapacity - (room.currentOccupants?.length || 0);
                                    const isFull = available <= 0;
                                    return (
                                      <div key={room._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                              <DoorOpen className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <h4 className="font-bold text-slate-800 capitalize">{room.roomType} Room</h4>
                                              <p className="text-xs text-slate-500">
                                                LKR {room.monthlyRent?.toLocaleString()}/mo · Capacity: {room.totalCapacity}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                                              <Users className="w-3 h-3" />
                                              {available}/{room.totalCapacity} free
                                            </span>
                                            {isFull && (
                                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                                                Full
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {(room.currentOccupants?.length || 0) === 0 ? (
                                          <p className="text-sm text-slate-400 italic text-center py-3">No occupants yet</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {room.currentOccupants.map((occ, idx) => (
                                              <div key={occ._id || idx} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                                                    {occ.student?.name?.[0] || '?'}
                                                  </div>
                                                  <div>
                                                    <p className="font-bold text-sm text-slate-800">{occ.student?.name || 'Unknown'}</p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                      {occ.student?.email && (
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {occ.student.email}</span>
                                                      )}
                                                      {occ.student?.phonenumber && (
                                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {occ.student.phonenumber}</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {occ.bookingDate ? new Date(occ.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                  </span>
                                                  {occ.bookingId?.advancePaid && (
                                                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">Advance Paid</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Bookings Tab ───────────────────────────────────────── */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Booking Requests</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No booking requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold">
                              {booking.student?.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{booking.student?.name}</p>
                              <p className="text-xs text-slate-500">{booking.student?.email}</p>
                            </div>
                          </div>

                          {/* Student details */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                            {booking.student?.phonenumber && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {booking.student.phonenumber}</span>
                            )}
                            {booking.student?.university && (
                              <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-slate-400" /> {booking.student.university}</span>
                            )}
                            {booking.student?.nic && (
                              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-slate-400" /> {booking.student.nic}</span>
                            )}
                            {booking.student?.age && (
                              <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-slate-400" /> Age: {booking.student.age}</span>
                            )}
                            {booking.student?.address && (
                              <span className="flex items-center gap-1 col-span-2"><MapPin className="w-3 h-3 text-slate-400" /> {booking.student.address}</span>
                            )}
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">{booking.property?.name}</span> — {booking.room?.roomType} room · LKR {booking.room?.monthlyRent?.toLocaleString()}/mo
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[booking.status] || ''}`}>
                                {booking.status}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            {booking.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {booking.rejectionReason}</p>
                            )}
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(booking._id)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            >
                              {actionLoading === booking._id + '-approve'
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejectModal({ open: true, bookingId: booking._id }); setRejectReason(''); }}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Boarding Arrange Tab ──────────────────────────────── */}
          {activeTab === 'boarding-arrange' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {boardingArrangeData ? (
                <BoardingArrangeView
                  data={boardingArrangeData}
                  onRefresh={() => openBoardingArrange(boardingArrangeData.property._id)}
                  onBack={() => setBoardingArrangeData(null)}
                />
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-3">
                  <h2 className="text-xl font-black text-slate-900 mb-5">Select a Property</h2>
                  {properties.length === 0 ? (
                    <div className="text-center py-16">
                      <Grid3X3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400 font-semibold">No properties yet.</p>
                    </div>
                  ) : (
                    properties.filter(p => p.verificationStatus !== 'rejected').map((prop) => (
                      <button
                        key={prop._id}
                        onClick={() => openBoardingArrange(prop._id)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{prop.name}</p>
                          <p className="text-xs text-slate-500">{prop.address}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* ── Reject Booking Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-slate-900">Reject Booking</h3>
                <button onClick={() => setRejectModal({ open: false, bookingId: null })} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (min 10 characters)..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-slate-900 resize-none mb-4"
              />
              <p className={`text-xs mb-4 ${rejectReason.length < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                {rejectReason.length}/10 minimum characters
              </p>
              <button
                onClick={handleReject}
                disabled={rejectReason.length < 10 || !!actionLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Rejection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Property Modal ────────────────────────────────── */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Delete Property</h3>
              </div>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete <span className="font-bold">{deleteModal.property?.name}</span>?
              </p>
              <p className="text-sm text-slate-500 mb-6">
                This cannot be undone. Any pending bookings will be automatically cancelled and students will be notified.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, property: null })}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProperty}
                  disabled={!!actionLoading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OwnerDashboard;
