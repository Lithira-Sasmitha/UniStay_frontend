import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Scale, 
  MapPin, 
  DollarSign, 
  Star, 
  Ghost, 
  ArrowUpDown, 
  Trash2, 
  Loader2,
  HeartOff,
  CheckSquare,
  Square,
  Maximize2
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import useWishlist from '../../hooks/useWishlist';
import SafetyBadge from '../../components/common/SafetyBadge';
import PropertyCard from '../../components/cards/PropertyCard';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
    unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [compareList, setCompareList] = useState([]);

    const toggleCompare = (propertyId) => {
        if (compareList.includes(propertyId)) {
            setCompareList(compareList.filter(id => id !== propertyId));
        } else {
            if (compareList.length >= 4) {
                alert("You can only compare up to 4 properties at a time.");
                return;
            }
            setCompareList([...compareList, propertyId]);
        }
    };

    const handleCompare = () => {
        if (compareList.length >= 2) {
            navigate(`${ROUTES.COMPARE}?ids=${compareList.join(',')}`);
        }
    };

    const filteredWishlist = useMemo(() => {
        return (Array.isArray(wishlist) ? wishlist : [])
            .filter(item => 
                item && item.name && (
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            )
            .sort((a, b) => {
                if (!a || !b) return 0;
                const priceA = a.rooms?.[0]?.monthlyRent || 0;
                const priceB = b.rooms?.[0]?.monthlyRent || 0;
                const ratingA = a.averageRating || 0;
                const ratingB = b.averageRating || 0;

                if (sortBy === 'price-low') return priceA - priceB;
                if (sortBy === 'price-high') return priceB - priceA;
                if (sortBy === 'rating') return ratingB - ratingA;
                return 0;
            });
    }, [wishlist, searchTerm, sortBy]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Favorites...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shadow-rose-200">
                                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                                Favorites
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                            My Wishlist
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                             {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'} saved for consideration
                        </p>
                    </div>

                    {wishlist.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search favorites..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 w-full sm:w-64 transition-all shadow-sm"
                                />
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 w-full transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="newest">Newest Added</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-16 text-center border border-slate-200 shadow-xl shadow-slate-200/50"
                    >
                        <div className="bg-rose-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
                            <HeartOff className="w-12 h-12 text-rose-400" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Your wishlist is empty</h2>
                        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                            Explore available boarding places and save your favorites to compare and book later.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.LISTINGS)}
                            className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center gap-3 mx-auto hover:scale-105 active:scale-95"
                        >
                            <Search className="w-5 h-5" />
                            Explore Listings
                        </button>
                    </motion.div>
                ) : filteredWishlist.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <Ghost className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No properties match your search.</p>
                        <button onClick={() => setSearchTerm('')} className="text-primary-600 text-sm font-black mt-2 underline">Clear Search</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                        <AnimatePresence>
                            {filteredWishlist.map((property) => {
                                const isSelected = compareList.includes(property._id);
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={property._id}
                                        className="relative group h-full"
                                    >
                                        <div className={`h-full rounded-3xl transition-all duration-300 border-2 overflow-hidden flex flex-col shadow-sm hover:shadow-2xl ${
                                            isSelected 
                                            ? 'border-primary-500 ring-4 ring-primary-50' 
                                            : 'border-transparent hover:border-slate-200 bg-white'
                                        }`}>
                                            {/* Selection Overlay */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleCompare(property._id); }}
                                                className={`absolute top-4 right-4 z-40 p-2.5 rounded-2xl backdrop-blur-md shadow-lg transition-all sm:opacity-0 group-hover:opacity-100 ${
                                                    isSelected 
                                                        ? 'bg-primary-600 text-white opacity-100 scale-110' 
                                                        : 'bg-white/90 text-slate-500 hover:bg-white hover:text-primary-600 border border-slate-200/50'
                                                }`}
                                            >
                                                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>

                                            <PropertyCard property={property} />
                                            
                                            <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => removeFromWishlist(property._id)}
                                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl border border-rose-100 transition-all font-black text-xs uppercase tracking-wider"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Remove
                                                </button>
                                                <button
                                                    onClick={() => navigate(ROUTES.LISTING_DETAIL.replace(':propertyId', property._id))}
                                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-slate-200"
                                                >
                                                    <Maximize2 className="w-4 h-4" />
                                                    Explore
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Floating Compare Bar */}
            <AnimatePresence>
                {compareList.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 p-6 z-[60] pointer-events-none"
                    >
                        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                    <Scale className="w-7 h-7" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-black text-lg leading-none">Compare Selection</h3>
                                    <p className="text-slate-400 text-sm font-bold mt-1">
                                        {compareList.length} of 4 properties selected
                                        {compareList.length < 2 && <span className="text-primary-400 ml-2">(Select 2+ to compare)</span>}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => setCompareList([])}
                                    className="flex-1 md:flex-none px-6 py-3.5 text-sm font-black text-slate-400 hover:text-white transition-colors"
                                >
                                    Clear Selection
                                </button>
                                <button 
                                    disabled={compareList.length < 2}
                                    onClick={handleCompare}
                                    className="flex-1 md:flex-none px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-black text-sm hover:bg-primary-500 transition-all shadow-xl shadow-primary-700/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                >
                                    Compare Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WishlistPage;