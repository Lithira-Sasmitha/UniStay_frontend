import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Calendar, LogOut,
  User as UserIcon, ChevronDown, Loader2,
  CreditCard, XCircle, CheckCircle, Clock,
  Star,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import EditProfileModal from '../../components/modals/EditProfileModal';
import { getStudentBookings, cancelBooking, submitBookingReview } from '../../services/bookingService';

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState('');
  const [reviewFormBookingId, setReviewFormBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState({ bookingId: '', type: '', message: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getStudentBookings();
        setBookings(data.bookings || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancelLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
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
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{currentUserData?.name || 'Student'}</span>.
          </p>
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Student</p>
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

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-10">
        <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/listings')}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-primary-50 hover:border-primary-200 border border-slate-100 transition-all group"
          >
            <Search className="w-6 h-6 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Browse Listings</p>
            <p className="text-xs text-slate-500 mt-1">Find boarding places near your university</p>
          </button>
          <button
            onClick={() => document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">My Bookings</p>
            <p className="text-xs text-slate-500 mt-1">{activeBookings.length} active booking{activeBookings.length !== 1 ? 's' : ''}</p>
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
    </motion.div>
  );
};

export default StudentDashboard;
