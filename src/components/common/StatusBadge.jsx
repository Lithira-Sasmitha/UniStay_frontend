const STATUS_CONFIG = {
  // Booking/User Statuses
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  verified: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
  approved: { label: 'Approved', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-slate-50 text-slate-500 border-slate-200' },

  // Incident Statuses
  open: { label: 'Open', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  investigating: { label: 'Investigating', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  resolved: { label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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
