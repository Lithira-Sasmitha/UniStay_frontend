import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle, Save, Upload, Trash2, FileText, X, AlertTriangle, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import { getListingById, updateProperty, addPhoto, deletePhoto } from '../../services/propertyService';

const EditListingPage = () => {
    const navigate = useNavigate();
    const { propertyId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [property, setProperty] = useState(null);

    const [form, setForm] = useState({ name: '', address: '', description: '' });
    const [newPhotos, setNewPhotos] = useState([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await getListingById(propertyId);
                const p = res.data.property;
                setProperty(p);
                setForm({ name: p.name, address: p.address, description: p.description || '' });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load property');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [propertyId]);

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNewPhotoChange = (e) => {
        const files = Array.from(e.target.files);
        const currentCount = (property?.photos?.length || 0) + newPhotos.length;
        if (currentCount + files.length > 10) {
            setError('Maximum 10 photos allowed.');
            return;
        }
        setNewPhotos(prev => [...prev, ...files]);
        setNewPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeNewPhoto = (idx) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== idx));
        setNewPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDeleteExistingPhoto = async (publicId) => {
        try {
            const res = await deletePhoto(propertyId, publicId);
            setProperty(prev => ({ ...prev, photos: res.data.photos }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete photo');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // Update property details
            const res = await updateProperty(propertyId, form);
            setProperty(prev => ({ ...prev, ...res.data.property }));

            // Upload new photos one by one
            for (const photo of newPhotos) {
                const fd = new FormData();
                fd.append('photo', photo);
                const photoRes = await addPhoto(propertyId, fd);
                setProperty(prev => ({ ...prev, photos: photoRes.data.photos }));
            }
            setNewPhotos([]);
            setNewPhotoPreviews([]);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update property');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">{error || 'Property not found'}</p>
                    <button onClick={() => navigate('/owner')} className="mt-4 text-primary-600 font-bold hover:underline">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const verificationBanner = () => {
        if (property.verificationStatus === 'verified') {
            return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800">Verified — {property.trustBadge.charAt(0).toUpperCase() + property.trustBadge.slice(1)} Badge</p>
                        {property.badgeMessage && <p className="text-xs text-emerald-600 mt-0.5">{property.badgeMessage}</p>}
                    </div>
                </div>
            );
        }
        if (property.verificationStatus === 'rejected') {
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <ShieldX className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Rejected by Admin</p>
                        <p className="text-xs text-red-600 mt-0.5">{property.rejectionReason || 'No reason provided'}</p>
                        <p className="text-xs text-red-500 mt-1">Update your listing and save to re-submit for verification.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-800">Awaiting admin verification</p>
            </div>
        );
    };

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
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Edit Listing</h1>
                    <p className="text-slate-500 font-medium mb-6">Update your property details and photos.</p>

                    {/* Verification Status Banner */}
                    <div className="mb-6">{verificationBanner()}</div>

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Property updated successfully!
                        </div>
                    )}

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
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Address * (min 10 chars)</label>
                                    <input
                                        name="address" required minLength={10} value={form.address} onChange={handleFormChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea
                                        name="description" value={form.description} onChange={handleFormChange} rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium text-slate-900 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Existing Photos */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-2">Photos</h2>
                            <p className="text-slate-500 text-sm mb-4">
                                {property.photos?.length || 0} / 10 photos uploaded
                            </p>

                            {property.photos?.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                                    {property.photos.map((photo) => (
                                        <div key={photo.publicId} className="relative group">
                                            <img src={photo.url} alt="" className="w-full h-24 object-cover rounded-xl" />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingPhoto(photo.publicId)}
                                                className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New photo upload */}
                            {(property.photos?.length || 0) + newPhotos.length < 10 && (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                    <span className="text-sm font-bold text-slate-500">Add more photos</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewPhotoChange} />
                                </label>
                            )}

                            {newPhotoPreviews.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                                    {newPhotoPreviews.map((url, i) => (
                                        <div key={i} className="relative group">
                                            <img src={url} alt="" className="w-full h-16 object-cover rounded-xl" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewPhoto(i)}
                                                className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Verification Documents (read-only display) */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-900 mb-2">Verification Documents</h2>
                            <p className="text-slate-500 text-sm mb-4">Documents uploaded during creation. Contact admin to update.</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { key: 'nicPhoto', label: 'NIC Photo' },
                                    { key: 'utilityBill', label: 'Utility Bill' },
                                    { key: 'policeReport', label: 'Police Clearance' },
                                ].map(({ key, label }) => {
                                    const doc = property.verificationDocs?.[key];
                                    const hasDoc = doc?.url;
                                    return (
                                        <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${hasDoc ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                            <FileText className={`w-5 h-5 flex-shrink-0 ${hasDoc ? 'text-emerald-600' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-medium ${hasDoc ? 'text-emerald-800' : 'text-slate-400'}`}>
                                                {label}: {hasDoc ? 'Uploaded' : 'Not provided'}
                                            </span>
                                            {hasDoc && (
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-bold text-emerald-600 hover:underline">
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                            ) : (
                                <><Save className="w-5 h-5" /> Save Changes</>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditListingPage;
