import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, ShieldCheck, Clock, User, CheckCircle2, XCircle, Loader2, Link, CornerUpLeft, Eye, Phone } from 'lucide-react';
import authService from '../../services/authService';
import { cn } from '../../utils/cn';
import ContactModal from './ContactModal';

const NotificationModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  // States for Reply & Profile
  const [replyTo, setReplyTo] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authService.getMessages();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      const response = await authService.updateMessageStatus(id, status);
      if (response.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status } : n));
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReply = (notification) => {
    setReplyTo({
      id: notification.sender?._id,
      name: notification.sender?.name,
      role: notification.sender?.role
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-end p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="relative w-full max-w-md h-full bg-white rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-5 h-5 text-primary-600" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h2>
              </div>
              <p className="text-slate-500 text-sm font-medium">Your messages and share requests</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching inbox...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 font-bold">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Inbox Empty</h3>
                <p className="text-slate-400 font-medium px-12 text-sm leading-relaxed">When people send you messages or share requests, they'll appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-3xl border transition-all",
                    notif.type === 'share_request' 
                      ? 'bg-amber-50/50 border-amber-100' 
                      : 'bg-white border-slate-100 shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      notif.type === 'share_request' ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'
                    )}>
                      {notif.type === 'share_request' ? <ShieldCheck className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <button 
                          onClick={() => setViewProfile(notif.sender)}
                          className="font-black text-slate-900 truncate hover:text-primary-600 transition-colors flex items-center gap-1 group"
                        >
                          {notif.sender?.name || 'Someone'}
                          <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                        {notif.content}
                      </p>

                      <div className="flex items-center gap-2">
                        {notif.type === 'message' && (
                          <button
                            onClick={() => handleReply(notif)}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <CornerUpLeft className="w-3 h-3" />
                            Reply
                          </button>
                        )}

                        {notif.type === 'share_request' && (
                          <>
                            {notif.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(notif._id, 'accepted')}
                                  disabled={updatingId === notif._id}
                                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-black text-xs hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  {updatingId === notif._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(notif._id, 'rejected')}
                                  disabled={updatingId === notif._id}
                                  className="flex-1 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <div className={cn(
                                "flex-1 py-2 px-4 rounded-xl text-center text-xs font-black uppercase tracking-widest border",
                                notif.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                              )}>
                                {notif.status === 'accepted' ? 'Accepted' : 'Rejected'}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Reply Modal */}
        <ContactModal 
          isOpen={!!replyTo}
          onClose={() => setReplyTo(null)}
          receiverId={replyTo?.id}
          receiverName={replyTo?.name}
          receiverRole={replyTo?.role}
        />

        {/* Simple Profile Modal */}
        <AnimatePresence>
          {viewProfile && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setViewProfile(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 pb-4 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary-50 bg-slate-100 mb-4 overflow-hidden shadow-inner">
                    {viewProfile.profileImage ? (
                      <img src={viewProfile.profileImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{viewProfile.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">
                      {viewProfile.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Faculty</p>
                      <p className="text-xs font-black text-slate-700 truncate">{viewProfile.faculty || 'Unspecified'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
                      <p className="text-xs font-black text-slate-700">{viewProfile.year || 'N/A'} - {viewProfile.semester || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hometown</p>
                      <p className="text-xs font-black text-slate-700 truncate">{viewProfile.hometown || 'Anywhere'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">University</p>
                      <p className="text-xs font-black text-slate-700 truncate">{viewProfile.university || 'SLIIT'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 text-left mb-8">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <span className="text-primary-950 font-bold text-sm truncate">{viewProfile.email}</span>
                    </div>
                    {viewProfile.phonenumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-primary-600" />
                        <span className="text-primary-950 font-bold text-sm tracking-tight">{viewProfile.phonenumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button 
                    onClick={() => setViewProfile(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-primary-600 transition-colors shadow-lg"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default NotificationModal;
