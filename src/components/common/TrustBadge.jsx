const BADGE_CONFIG = {
  gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
  bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
  unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const TrustBadge = ({ badge, showMessage = false, message }) => {
  const config = BADGE_CONFIG[badge] || BADGE_CONFIG.unverified;

  return (
    <div>
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.cls}`}>
        {config.emoji} {config.label}
      </span>
      {showMessage && message && (
        <p className="text-xs text-slate-500 mt-1">{message}</p>
      )}
    </div>
  );
};

export default TrustBadge;
