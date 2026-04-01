import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  BookOpen, 
  ExternalLink,
  Loader2,
  HeartOff
} from 'lucide-react';
import { getWishlist, toggleWishlist } from '../../services/propertyService';
import PropertyCard from '../../components/cards/PropertyCard';
import Button from '../../components/common/Button';

const WishlistPage = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'price-low', 'price-high', 'rating'

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await getWishlist();
            if (response.data.success) {
                // Ensure wishlist is an array
                setWishlist(Array.isArray(response.data.wishlist) ? response.data.wishlist : []);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (e, propertyId) => {
        e.stopPropagation();
        try {
            const response = await toggleWishlist(propertyId);
            if (response.data.success) {
                setWishlist(prev => prev.filter(item => item && item._id !== propertyId));
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    // Filter and Sort with safety checks
    const filteredWishlist = (Array.isArray(wishlist) ? wishlist : [])
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
            return 0; // default newest (original order)
        });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                        My Wishlist
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'} saved
                    </p>
                </div>

                {wishlist.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search saved items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full transition-all cursor-pointer"
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

            {/* Content section */}
            {wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartOff className="w-10 h-10 text-rose-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No saved properties yet</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        Explore our listings and save the ones you like to compare and decide later.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/listings')}
                        className="rounded-xl px-8"
                    >
                        Explore Listings
                    </Button>
                </div>
            ) : filteredWishlist.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500">No properties match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWishlist.map((property) => (
                        <div key={property._id} className="relative group">
                            {/* Property Card Wrapper */}
                            <PropertyCard property={property} />
                            
                            {/* Action Overlays / Buttons */}
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={(e) => handleRemove(e, property._id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 text-sm font-semibold transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                                <button
                                    onClick={() => navigate(`/listings/${property._id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;