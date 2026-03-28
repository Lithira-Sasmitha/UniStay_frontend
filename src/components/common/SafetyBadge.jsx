import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import incidentService from '../../services/incidentService';

export default function SafetyBadge({ propertyId, showDetails = false }) {
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    incidentService.getPropertySafety(propertyId)
      .then(res => setSafety(res.data))
      .catch(err => console.error('Failed to get safety status', err))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-400 text-xs font-semibold animate-pulse">
        <div className="w-4 h-4 bg-slate-200 rounded-full"></div> Checking Safety...
      </div>
    );
  }

  if (!safety) return null;

  const CONFIG = {
    safe: { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200', 
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        label: 'Safe Property' 
    },
    caution: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-300', 
        icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
        label: 'Caution' 
    },
    review: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
        label: 'Under Review' 
    }
  };

  const meta = CONFIG[safety.level] || CONFIG.safe;

  return (
    <div className={`inline-flex flex-col gap-1.5`}>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm w-fit transition-all ${meta.bg} ${meta.text} ${meta.border}`}>
        {meta.icon}
        {meta.label}
        {safety.activeCount > 0 && (
          <span className="ml-1 bg-white/70 px-2 py-0.5 rounded-full text-[10px] leading-none border border-current opacity-90 shadow-sm backdrop-blur-sm">
            {safety.activeCount} Active Issues
          </span>
        )}
      </div>
      
      {showDetails && safety.lastUpdated && (
        <span className="text-[10px] text-slate-400 pl-3 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span> 
          Status Updated: {new Date(safety.lastUpdated).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}