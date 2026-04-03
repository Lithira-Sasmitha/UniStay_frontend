import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowLeft, Users, Wifi, DollarSign, Loader2, CheckCircle, ShieldX, MessageSquare, AlertTriangle, ShieldAlert, History, Star, Heart, Wind, BookOpen, Shirt, Bath, Flame, WashingMachine, Car } from 'lucide-react';

const FACILITY_ICONS = {
    'WiFi': Wifi,
    'Air Conditioning': Wind,
    'Study Desk': BookOpen,
    'Wardrobe': Shirt,
    'Attached Bathroom': Bath,
    'Hot Water': Flame,
    'Laundry': WashingMachine,
    'Parking': Car,
};
import { getListingById, toggleWishlist, getWishlist } from '../../services/propertyService';
import { requestBooking } from '../../services/bookingService';
import useAuth from '../../hooks/useAuth';
import SafetyBadge from '../../components/common/SafetyBadge';
import StatusBadge from '../../components/common/StatusBadge';
import SafetyAssistantChat from '../../components/common/SafetyAssistantChat';
import SafeRoommateSuggestion from '../../components/common/SafeRoommateSuggestion';
import ContactModal from '../../components/modals/ContactModal';

const BADGE_CONFIG = {
    gold: { emoji: '🥇', label: 'Gold Verified', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    silver: { emoji: '🥈', label: 'Silver Verified', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    bronze: { emoji: '🥉', label: 'Bronze Verified', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
    unverified: { emoji: '⚪', label: 'Unverified', cls: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const PropertyDetailPage = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePhoto, setActivePhoto] = useState(0);
    const [bookingRoomId, setBookingRoomId] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMsg, setBookingMsg] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getListingById(propertyId);
                setProperty(data.property);
            } catch {
                setError('Property not found.');
                setLoading(false);
                return;
            }
            
            // Check if already in wishlist - separate try/catch so it doesn't break the page
            try {
                if (user && user.role === 'student') {
                    const wishRes = await getWishlist();
                    if (wishRes?.data?.success && Array.isArray(wishRes.data.wishlist)) {
                        const isInWishlist = wishRes.data.wishlist.some(item => item && item._id === propertyId);
                        setIsSaved(isInWishlist);
                    }
                }
            } catch (wishlistErr) {
                console.error('Failed to load wishlist status', wishlistErr);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [propertyId, user]);

    const handleToggleWishlist = async () => {
        if (!user) return navigate('/login');
        if (user.role !== 'student') return;
        
        setWishlistLoading(true);
        try {
            const response = await toggleWishlist(propertyId);
            if (response.data.success) {
                setIsSaved(response.data.isSaved);
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleBook = async (roomId) => {
        if (!user) return navigate('/login');
        setBookingRoomId(roomId);
        setBookingLoading(true);
        setBookingMsg('');
        try {
            await requestBooking(roomId);
            setBookingMsg('Booking request sent! Check your dashboard.');
        } catch (err) {
            setBookingMsg(err.response?.data?.message || 'Failed to send request.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="text-center py-24">
                <p className="text-4xl mb-3">😕</p>
                <h2 className="text-xl font-black text-slate-700">{error}</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 font-bold hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const badge = BADGE_CONFIG[property.trustBadge] || BADGE_CONFIG.unverified;
    const photos = property.photos || [];
    const reviews = property.reviews || [];
    const ratingSummary = property.averageRating ? `${property.averageRating}/5` : 'No ratings yet';

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to listings
                </button>

                {/* Predictive Safety Alerts */}
                <AnimatePresence>
                    {property.riskTrend === 'Increasing' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-rose-600/10 border-2 border-rose-600/20 text-rose-700 rounded-3xl p-6 mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldAlert className="w-24 h-24" />
                            </div>
                            <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shadow-rose-200">
                                <AlertTriangle className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-black tracking-tight">Predictive Safety Alert</h2>
                                    <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Critical</span>
                                </div>
                                <p className="text-sm font-bold opacity-90 leading-relaxed mb-2">
                                    ⚠ Safety risk is increasing based on an unusual spike in recent reports. 
                                    {property.riskPattern === 'Repeated Issue Detected' && (
                                        <span className="ml-1 text-rose-800 underline decoration-rose-300">Multiple incidences of the same category reported this week.</span>
                                    )}
                                </p>
                                <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-wider text-rose-900/50">
                                    <div className="flex items-center gap-1">
                                        <History className="w-3.5 h-3.5" /> Trend: Rapid Increase
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5" /> Verified Risk Analysis
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {property.riskTrend === 'Stable Risk' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-amber-500/10 border-2 border-amber-500/20 text-amber-700 rounded-3xl p-6 mb-8 flex items-start gap-4 shadow-sm"
                        >
                            <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg shadow-amber-200">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight mb-1">Ongoing Safety Concerns</h2>
                                <p className="text-sm font-bold opacity-90 leading-relaxed">
                                    ⚠ This property has several active incident reports. Students are advised to review safety metrics before booking.
                                </p>
                                <p className="text-[11px] font-black uppercase mt-2 text-amber-600/70">
                                    Trend: Persistent Risk Pattern
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Photos */}
                {photos.length > 0 && (
                    <div className="rounded-3xl overflow-hidden mb-8">
                        <img
                            src={photos[activePhoto].url}
                            alt={property.name}
                            className="w-full h-72 md:h-96 object-cover"
                        />
                        {photos.length > 1 && (
                            <div className="flex gap-2 mt-3">
                                {photos.map((p, i) => (
                                    <img
                                        key={i}
                                        src={p.url}
                                        alt=""
                                        onClick={() => setActivePhoto(i)}
                                        className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${i === activePhoto ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900">{property.name}</h1>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">{property.address}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                    {ratingSummary}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {property.reviewCount || 0} review{property.reviewCount === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            {user?.role === 'student' && (
                                <button
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-sm border mb-4 ${isSaved
                                            ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                                </button>
                            )}
                            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border ${badge.cls}`}>
                                {badge.emoji} {badge.label}
                            </div>
                            <SafetyBadge propertyId={property._id} showDetails={true} />
                            {property.badgeMessage && (
                                <p className="flex items-center gap-1 text-xs text-slate-500 mt-1.5 justify-end">
                                    <MessageSquare className="w-3 h-3" /> {property.badgeMessage}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Owner rejection banner (visible to property owner only) */}
                    {user?._id === (property.owner?._id || property.owner) && property.verificationStatus === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                            <ShieldX className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-800">This property was rejected by admin</p>
                                <p className="text-xs text-red-600 mt-0.5">{property.rejectionReason || 'No reason provided'}</p>
                                <button
                                    onClick={() => navigate(`/owner/edit-listing/${property._id}`)}
                                    className="text-xs font-bold text-red-700 hover:underline mt-1.5"
                                >
                                    Edit & Re-submit →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Not verified warning for visitors */}
                    {property.verificationStatus === 'pending' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="text-sm font-semibold text-amber-800">This property is awaiting admin verification</p>
                        </div>
                    )}

                    {/* Owner */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-500 text-sm">Listed by</p>
                            <p className="font-bold text-slate-700 text-lg">{property.owner?.name || 'Unknown Owner'}</p>
                            {property.owner?.phonenumber && <p className="text-slate-500 text-sm mt-1">📞 {property.owner.phonenumber}</p>}
                        </div>
                        {user && user.role === 'student' && property.owner && (
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Contact Owner
                            </button>
                        )}
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
                            <h2 className="font-black text-slate-900 mb-3">About this place</h2>
                            <p className="text-slate-600 leading-relaxed">{property.description}</p>
                        </div>
                    )}

                    {/* Rooms */}
                    <h2 className="text-xl font-black text-slate-900 mb-4">Available Rooms</h2>
                    {bookingMsg && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-emerald-700 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" /> {bookingMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        {(property.rooms || []).map((room) => {
                            const available = room.totalCapacity - (room.currentOccupants?.length || 0);
                            const isFull = available <= 0;
                            const isBooking = bookingRoomId === room._id;

                            return (
                                <div
                                    key={room._id}
                                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-black text-slate-800 capitalize">{room.roomType} Room</h3>
                                            {isFull && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                                                    Full
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                                <strong className="text-emerald-700">LKR {room.monthlyRent?.toLocaleString()}</strong>/mo
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                {available}/{room.totalCapacity} free
                                            </span>
                                            {room.keyMoney > 0 && (
                                                <span className="text-slate-500">Key money: LKR {room.keyMoney?.toLocaleString()}</span>
                                            )}
                                            <span className="text-slate-500">
                                                Advance: LKR {room.advanceType === 'half-month'
                                                    ? `${(room.monthlyRent / 2).toLocaleString()} (½ month)`
                                                    : room.advanceAmount?.toLocaleString()}
                                            </span>
                                        </div>
                                        {room.facilities?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {room.facilities.map((f, i) => (
                                                    <span key={i} className="flex items-center gap-1 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                                                        {(() => { const Icon = FACILITY_ICONS[f] || Wifi; return <Icon className="w-3 h-3" />; })()} {f}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {user?.role === 'student' && (
                                        <button
                                            disabled={isFull || (isBooking && bookingLoading)}
                                            onClick={() => handleBook(room._id)}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isFull
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {isBooking && bookingLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                                                </span>
                                            ) : isFull ? 'Room Full' : 'Request Booking'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Reviews */}
                    <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-slate-900">Student Reviews</h2>
                            <span className="text-sm font-semibold text-slate-500">
                                {property.reviewCount || 0} total
                            </span>
                        </div>

                        {reviews.length === 0 ? (
                            <p className="text-slate-500 text-sm">No reviews yet for this boarding.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <p className="font-bold text-slate-800">{review.student?.name || 'Student'}</p>
                                            <div className="flex items-center gap-1 text-amber-600">
                                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                <span className="text-sm font-bold">{review.rating}/5</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{review.reviewText}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Safe Roommate Suggestion Widget */}
                    <SafeRoommateSuggestion property={property} />

                </motion.div>
                
                <SafetyAssistantChat propertyId={property._id} propertyName={property.name} />

                {/* Contact Modal */}
                {property.owner && (
                    <ContactModal
                        isOpen={isContactModalOpen}
                        onClose={() => setIsContactModalOpen(false)}
                        receiverId={property.owner._id || property.owner}
                        receiverName={property.owner.name || 'Owner'}
                        receiverRole="boardingowner"
                        propertyId={property._id}
                    />
                )}
            </div>
        </div>
    );
};

export default PropertyDetailPage;
