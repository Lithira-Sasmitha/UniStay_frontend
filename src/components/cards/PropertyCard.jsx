import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, DollarSign, Heart } from 'lucide-react';
import SafetyBadge from '../common/SafetyBadge';
import useWishlist from '../../hooks/useWishlist';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
    unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();    const { isInWishlist, toggleWishlist } = useWishlist();
    const inWishlist = isInWishlist(property._id);
        const badge = BADGE_CONFIG[property.trustBadge] || BADGE_CONFIG.unverified;
    const coverPhoto = property.photos?.[0]?.url || null;
    const totalSlots = property.rooms?.reduce((acc, r) => acc + r.totalCapacity, 0) || 0;
    const occupied = property.rooms?.reduce((acc, r) => acc + (r.currentOccupants?.length || 0), 0) || 0;
    const available = totalSlots - occupied;
    const hasReviews = Number(property.reviewCount) > 0 && Number(property.averageRating) > 0;

    return (
        <div
            onClick={() => navigate(`/listings/${property._id}`)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
        >
            {/* Cover Photo */}
            <div className="relative h-52 bg-slate-100 overflow-hidden">
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

                {/* Badges stacked vertically on the left */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    <SafetyBadge propertyId={property._id} showDetails={false} />
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm bg-white/90 w-fit ${badge.cls}`}>
                        <span>{badge.emoji}</span>
                        <span>{badge.label}</span>
                    </div>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(property);
                    }}
                    className="absolute bottom-3 right-3 z-10 p-2 rounded-full backdrop-blur-md bg-white/70 hover:bg-white border border-white/50 shadow-sm transition-all duration-200"
                >
                    <Heart 
                        className={`w-5 h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 line-clamp-1">
                    {property.name}
                </h3>

                <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium line-clamp-1">{property.address}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {hasReviews ? `${property.averageRating}/5` : 'New'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                        {Number(property.reviewCount) || 0} review{Number(property.reviewCount) === 1 ? '' : 's'}
                    </span>
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

                <p className="text-[11px] text-slate-400 font-medium mt-2 text-right">
                    by {property.owner?.name || 'Owner'}
                </p>
            </div>
        </div>
    );
};

export default PropertyCard;
