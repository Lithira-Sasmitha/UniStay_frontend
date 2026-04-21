import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const ContactModal = ({ 
  isOpen, 
  onClose, 
  receiverId, 
  receiverName, 
  receiverRole,
  propertyId = null,
  isShareRequest = false 
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !receiverId) return;

    setLoading(true);
    setStatus(null);

    try {
      await api.post('/messages', {
        receiverId,
        propertyId,
        content: message,
        type: isShareRequest ? 'share_request' : 'message',
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setMessage('');
        setStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to send message:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isShareRequest) return 'Send Share Request';
    return receiverRole === 'boardingowner' ? 'Contact Owner' : 'Send Message';
  };

  const getPlaceholder = () => {
    if (isShareRequest) return 'Hi, I am interested in sharing this boarding. Are you available?';
    return 'Write your message here...';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800">{getTitle()}</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Receiver Info */}
            <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">To</p>
                <p className="text-sm font-bold text-slate-800">
                  {receiverName || 'User'} 
                  {receiverRole && <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">{receiverRole === 'boardingowner' ? 'Owner' : receiverRole}</span>}
                </p>
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 placeholder-slate-400"
                required
              />
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-xl text-center">
                {isShareRequest ? 'Request sent successfully!' : 'Message sent successfully!'}
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center">
                Something went wrong. Please try again.
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="flex-[2] py-3 px-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send {isShareRequest ? 'Request' : 'Message'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
