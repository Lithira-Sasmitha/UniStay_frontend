import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Scale, MapPin, DollarSign, Star, Ghost } from 'lucide-react';
import useWishlist from '../../hooks/useWishlist';
import SafetyBadge from '../../components/common/SafetyBadge';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
    unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, removeFromWishlist } = useWishlist();
    const [compareList, setCompareList] = useState([]);

    const toggleCompare = (propertyId) => {
        if (compareList.includes(propertyId)) {
            setCompareList(compareList.filter(id => id !== propertyId));
        } else {
            if (compareList.length >= 3) {
                alert("You can only compare up to 3 properties at a time.");
                return;
            }
            setCompareList([...compareList, propertyId]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                                Favorites
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            My Wishlist
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Saved ({wishlist.length})
                        </p>
                    </div>

                    {compareList.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => alert('Compare feature coming soon!')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Scale className="w-5 h-5" />
                            Compare Selected ({compareList.length})
                        </motion.button>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
                    >
                        <Ghost className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No saved properties yet</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            Start adding boarding places to your wishlist by clicking the heart icon on any property.
                        </p>
                        <button
                            onClick={() => navigate('/listings')}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 inline-flex items-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            Browse Listings
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {wishlist.map((property) => {
                                const badge = BADGE_CONFIG[property.trustBadge] || BADGE_CONFIG.unverified;
                                const isComparing = compareList.includes(property._id);
                                const rating = property.rating || "4.8"; // Mocked if not present

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={property._id}
                                        className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
                                    >
                                        {/* Cover Image */}
                                        <div className="relative h-56 bg-slate-100">
                                            {property.coverPhoto ? (
                                                <img
                                                    src={property.coverPhoto}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover"
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

                                        {/* Body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1 flex-1">
                                                    {property.name}
                                                </h3>
                                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold ml-3 border border-amber-100 shrink-0">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                    {rating}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-slate-500 mb-4">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <span className="text-sm font-medium line-clamp-1">{property.address}</span>
                                            </div>

                                            <div className="flex items-center gap-1 text-slate-700 bg-slate-50 w-fit px-3 py-1.5 rounded-xl border border-slate-100 mb-6">
                                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                                <span className="text-base font-bold text-emerald-700">
                                                    LKR {property.price ? property.price.toLocaleString() : 'N/A'}
                                                    <span className="text-xs font-normal text-slate-500">/mo</span>
                                                </span>
                                            </div>

                                            <div className="mt-auto grid grid-cols-2 gap-3 pb-3">
                                                <button
                                                    onClick={() => toggleCompare(property._id)}
                                                    className={`py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 border transition-colors ${
                                                        isComparing 
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Scale className="w-4 h-4" />
                                                    {isComparing ? 'Comparing' : 'Compare'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => removeFromWishlist(property._id)}
                                                    className="py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 fill-rose-500" />
                                                    Remove
                                                </button>
                                            </div>
                                            
                                            <button
                                                onClick={() => navigate(`/listings/${property._id}`)}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                                            >
                                                <Search className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;