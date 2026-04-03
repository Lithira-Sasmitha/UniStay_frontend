import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Calendar, LogOut,
  User as UserIcon, ChevronDown, ChevronRight, Loader2,
  CreditCard, XCircle, CheckCircle, Clock,
  ShieldCheck, ShieldAlert, Award, Mail, Key, Zap, Bell,
  Home, Users, MapPin, DoorOpen, Phone, TrendingUp, Heart, Star, Sparkles
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import EditProfileModal from '../../components/modals/EditProfileModal';
import { getStudentBookings, cancelBooking, getMyBoarding, submitBookingReview } from '../../services/bookingService';
import { getStudentNotices } from '../../services/noticeService';
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

const REVIEW_ELIGIBLE_STATUSES = ['approved', 'confirmed', 'completed'];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Scroll to My Boarding section when redirected from payment success
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState('');
  const [boarding, setBoarding] = useState(null);
  const [notices, setNotices] = useState([]);
  const [showBoarding, setShowBoarding] = useState(false);
  const [boardingLoading, setBoardingLoading] = useState(false);
  const [reviewFormBookingId, setReviewFormBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState({ bookingId: '', type: '', message: '' });
  
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

  const handleShowBoarding = async () => {
    setShowBoarding(true);
    setBoardingLoading(true);
    try {
      const boardingRes = await getMyBoarding();
      setBoarding(boardingRes.data.boarding || null);
    } catch (e) {
      setBoarding(null);
    }
    try {
      const noticesRes = await getStudentNotices();
      setNotices(noticesRes.data.notices || []);
    } catch (e) {
      setNotices([]);
    }
    setBoardingLoading(false);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getStudentBookings();
        setBookings(data.bookings || []);
      } catch { /* silent */ }
      await fetchProfile();
      setLoading(false);
    };
    fetch();
  }, []);

  // Scroll to My Boarding section when redirected from payment success
  useEffect(() => {
    if (location.state?.scrollToBoarding && !loading) {
      const el = document.getElementById('my-boarding-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.state, loading]);

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
    const wasConfirmed = bookings.find(b => b._id === bookingId)?.status === 'confirmed';
    setCancelLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      // If a confirmed booking is cancelled, clear boarding section immediately
      if (wasConfirmed) {
        setBoarding(null);
        setNotices([]);
      }
    } catch { /* silent */ }
    finally { setCancelLoading(''); }
  };

  const openReviewForm = (bookingId) => {
    setReviewFeedback({ bookingId: '', type: '', message: '' });
    setReviewFormBookingId(bookingId);
    setReviewRating(5);
    setReviewText('');
  };

  const handleSubmitReview = async (bookingId) => {
    const cleanedText = reviewText.trim();
    const numericRating = Number(reviewRating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      setReviewFeedback({ bookingId, type: 'error', message: 'Please select a valid rating between 1 and 5.' });
      return;
    }
    if (cleanedText.length < 20) {
      setReviewFeedback({ bookingId, type: 'error', message: 'Review text must be at least 20 characters.' });
      return;
    }

    setReviewLoading(bookingId);
    setReviewFeedback({ bookingId: '', type: '', message: '' });

    try {
      const { data } = await submitBookingReview(bookingId, {
        rating: numericRating,
        reviewText: cleanedText,
      });

      setBookings((prev) => prev.map((b) => (
        b._id === bookingId ? { ...b, review: data.review, canReview: false } : b
      )));
      setReviewFeedback({ bookingId, type: 'success', message: 'Review submitted successfully.' });
      setReviewFormBookingId('');
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      setReviewFeedback({ bookingId, type: 'error', message: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setReviewLoading('');
    }
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
              <div className="text-slate-500 font-medium leading-relaxed">
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
              </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/listings')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-primary-50 hover:border-primary-200 border border-slate-100 transition-all group"
          >
            <Search className="w-6 h-6 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Browse Listings</p>
            <p className="text-xs text-slate-500 mt-1">Find boarding places near your university</p>
          </button>
          
          <button
            onClick={handleShowBoarding}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all group relative"
          >
            <Home className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">My Boarding</p>
            <p className="text-xs text-slate-500 mt-1">View your room, roommates &amp; notices</p>
          </button>

          <button
            onClick={() => navigate('/wishlist')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-rose-50 hover:border-rose-200 border border-slate-100 transition-all group"
          >
            <Heart className="w-6 h-6 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">My Wishlist</p>
            <p className="text-xs text-slate-500 mt-1">View and compare your saved properties</p>
          </button>

          <button
            onClick={() => navigate('/my-bookings/analytics')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
          >
            <TrendingUp className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Booking Analytics</p>
            <p className="text-xs text-slate-500 mt-1">View your booking history and spending trends</p>   
          </button>

          <div className="relative group">
            <button
              disabled={!currentUserData?.isVerified || hasActiveBooking}
              onClick={() => navigate('/student/roommates')}
              className={`w-full p-6 rounded-2xl text-left transition-all border ${
                !currentUserData?.isVerified || hasActiveBooking 
                ? 'bg-slate-50 opacity-60 cursor-not-allowed border-slate-100' 
                : 'bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border-slate-100'
              }`}
            >
              <Award className={`w-6 h-6 mb-3 transition-transform ${!currentUserData?.isVerified || hasActiveBooking ? 'text-slate-400' : 'text-amber-500 group-hover:scale-110'}`} />
              <p className="font-bold text-slate-900">Roommate Finder</p>
              <p className="text-xs text-slate-500 mt-1">
                {!currentUserData?.isVerified 
                  ? 'Verification required to use this' 
                  : hasActiveBooking 
                    ? 'Active booking blocks this feature' 
                    : 'Browse and connect with verified roommates'
                }
              </p>
              
              {currentUserData?.isVerified && !hasActiveBooking && (
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-amber-200">
                   Verified Access
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── My Boarding ─────────────────────────────────────────────── */}
      {showBoarding && (
        <motion.div id="my-boarding-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">

          {/* Loading state */}
          {boardingLoading && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-slate-500 font-semibold text-sm">Loading your boarding details…</p>
              </div>
            </div>
          )}

          {/* No confirmed booking */}
          {!boardingLoading && !boarding && (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Home className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-700 mb-1">No confirmed booking yet</p>
                <p className="text-sm text-slate-400 font-medium">Complete your advance payment to unlock boarding details.</p>
              </div>
              <button
                onClick={() => navigate('/listings')}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary-100"
              >
                Browse Listings
              </button>
            </div>
          )}

          {/* Full boarding details */}
          {!boardingLoading && boarding && (
            <div className="space-y-5">

              {/* ── Hero property card ── */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Cover photo hero */}
                <div className="relative h-52 md:h-72 bg-gradient-to-br from-emerald-500 to-teal-600">
                  {boarding.property?.photos?.[0]?.url ? (
                    <img
                      src={boarding.property.photos[0].url}
                      alt={boarding.property.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  {/* Live badge */}
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Currently Staying
                    </span>
                  </div>

                  {/* Trust badge */}
                  {boarding.property?.trustBadge && boarding.property.trustBadge !== 'unverified' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg capitalize">
                        {boarding.property.trustBadge === 'gold' ? '🥇' : boarding.property.trustBadge === 'silver' ? '🥈' : '🥉'} {boarding.property.trustBadge} Verified
                      </span>
                    </div>
                  )}

                  {/* Name + address on photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">
                      {boarding.property?.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-4 h-4 text-white/70 shrink-0" />
                      <p className="text-sm text-white/85 font-medium">{boarding.property?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Photo strip — remaining photos */}
                {boarding.property?.photos?.length > 1 && (
                  <div className="flex gap-2 px-5 pt-4 overflow-x-auto pb-1 scrollbar-hide">
                    {boarding.property.photos.slice(1).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo.url}
                        alt={`Photo ${idx + 2}`}
                        className="w-20 h-16 rounded-xl object-cover shrink-0 border border-slate-100 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Description */}
                  {boarding.property?.description && (
                    <p className="text-sm text-slate-600 font-medium leading-relaxed border-l-4 border-emerald-300 pl-4 italic">
                      {boarding.property.description}
                    </p>
                  )}

                  {/* Room details grid */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Room Details</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                        <DoorOpen className="w-5 h-5 text-emerald-600 mb-2" />
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mb-0.5">Room Type</p>
                        <p className="text-sm font-black text-slate-900 capitalize">{boarding.room?.roomType || '—'}</p>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Monthly Rent</p>
                        <p className="text-sm font-black text-slate-900">LKR {boarding.room?.monthlyRent?.toLocaleString() || '—'}</p>
                      </div>
                      <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                        <Users className="w-5 h-5 text-violet-600 mb-2" />
                        <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wide mb-0.5">Roommates</p>
                        <p className="text-sm font-black text-slate-900">{boarding.roommates?.length || 0} sharing</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <CheckCircle className="w-5 h-5 text-amber-600 mb-2" />
                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Status</p>
                        <p className="text-sm font-black text-emerald-700">Confirmed</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner contact */}
                  {boarding.property?.owner && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Property Owner</p>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                          {boarding.property.owner.name?.[0]?.toUpperCase() || 'O'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-base">{boarding.property.owner.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {boarding.property.owner.email && (
                              <a
                                href={`mailto:${boarding.property.owner.email}`}
                                className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline"
                              >
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                {boarding.property.owner.email}
                              </a>
                            )}
                            {boarding.property.owner.phonenumber && (
                              <a
                                href={`tel:${boarding.property.owner.phonenumber}`}
                                className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold hover:underline"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                {boarding.property.owner.phonenumber}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Roommates ── */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Roommates</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {boarding.roommates?.length === 0 ? 'You have the room to yourself' : `${boarding.roommates.length} person${boarding.roommates.length > 1 ? 's' : ''} sharing your room`}
                      </p>
                    </div>
                  </div>
                </div>

                {boarding.roommates?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-500">No roommates yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">You have the room to yourself right now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {boarding.roommates.map((rm, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                          {rm.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900 text-base truncate">{rm.name}</p>
                          {rm.university && (
                            <p className="text-sm text-slate-500 font-medium truncate mt-0.5">{rm.university}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Recent Notices ── */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center relative">
                      <Bell className="w-4 h-4 text-purple-600" />
                      {notices.some(n => n.isUrgent) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Notices from Owner</h3>
                      <p className="text-xs text-slate-400 font-medium">{notices.length} active notice{notices.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/student/notice-board')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    View all
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {notices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Bell className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-500">No notices yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your owner hasn't posted any notices.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.slice(0, 3).map((notice) => (
                      <div key={notice._id}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                          notice.isUrgent
                            ? 'bg-red-50 border-red-200 hover:border-red-300'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notice.isUrgent ? 'bg-red-100' : 'bg-slate-100'}`}>
                          <Bell className={`w-4 h-4 ${notice.isUrgent ? 'text-red-600' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            {notice.isUrgent && (
                              <span className="text-[10px] font-black text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                                Urgent
                              </span>
                            )}
                            <p className={`font-black text-base truncate ${notice.isUrgent ? 'text-red-900' : 'text-slate-900'}`}>
                              {notice.title}
                            </p>
                          </div>
                          {notice.content && (
                            <p className={`text-sm font-medium line-clamp-2 ${notice.isUrgent ? 'text-red-700' : 'text-slate-500'}`}>
                              {notice.content}
                            </p>
                          )}
                          {notice.eventDate && (
                            <p className="text-xs text-slate-400 font-medium mt-1">
                              📅 {new Date(notice.eventDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </motion.div>
      )}

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
              const hasReviewed = booking.hasReviewed ?? Boolean(booking.review);
              const canReview = booking.canReview ?? (REVIEW_ELIGIBLE_STATUSES.includes(booking.status) && !hasReviewed);
              const isReviewFormOpen = reviewFormBookingId === booking._id;
              const isSubmittingReview = reviewLoading === booking._id;
              const bookingFeedback = reviewFeedback.bookingId === booking._id ? reviewFeedback : null;

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
                        {/* Safety Decision Hub Access */}
                        {booking.property?._id && (
                          <button
                            onClick={() => navigate(`/safety-decision/${booking.property._id}`)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Safety Intelligence
                          </button>
                        )}

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

                      {canReview && (
                        <button
                          onClick={() => openReviewForm(booking._id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" /> Add Review
                        </button>
                      )}

                      {booking.review && (
                        <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Review Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {booking.review && (
                    <div className="mt-4 rounded-xl bg-white border border-slate-100 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your Review</p>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {booking.review.rating}/5
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{booking.review.reviewText}</p>
                    </div>
                  )}

                  {isReviewFormOpen && (
                    <div className="mt-4 rounded-xl bg-white border border-slate-100 p-4 space-y-3">
                      <p className="text-sm font-black text-slate-800">Submit Your Review</p>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="mt-1 w-full md:w-40 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>{r} Star{r === 1 ? '' : 's'}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Review</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={3}
                          placeholder="Share your experience with this boarding (minimum 20 characters)..."
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">{reviewText.trim().length}/20 minimum characters</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSubmitReview(booking._id)}
                          disabled={isSubmittingReview}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          {isSubmittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                          Submit Review
                        </button>
                        <button
                          onClick={() => setReviewFormBookingId('')}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                        >
                          Close
                        </button>
                      </div>

                      {bookingFeedback && (
                        <p className={`text-xs font-semibold ${bookingFeedback.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {bookingFeedback.message}
                        </p>
                      )}
                    </div>
                  )}

                  {!isReviewFormOpen && bookingFeedback && (
                    <p className={`mt-3 text-xs font-semibold ${bookingFeedback.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {bookingFeedback.message}
                    </p>
                  )}
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
