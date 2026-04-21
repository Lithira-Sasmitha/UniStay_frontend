import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

const TYPES = {
  success: { icon: CheckCircle, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  error: { icon: AlertCircle, cls: 'bg-red-50 border-red-200 text-red-700' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const config = TYPES[type] || TYPES.success;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg font-semibold text-sm ${config.cls}`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span>{message}</span>
          <button onClick={onClose} className="p-0.5 hover:opacity-70 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
