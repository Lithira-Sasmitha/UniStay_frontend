import React, { useEffect, useState } from 'react';
import incidentService from '../../services/incidentService';

export default function SafetyBadge({ propertyId }) {
  const [safety, setSafety] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    incidentService.getPropertySafety(propertyId)
      .then(res => setSafety(res))
      .catch(err => console.error('Failed to get safety status', err));
  }, [propertyId]);

  if (!safety) return null;

  const map = {
    safe: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: '🟢 Safe Property' },
    caution: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: '🟡 Caution' },
    review: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: '🔴 Under Safety Review' },
  };

  const meta = map[safety.level] || map.safe;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${meta.bg} ${meta.text} ${meta.border}`} title={`${safety.activeCount} active incidents`}>
      {meta.label}
    </div>
  );
}