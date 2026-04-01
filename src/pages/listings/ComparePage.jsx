import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Maximize2, 
    X, 
    MapPin, 
    Users, 
    CheckCircle, 
    ShieldCheck,
    Loader2,
    DollarSign,
    Wifi
} from 'lucide-react';
import { getListingById } from '../../services/propertyService';
import Button from '../../components/common/Button';

const ComparePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch details for all selected properties
    useEffect(() => {
        const fetchProperties = async () => {
            if (ids.length < 2) {
                setError('Please select at least 2 properties to compare.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const propsData = await Promise.all(
                    ids.map(async (id) => {
                        try {
                            const res = await getListingById(id);
                            return res.data.property;
                        } catch (err) {
                            return null;
                        }
                    })
                );
                
                // Filter out any failed fetches
                setProperties(propsData.filter(p => p !== null));
            } catch (err) {
                setError('Failed to load properties for comparison.');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [searchParams]);

    const handleRemove = (idToRemove) => {
        const filteredIds = ids.filter(id => id !== idToRemove);
        
        if (filteredIds.length < 2) {
            navigate('/wishlist'); // Not enough to compare, go back
        } else {
            // Update URL to trigger refetch / rerender
            setSearchParams({ ids: filteredIds.join(',') });
        }
    };

    // Calculate score
    const getScore = (property) => {
        let score = 0;
        
        // Base rating
        score += (property.averageRating || 0) * 10;
        
        // Safety badge bonus
        if (property.trustBadge === 'gold') score += 20;
        else if (property.trustBadge === 'silver') score += 10;
        else if (property.trustBadge === 'bronze') score += 5;
        
        // Rent heuristic (lower is better, assuming avg rent is 10000)
        const rent = property.rooms?.[0]?.monthlyRent || 0;
        if (rent > 0) {
           score += Math.max(0, 30 - (rent / 1000)); // Will add slightly more points for cheaper places
        }

        // Room capacity slots heuristic
        const available = property.rooms?.reduce((acc, r) => acc + (r.totalCapacity - (r.currentOccupants?.length || 0)), 0) || 0;
        if (available > 0) score += 5;

        return score;
    };

    // Calculate ranking
    const rankedProperties = [...properties].sort((a, b) => getScore(b) - getScore(a));
    const bestProperty = rankedProperties[0];
    const bestPropertyId = bestProperty?._id;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Analyzing properties...</p>
            </div>
        );
    }

    if (error || properties.length < 2) {
        return (
            <div className="min-h-screen pt-24 px-4 text-center">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{error || "Invalid comparison state"}</h2>
                <Button onClick={() => navigate('/wishlist')} variant="primary" className="mt-4">
                    Return to Wishlist
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-[90rem] mx-auto px-4 py-8 md:py-12 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Wishlist
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Maximize2 className="w-7 h-7 text-primary-600" />
                        Compare Properties
                    </h1>
                </div>
            </div>
            {/* AI Suggestion Box */}
            {bestProperty && (
                <div className="mb-8 bg-emerald-50 border border-emerald-200 shadow-sm rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl shrink-0">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-black text-emerald-800 mb-1">Top Recommendation for You</h2>
                        <p className="text-emerald-700 text-sm md:text-base leading-relaxed">
                            Based on your selection, <strong>{bestProperty.name}</strong> is the most suitable boarding for booking. 
                            It ranks #1 with a comparison score of {Math.round(getScore(bestProperty))}, 
                            {bestProperty.rooms?.[0]?.monthlyRent ? ` offering competitive rent at LKR ${bestProperty.rooms[0].monthlyRent.toLocaleString()}` : ' with good amenities, '} 
                            {bestProperty.trustBadge ? ` and features a ${bestProperty.trustBadge} trust badge` : ' and generally positive reviews'}.
                            We highly recommend booking this property as it provides the best overall value and reliability!
                        </p>
                    </div>
                    <div>
                        <Button 
                            variant="primary" 
                            className="w-full md:w-auto mt-4 md:mt-0 whitespace-nowrap"
                            onClick={() => navigate(`/listings/${bestProperty._id}`)}
                        >
                            Book Top Choice
                        </Button>
                    </div>
                </div>
            )}
            {/* Comparison Wrapper */}
            <div className="w-full overflow-x-auto pb-8">
                <div className="flex flex-nowrap min-w-max gap-4 pb-4">
                    {/* Left Column (Labels) */}
                    <div className="w-48 xl:w-56 shrink-0 flex flex-col font-bold text-sm text-slate-500 bg-white/50 backdrop-blur-md rounded-2xl p-4 mr-2 border border-slate-200">
                        <div className="h-44 border-b border-transparent mb-4 flex items-end pb-2 uppercase tracking-wide text-xs">
                            Property Details
                        </div>
                        <div className="h-14 flex items-center border-b border-slate-100">AI Rank / Score</div>
                        <div className="h-16 flex items-center border-b border-slate-100">Monthly Rent</div>
                        <div className="h-14 flex items-center border-b border-slate-100">Trust Badge</div>
                        <div className="h-16 flex items-center border-b border-slate-100">Location</div>
                        <div className="h-14 flex items-center border-b border-slate-100">Availability</div>
                        <div className="flex-1 min-h-[140px] pt-4">Facilities</div>
                    </div>

                    {/* Property Columns */}
                    {properties.map((prop, idx) => {
                        const isBest = prop._id === bestPropertyId;
                        const rank = rankedProperties.findIndex(p => p._id === prop._id) + 1;
                        const score = Math.round(getScore(prop));
                        const rent = prop.rooms?.[0]?.monthlyRent;
                        const totalSlots = prop.rooms?.reduce((acc, r) => acc + r.totalCapacity, 0) || 0;
                        const occupied = prop.rooms?.reduce((acc, r) => acc + (r.currentOccupants?.length || 0), 0) || 0;
                        const available = totalSlots - occupied;
                        const facilities = prop.rooms?.[0]?.facilities || [];

                        return (
                            <div
                                key={prop._id}
                                className={`w-72 xl:w-80 shrink-0 bg-white border ${isBest ? 'border-primary-500 shadow-xl shadow-primary-500/10 scale-[1.02]' : 'border-slate-200 shadow-sm'} rounded-3xl p-4 flex flex-col relative transition-all`}
                            >
                                {/* Remove Button */}
                                <button 
                                    onClick={() => handleRemove(prop._id)}
                                    className="absolute -top-3 -right-3 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 p-1.5 rounded-full shadow-md z-10 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Best Banner */}
                                {isBest && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Best Choice
                                    </div>
                                )}

                                {/* Header Card / Photo */}
                                <div className="h-44 border-b border-slate-100 mb-4 flex flex-col relative overflow-hidden rounded-xl">
                                    <img 
                                        src={prop.photos?.[0]?.url || '/placeholder-room.jpg'} 
                                        alt={prop.name}
                                        className="w-full h-28 object-cover rounded-xl mb-3"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                                    />
                                    <h3 className="font-bold text-slate-800 leading-snug line-clamp-1">{prop.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-1">{prop.owner?.name || 'Owner'}</p>
                                </div>

                                {/* Rank / Score */}
                                <div className="h-14 flex items-center border-b border-slate-100 font-bold">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isBest ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                                        #{rank}
                                    </div>
                                    <span className="text-xs text-slate-400">Score: {score}</span>
                                </div>

                                {/* Rent */}
                                <div className="h-16 flex flex-col justify-center border-b border-slate-100">
                                    <span className="font-black text-emerald-600 text-lg">
                                        {rent ? `LKR ${rent.toLocaleString()}` : '—'}
                                    </span>
                                    <span className="text-xs text-slate-400">per month</span>
                                </div>

                                {/* Trust badge */}
                                <div className="h-14 flex items-center border-b border-slate-100">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                        ${prop.trustBadge === 'gold' ? 'bg-yellow-100 border border-yellow-300 text-yellow-700' : 
                                          prop.trustBadge === 'silver' ? 'bg-slate-200 border border-slate-300 text-slate-700' : 
                                          prop.trustBadge === 'bronze' ? 'bg-orange-100 border border-orange-300 text-orange-700' : 
                                          'bg-gray-100 border border-gray-200 text-gray-500'}`}>
                                        {prop.trustBadge || 'Unverified'}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="h-16 flex items-center border-b border-slate-100 text-sm font-medium text-slate-700 line-clamp-2">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                                    {prop.address || 'Location unknown'}
                                </div>

                                {/* Availability */}
                                <div className="h-14 flex items-center border-b border-slate-100 font-medium whitespace-nowrap overflow-hidden">
                                    <Users className={`w-4 h-4 mr-2 shrink-0 ${available > 0 ? 'text-primary-500' : 'text-red-500'}`} />
                                    {available > 0 ? (
                                        <span className="text-slate-700 line-clamp-1">{available} / {totalSlots} beds left</span>
                                    ) : (
                                        <span className="text-red-600 font-bold line-clamp-1">Full / No beds</span>
                                    )}
                                </div>

                                {/* Facilities */}
                                <div className="flex-1 min-h-[140px] pt-4 text-sm text-slate-600 border-b border-slate-100">
                                    {facilities.length > 0 ? (
                                        <ul className="space-y-2">
                                            {facilities.slice(0, 4).map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 line-clamp-1">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span className="capitalize">{f}</span>
                                                </li>
                                            ))}
                                            {facilities.length > 4 && (
                                                <li className="text-xs text-slate-400 font-medium pt-1">
                                                    +{facilities.length - 4} more facilities...
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <span className="text-slate-400 italic">No amenities listed</span>
                                    )}
                                </div>

                                {/* Action Bottom */}
                                <div className="pt-6 mt-auto">
                                    <Button 
                                        variant="primary" 
                                        className="w-full justify-center"
                                        onClick={() => navigate(`/listings/${prop._id}`)}
                                    >
                                        View & Book
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                    {properties.length < 4 && (
                        <div className="w-72 xl:w-80 shrink-0 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-slate-50/50 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mb-3">
                                <Maximize2 className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-bold text-center text-sm">Add more items to compare</p>
                            <button 
                                onClick={() => navigate('/wishlist')}
                                className="mt-4 text-primary-600 font-bold text-xs hover:underline"
                            >
                                Browse Wishlist →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparePage;