import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, DollarSign, Star, Shield, MapPin, Search } from 'lucide-react';
import { getListingById } from '../../services/propertyService';
import SafetyBadge from '../../components/common/SafetyBadge';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', color: 'text-amber-500 bg-amber-50 border-amber-200' },
    silver: { emoji: '🥈', label: 'Silver Verified', color: 'text-slate-600 bg-slate-100 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    unverified: { emoji: '⚪', label: 'Unverified', color: 'text-slate-400 bg-slate-50 border-slate-200' },
};

const ComparePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (ids.length === 0) {
            setLoading(false);
            return;
        }

        const fetchProperties = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    ids.map(id => getListingById(id))
                );
                // Extract the parsed proper data structure based on the typical response
                const fetchedProps = results.map(res => res.data?.data || res.data);
                setProperties(fetchedProps);
            } catch (err) {
                console.error("Failed to load properties for comparison", err);
                setError('Failed to fetch some properties. They may have been removed or are unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="font-medium animate-pulse">Analyzing properties...</p>
            </div>
        );
    }

    if (ids.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-lg border border-slate-100">
                    <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Scale className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Nothing to Compare</h2>
                    <p className="text-slate-500 mb-8">Please select properties from your wishlist to compare them side-by-side.</p>
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="bg-primary-600 text-white w-full py-4 rounded-xl font-bold shadow-lg shadow-primary-200 hover:scale-105 transition-transform"
                    >
                        Go to Wishlist
                    </button>
                </div>
            </div>
        );
    }

    // Identify all unique amenities across chosen properties
    const allAmenities = new Set();
    properties.forEach(p => {
        if (p?.rooms) {
            p.rooms.forEach(r => {
                if (r.facilities) {
                    r.facilities.forEach(f => allAmenities.add(f.toLowerCase().trim()));
                }
            });
        }
    });
    const uniqueAmenities = Array.from(allAmenities).sort();

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-full transition-colors shadow-sm border border-slate-200 z-10"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compare Properties</h1>
                        <p className="text-slate-500 font-medium">Detailed side-by-side analysis</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 mb-8 font-medium">
                        {error}
                    </div>
                )}

                {/* Compare Grid */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-1/4 p-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 z-20">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Property Overview</div>
                                    </th>
                                    {properties.map((p) => {
                                        const badge = BADGE_CONFIG[p.trustBadge] || BADGE_CONFIG.unverified;
                                        return (
                                            <th key={p._id} className="w-1/4 p-6 border-b border-slate-200 align-top relative bg-white">
                                                <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-4 relative shadow-inner">
                                                    {p.photos?.[0]?.url ? (
                                                        <img src={p.photos[0].url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                                                    )}
                                                    
                                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black border backdrop-blur-md ${badge.color}`}>
                                                        {badge.emoji} {p.trustBadge?.toUpperCase()}
                                                    </div>
                                                </div>

                                                <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{p.name}</h3>
                                                <div className="flex items-start gap-1 text-slate-500 mb-4">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium line-clamp-2">{p.address}</p>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => navigate(`/listings/${p._id}`)}
                                                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Search className="w-4 h-4" /> View Details
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {/* Monthly Price Row */}
                                <tr>
                                    <td className="p-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 font-bold text-slate-700 z-10 flex items-center gap-2 h-full">
                                        <DollarSign className="w-5 h-5 text-emerald-500" /> Lowest Rent
                                    </td>
                                    {properties.map(p => {
                                        const lowestRent = p.rooms?.length 
                                            ? Math.min(...p.rooms.map(r => r.monthlyRent)) 
                                            : 0;
                                        return (
                                            <td key={p._id} className="p-6 border-b border-slate-200 font-black text-emerald-700 text-xl bg-white">
                                                {lowestRent > 0 ? `LKR ${lowestRent.toLocaleString()}` : 'N/A'}
                                                <span className="text-xs text-slate-400 font-normal"> /mo</span>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* General Rating Row */}
                                <tr>
                                    <td className="p-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 font-bold text-slate-700 z-10 flex items-center gap-2 h-full">
                                        <Star className="w-5 h-5 text-amber-500" /> Rating
                                    </td>
                                    {properties.map(p => {
                                        const rating = p.rating || 4.8; // Mocked fallback
                                        return (
                                            <td key={p._id} className="p-6 border-b border-slate-200 bg-white text-slate-800">
                                                <div className="flex items-center gap-1 font-bold text-lg">
                                                    <Star className="w-5 h-5 fill-amber-500 text-amber-500 mb-0.5" />
                                                    {rating} <span className="text-slate-400 text-sm font-medium">/ 5.0</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Safety Row */}
                                <tr>
                                    <td className="p-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 font-bold text-slate-700 z-10 flex items-center gap-2 h-full">
                                        <Shield className="w-5 h-5 text-blue-500" /> Safety Score
                                    </td>
                                    {properties.map(p => (
                                        <td key={p._id} className="p-6 border-b border-slate-200 bg-white">
                                            <SafetyBadge propertyId={p._id} showDetails={false} />
                                        </td>
                                    ))}
                                </tr>

                                {/* Rooms vs Occupants Row */}
                                <tr>
                                    <td className="p-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 font-bold text-slate-700 z-10 h-full">
                                        Capacity & Availability
                                    </td>
                                    {properties.map(p => {
                                        const totalSlots = p.rooms?.reduce((acc, r) => acc + r.totalCapacity, 0) || 0;
                                        const occupied = p.rooms?.reduce((acc, r) => acc + (r.currentOccupants?.length || 0), 0) || 0;
                                        const available = totalSlots - occupied;
                                        
                                        return (
                                            <td key={p._id} className="p-6 border-b border-slate-200 bg-white text-slate-700">
                                                <div className="font-medium">
                                                    <span className={`font-black ${available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{available}</span> slots available
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">Out of {totalSlots} total capacity</div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Amenities Section */}
                                {uniqueAmenities.map((amenity, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 px-6 bg-slate-50 border-b border-r border-slate-200 sticky left-0 text-sm font-semibold text-slate-600 capitalize z-10 h-full">
                                            {amenity}
                                        </td>
                                        {properties.map(p => {
                                            // Check if any room within this property has this amenity
                                            const hasAmenity = p.rooms?.some(r => 
                                                r.facilities?.some(f => f.toLowerCase().trim() === amenity)
                                            );
                                            
                                            return (
                                                <td key={p._id} className="p-4 border-b border-slate-200 text-center bg-white">
                                                    {hasAmenity ? (
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ComparePage;