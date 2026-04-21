import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Trash2, ArrowLeft, Loader2, CheckCircle, FileText, X, DoorOpen, Copy, Wifi, Wind, BookOpen, Shirt, Bath, Flame, WashingMachine, Car } from 'lucide-react';

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
import { createProperty } from '../../services/propertyService';

const ADVANCE_TYPES = ['fixed', 'half-month'];
const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory', 'studio'];
const COMMON_FACILITIES = ['WiFi', 'Air Conditioning', 'Study Desk', 'Wardrobe', 'Attached Bathroom', 'Hot Water', 'Laundry', 'Parking'];

const getEmptyRoom = () => ({
    id: Date.now(),
    roomType: 'single',
    monthlyRent: '',
    keyMoney: '',
    advanceAmount: '',
    advanceType: 'fixed',
    totalCapacity: 1,
    facilities: [],
});

const CreateListingPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '', address: '', description: '',
    });
    
    // Multiple rooms support
    const [rooms, setRooms] = useState([getEmptyRoom()]);
    
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [verificationFiles, setVerificationFiles] = useState({
        nicPhoto: null, utilityBill: null, policeReport: null,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Room handlers
    const handleRoomChange = (roomId, field, value) => {
        setRooms((prev) =>
            prev.map((room) =>
                room.id === roomId ? { ...room, [field]: value } : room
            )
        );
    };

    const toggleRoomFacility = (roomId, facility) => {
        setRooms((prev) =>
            prev.map((room) =>
                room.id === roomId
                    ? {
                        ...room,
                        facilities: room.facilities.includes(facility)
                            ? room.facilities.filter((f) => f !== facility)
                            : [...room.facilities, facility],
                    }
                    : room
            )
        );
    };

    const addRoom = () => {
        setRooms((prev) => [...prev, getEmptyRoom()]);
    };

    const duplicateRoom = (roomId) => {
        const roomToDuplicate = rooms.find((r) => r.id === roomId);
        if (roomToDuplicate) {
            setRooms((prev) => [
                ...prev,
                { ...roomToDuplicate, id: Date.now() },
            ]);
        }
    };

    const removeRoom = (roomId) => {
        if (rooms.length === 1) {
            setError('At least one room is required.');
            return;
        }
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 10) {
            setError('Maximum 10 photos allowed.');
            return;
        }
        setPhotos((prev) => [...prev, ...files]);
        setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };

    const removePhoto = (idx) => {
        setPhotos((prev) => prev.filter((_, i) => i !== idx));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const validateRooms = () => {
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (!room.roomType) return `Room ${i + 1}: Room type is required`;
            if (!room.monthlyRent || room.monthlyRent <= 0) return `Room ${i + 1}: Monthly rent must be greater than 0`;
            if (!room.totalCapacity || room.totalCapacity <= 0) return `Room ${i + 1}: Capacity must be at least 1`;
            if (room.advanceType === 'fixed' && (!room.advanceAmount || room.advanceAmount < 0)) {
                return `Room ${i + 1}: Advance amount is required for fixed advance type`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const roomError = validateRooms();
        if (roomError) {
            setError(roomError);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            // Property fields
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            
            // Rooms as JSON array
            const roomsData = rooms.map(({ id, ...roomData }) => ({
                ...roomData,
                monthlyRent: Number(roomData.monthlyRent),
                keyMoney: Number(roomData.keyMoney) || 0,
                advanceAmount: Number(roomData.advanceAmount) || 0,
                totalCapacity: Number(roomData.totalCapacity),
            }));
            formData.append('rooms', JSON.stringify(roomsData));
            
            // Photos
            photos.forEach((photo) => formData.append('photos', photo));
            
            // Verification docs
            if (verificationFiles.nicPhoto) formData.append('nicPhoto', verificationFiles.nicPhoto);
            if (verificationFiles.utilityBill) formData.append('utilityBill', verificationFiles.utilityBill);
            if (verificationFiles.policeReport) formData.append('policeReport', verificationFiles.policeReport);

            await createProperty(formData);
            setSuccess(true);
            setTimeout(() => navigate('/owner'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-12"
                >
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Listing Created!</h2>
                    <p className="text-slate-500 font-medium">
                        {rooms.length} room{rooms.length > 1 ? 's' : ''} added. Redirecting to your dashboard…
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Create New Listing</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        Fill in the details. Add multiple rooms for your boarding house.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl px-4 py-3 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Property Info */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-5">Property Information</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Property Name *</label>
                                    <input
                                        name="name" required value={form.name} onChange={handleFormChange}
                                        placeholder="e.g. Sunrise Boarding House"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Address * (min 10 chars)</label>
                                    <input
                                        name="address" required minLength={10} value={form.address} onChange={handleFormChange}
                                        placeholder="No. 42, Temple Road, Nugegoda"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea
                                        name="description" value={form.description} onChange={handleFormChange} rows={3}
                                        placeholder="Tell students about your place, nearby facilities, rules, etc."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Verification Documents */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-2">Verification Documents</h2>
                            <p className="text-slate-500 text-sm mb-5">Upload your verification documents (images or PDFs). More documents = higher trust badge.</p>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { name: 'nicPhoto', label: 'NIC Photo' },
                                    { name: 'utilityBill', label: 'Utility Bill' },
                                    { name: 'policeReport', label: 'Police Clearance' },
                                ].map(({ name, label }) => (
                                    <div key={name}>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                                        {verificationFiles[name] ? (
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
                                                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                <span className="text-sm font-medium text-emerald-800 truncate flex-1">{verificationFiles[name].name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setVerificationFiles(prev => ({ ...prev, [name]: null }))}
                                                    className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-500">Click to upload {label.toLowerCase()}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) {
                                                            setVerificationFiles(prev => ({ ...prev, [name]: e.target.files[0] }));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Photos */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-2">Property Photos</h2>
                            <p className="text-slate-500 text-sm mb-4">Upload up to 10 photos (JPG/PNG, max 5MB each).</p>

                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm font-bold text-slate-500">Click to upload photos</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                            </label>

                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                                    {photoPreviews.map((url, i) => (
                                        <div key={i} className="relative group">
                                            <img src={url} alt="" className="w-full h-16 object-cover rounded-xl" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Rooms Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Rooms</h2>
                                    <p className="text-slate-500 text-sm">Add all rooms in your boarding house ({rooms.length} room{rooms.length > 1 ? 's' : ''} added)</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addRoom}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                                >
                                    <Plus className="w-4 h-4" /> Add Room
                                </button>
                            </div>

                            <AnimatePresence>
                                {rooms.map((room, index) => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                                    >
                                        {/* Room Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                                    <DoorOpen className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900">Room {index + 1}</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => duplicateRoom(room.id)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                                                    title="Duplicate room"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                {rooms.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRoom(room.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                                                        title="Remove room"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Room Fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Room Type *</label>
                                                <select
                                                    value={room.roomType}
                                                    onChange={(e) => handleRoomChange(room.id, 'roomType', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900 capitalize"
                                                >
                                                    {ROOM_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Capacity *</label>
                                                <input
                                                    type="number" min="1" required
                                                    value={room.totalCapacity}
                                                    onChange={(e) => handleRoomChange(room.id, 'totalCapacity', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Monthly Rent (LKR) *</label>
                                                <input
                                                    type="number" min="1" required
                                                    value={room.monthlyRent}
                                                    onChange={(e) => handleRoomChange(room.id, 'monthlyRent', e.target.value)}
                                                    placeholder="15000"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Key Money (LKR)</label>
                                                <input
                                                    type="number" min="0"
                                                    value={room.keyMoney}
                                                    onChange={(e) => handleRoomChange(room.id, 'keyMoney', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Advance Type *</label>
                                                <select
                                                    value={room.advanceType}
                                                    onChange={(e) => handleRoomChange(room.id, 'advanceType', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                                >
                                                    {ADVANCE_TYPES.map((t) => (
                                                        <option key={t} value={t}>{t === 'half-month' ? 'Half Month Rent' : 'Fixed Amount'}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {room.advanceType === 'fixed' && (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Advance Amount (LKR) *</label>
                                                    <input
                                                        type="number" min="0"
                                                        required={room.advanceType === 'fixed'}
                                                        value={room.advanceAmount}
                                                        onChange={(e) => handleRoomChange(room.id, 'advanceAmount', e.target.value)}
                                                        placeholder="5000"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Facilities */}
                                        <div className="mt-5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Facilities</label>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_FACILITIES.map((f) => (
                                                    <button
                                                        key={f} type="button"
                                                        onClick={() => toggleRoomFacility(room.id, f)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${room.facilities.includes(f)
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-200'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        {(() => { const Icon = FACILITY_ICONS[f]; return Icon ? <Icon className="w-3.5 h-3.5" /> : null; })()}
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Another Room Button (inline) */}
                            <button
                                type="button"
                                onClick={addRoom}
                                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                            >
                                <Plus className="w-5 h-5" /> Add Another Room
                            </button>
                        </section>

                        {/* Summary */}
                        <div className="bg-slate-100 rounded-2xl p-6">
                            <h3 className="font-black text-slate-900 mb-3">Summary</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div className="bg-white rounded-xl p-4">
                                    <p className="text-2xl font-black text-primary-600">{rooms.length}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Rooms</p>
                                </div>
                                <div className="bg-white rounded-xl p-4">
                                    <p className="text-2xl font-black text-emerald-600">
                                        {rooms.reduce((sum, r) => sum + (parseInt(r.totalCapacity) || 0), 0)}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Total Beds</p>
                                </div>
                                <div className="bg-white rounded-xl p-4">
                                    <p className="text-2xl font-black text-blue-600">{photos.length}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Photos</p>
                                </div>
                                <div className="bg-white rounded-xl p-4">
                                    <p className="text-2xl font-black text-amber-600">
                                        {Object.values(verificationFiles).filter(Boolean).length}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Documents</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Creating Listing…</>
                            ) : (
                                <><Plus className="w-5 h-5" /> Create Listing with {rooms.length} Room{rooms.length > 1 ? 's' : ''}</>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateListingPage;
