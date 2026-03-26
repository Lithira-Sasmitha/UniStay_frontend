import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, DollarSign } from 'lucide-react';
import SafetyBadge from '../common/SafetyBadge';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
    unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const badge = BADGE_CONFIG[property.trustBadge] || BADGE_CONFIG.unverified;
    const coverPhoto = property.photos?.[0]?.url || null;
    const totalSlots = property.rooms?.reduce((acc, r) => acc + r.totalCapacity, 0) || 0;
    const occupied = property.rooms?.reduce((acc, r) => acc + (r.currentOccupants?.length || 0), 0) || 0;
    const available = totalSlots - occupied;

    return (
        <div
            onClick={() => navigate(`/listings/${property._id}`)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
            {/* Cover Photo */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
                {coverPhoto ? (
                    <img
                        src={coverPhoto}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-5xl">🏠</span>
                    </div>
                )}

                {/* Trust Badge */}
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm bg-white/90 ${badge.cls}`}>
                    <span>{badge.emoji}</span>
                    <span>{badge.label}</span>
                </div>

                {/* Safety Badge */}
                <div className="absolute top-3 left-3 z-10 w-fit">
                    <SafetyBadge propertyId={property._id} showDetails={false} />
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 line-clamp-1">
                    {property.name}
                </h3>

                <div className="flex items-center gap-1.5 text-slate-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium line-clamp-1">{property.address}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-600">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700">
                                LKR {property.rooms?.[0]?.monthlyRent?.toLocaleString() || '—'}
                                <span className="text-xs font-normal text-slate-400">/mo</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{available} slots free</span>
                        </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                        by {property.owner?.name || 'Owner'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
