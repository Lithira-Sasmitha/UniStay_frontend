const STATUS_CONFIG = {
  // Booking/User Statuses
  pending: { label: 'Pending', cls: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm border-orange-200/50' },
  verified: { label: 'Verified', cls: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm border-teal-200/50' },
  rejected: { label: 'Rejected', cls: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm border-rose-200/50' },
  approved: { label: 'Approved', cls: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm border-indigo-200/50' },
  confirmed: { label: 'Confirmed', cls: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm border-emerald-200/50' },
  cancelled: { label: 'Cancelled', cls: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-sm border-slate-200/50' },

  // Incident Statuses
  open: { label: 'Open', cls: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm border-blue-200/50' },
  investigating: { label: 'Investigating', cls: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm border-amber-200/50' },
  resolved: { label: 'Resolved', cls: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm border-teal-200/50' },
};

const SIZE_CLS = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center font-bold border rounded-full uppercase tracking-wider ${config.cls} ${SIZE_CLS[size]}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
