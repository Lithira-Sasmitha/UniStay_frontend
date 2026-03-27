import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Calendar, LogOut,
  User as UserIcon, ChevronDown, Loader2,
  CreditCard, XCircle, CheckCircle, Clock,
  ShieldCheck, ShieldAlert, Award, Mail, Key, Zap
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import EditProfileModal from '../../components/modals/EditProfileModal';
import { getStudentBookings, cancelBooking } from '../../services/bookingService';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const STATUS_BADGE = {
  pending: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-300', icon: Clock, label: 'Pending' },
  approved: { cls: 'bg-blue-50 text-blue-700 border-blue-300', icon: CheckCircle, label: 'Approved' },
  confirmed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: CheckCircle, label: 'Confirmed' },
  rejected: { cls: 'bg-red-50 text-red-600 border-red-300', icon: XCircle, label: 'Rejected' },
  cancelled: { cls: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle, label: 'Cancelled' },
};

const BADGE_CONFIG = {
  gold: { emoji: '🥇' },
  silver: { emoji: '🥈' },
  bronze: { emoji: '🥉' },
  unverified: { emoji: '⚪' },
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState('');
  
  // Verification State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState({ type: '', text: '' });
  const [typedEmail, setTypedEmail] = useState(user?.email || '');

  const fetchProfile = async () => {
    try {
      const { user: profile } = await authService.getProfile();
      setCurrentUserData(profile);
      
      // Update local storage too so it persists
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({ ...stored, isVerified: profile.isVerified }));
    } catch { /* silent */ }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getStudentBookings();
        setBookings(data.bookings || []);
        await fetchProfile();
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSendOTP = async () => {
    if (!typedEmail.toLowerCase().endsWith('@my.sliit.lk')) {
      setVerifyMessage({ type: 'error', text: 'Email must be a university email (@my.sliit.lk)' });
      return;
    }
    setVerifying(true);
    setVerifyMessage({ type: '', text: '' });
    try {
      const res = await authService.sendOTP(typedEmail);
      if (res.success) {
        setOtpSent(true);
        setVerifyMessage({ type: 'success', text: res.message });
      }
    } catch (err) {
      setVerifyMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue) return;
    setVerifying(true);
    setVerifyMessage({ type: '', text: '' });
    try {
      const res = await authService.verifyOTP(otpValue);
      if (res.success) {
        setVerifyMessage({ type: 'success', text: res.message });
        setTimeout(async () => {
          setShowVerifyModal(false);
          await fetchProfile();
        }, 2000);
      }
    } catch (err) {
      setVerifyMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP' });
    } finally {
      setVerifying(false);
    }
  };

  const hasActiveBooking = bookings.some((b) => ['pending', 'approved', 'confirmed'].includes(b.status));

  const handleCancel = async (bookingId) => {
    setCancelLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch { /* silent */ }
    finally { setCancelLoading(''); }
  };

  const activeBookings = bookings.filter((b) => ['pending', 'approved', 'confirmed'].includes(b.status));
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-screen bg-slate-50 p-6 md:p-10">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Student
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-slate-500 font-medium">
              Welcome, <span className="text-slate-800 font-bold">{currentUserData?.name || 'Student'}</span>.
            </p>
            {currentUserData?.isVerified && (
               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                 className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100"
               >
                 <ShieldCheck className="w-3 h-3 text-amber-500" />
                 <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Verified</span>
               </motion.div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold">
              {currentUserData?.name?.[0] || 'S'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none mb-1">{currentUserData?.name || 'Student'}</p>
              <div className="flex items-center gap-1">
                {currentUserData?.isVerified ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Verified Student</p>
                  </>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unverified</p>
                )}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 p-2 z-[100]"
              >
                <button
                  onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-primary-600"
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

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'bg-primary-600', shadow: 'shadow-primary-200' },
          { label: 'Active Bookings', value: activeBookings.length, icon: CheckCircle, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
          { label: 'Confirmed Stays', value: bookings.filter(b => b.status === 'confirmed').length, icon: CreditCard, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
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

      {/* Verification & Badge Status Banner */}
      <motion.div variants={itemVariants} className={`rounded-3xl p-8 mb-10 overflow-hidden relative border-2 ${
         currentUserData?.isVerified 
         ? 'bg-amber-50/30 border-amber-200' 
         : 'bg-white border-dashed border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
               currentUserData?.isVerified ? 'bg-amber-100 shadow-inner' : 'bg-primary-50'
            }`}>
              {currentUserData?.isVerified 
                ? <Award className="w-8 h-8 text-amber-500" />
                : <ShieldAlert className="w-8 h-8 text-primary-600" />
              }
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentUserData?.isVerified ? 'Verified Student (Gold)' : 'Email Not Verified'}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {currentUserData?.isVerified 
                  ? (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">Account</span>
                        <span className="text-slate-700 font-bold">{currentUserData?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase">Verified</span>
                        <span className="font-bold text-amber-600">{currentUserData?.universityEmail}</span>
                      </div>
                    </div>
                  )
                  : 'Please verify your university email (@my.sliit.lk) to unlock all features including Roommate Finder.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {currentUserData?.isVerified ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                 <div className="absolute -inset-4 bg-amber-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                 <div className="relative bg-white w-28 h-28 rounded-[2rem] border-4 border-amber-100 flex flex-col items-center justify-center shadow-2xl shadow-amber-200/50">
                    <Award className="w-10 h-10 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mt-1">Verified</span>
                    <motion.div 
                       animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                       className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg"
                    >
                       <Zap className="w-3 h-3 fill-white" />
                    </motion.div>
                 </div>
              </motion.div>
            ) : (
              <button
                 onClick={() => { setShowVerifyModal(true); setOtpSent(false); setVerifyMessage({ type: '', text: '' }); }}
                 className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary-200 hover:scale-[1.05] transition-transform flex items-center gap-2"
              >
                 Verify Email Now
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-10">
        <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/listings')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-primary-50 hover:border-primary-200 border border-slate-100 transition-all group"
          >
            <Search className="w-6 h-6 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Browse Listings</p>
            <p className="text-xs text-slate-500 mt-1">Find boarding places near your university</p>
          </button>
          
          <div className="relative group">
            <button
              disabled={!currentUserData?.isVerified || hasActiveBooking}
              onClick={() => navigate('/student/roommates')}
              className={`w-full h-full p-6 rounded-2xl text-left transition-all border ${
                !currentUserData?.isVerified || hasActiveBooking 
                ? 'bg-slate-50 opacity-60 cursor-not-allowed border-slate-100' 
                : 'bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border-slate-100'
              }`}
            >
              <Award className={`w-6 h-6 mb-3 transition-transform ${!currentUserData?.isVerified || hasActiveBooking ? 'text-slate-400' : 'text-amber-500 group-hover:scale-110'}`} />
              <p className="font-bold text-slate-900">Roommate Finder</p>
              <p className="text-xs text-slate-500 mt-1">
                {!currentUserData?.isVerified 
                  ? 'Verification required' 
                  : hasActiveBooking 
                    ? 'Unavailable during active stay' 
                    : 'Browse and connect with verified roommates'
                }
              </p>
              
              {currentUserData?.isVerified && !hasActiveBooking && (
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-amber-200">
                   Verified
                </div>
              )}
            </button>
          </div>

          <button
            onClick={() => navigate('/student/incidents')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group"
          >
            <ShieldAlert className="w-6 h-6 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">My Incidents</p>
            <p className="text-xs text-slate-500 mt-1">Track and manage your safety reports</p>
          </button>
        </div>
      </motion.div>

      {/* Bookings */}
      <motion.div variants={itemVariants} id="bookings-section" className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6">My Bookings</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-black text-slate-700 text-lg mb-2">No bookings yet</p>
            <p className="text-slate-500 text-sm mb-4">Browse listings to find your perfect boarding place.</p>
            <button
              onClick={() => navigate('/listings')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Browse Listings
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusInfo = STATUS_BADGE[booking.status] || STATUS_BADGE.pending;
              const StatusIcon = statusInfo.icon;
              const propBadge = BADGE_CONFIG[booking.property?.trustBadge] || BADGE_CONFIG.unverified;
              const canCancel = ['pending', 'approved', 'confirmed'].includes(booking.status);

              return (
                <div key={booking._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{propBadge.emoji}</span>
                        <p className="font-black text-slate-800 truncate">{booking.property?.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{booking.property?.address}</p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold capitalize">{booking.room?.roomType}</span> room
                        {' · '}LKR {booking.room?.monthlyRent?.toLocaleString()}/mo
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.cls}`}>
                          <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                        </span>
                        {booking.rejectionReason && (
                          <span className="text-xs text-red-500 font-medium">
                            Reason: {booking.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Approved: pay advance */}
                      {booking.status === 'approved' && !booking.advancePaid && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => navigate(`/student/pay/${booking._id}`)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay Advance
                          </button>
                          <p className="text-[10px] text-slate-400 font-medium max-w-[160px] leading-tight">
                            💡 This advance payment reduces your first month's rent.
                          </p>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Advance Paid
                        </span>
                      )}

                      {/* Cancel */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelLoading === booking._id}
                          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {cancelLoading === booking._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !verifying && setShowVerifyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{otpSent ? 'Enter Code' : 'Confirm Email'}</h3>
                <p className="text-slate-500 font-medium">{otpSent ? `A 6-digit code was sent to ${typedEmail}` : 'Type your SLIIT email to receive an OTP'}</p>
              </div>

              {verifyMessage.text && (
                 <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border ${
                    verifyMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                 }`}>
                    {verifyMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {verifyMessage.text}
                 </div>
              )}

              <div className="space-y-6">
                {!otpSent ? (
                   <div className="space-y-6">
                      <Input
                        label="University Email"
                        placeholder="yourname@my.sliit.lk"
                        value={typedEmail}
                        onChange={(e) => setTypedEmail(e.target.value)}
                        icon={Mail}
                      />
                      <Button
                        onClick={handleSendOTP}
                        disabled={verifying}
                        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                      >
                        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
                      </Button>
                      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Verification is only available for <span className="text-primary-600">@my.sliit.lk</span> addresses
                      </p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      <Input
                        label="6-Digit Verification Code"
                        placeholder="000000"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        icon={Key}
                        className="text-center tracking-[1em] font-black text-xl"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={verifying || otpValue.length !== 6}
                        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                      >
                        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                      </Button>
                      <button 
                        onClick={handleSendOTP}
                        disabled={verifying}
                        className="w-full text-xs font-black text-primary-600 uppercase tracking-widest hover:underline"
                      >
                        Resend Code
                      </button>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentDashboard;
