import React, { useState, useEffect, useRef } from 'react';
import incidentService from '../../services/incidentService';
import { getStudentBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { CheckCircle, UploadCloud, X, AlertTriangle, Calendar, MapPin, Building, Hash, ChevronDown, Check, Loader2 } from 'lucide-react';

export default function ReportIncidentPage() {
  const nav = useNavigate();
  
  // Data State
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Page State
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    severity: '',
    description: '',
    location: '',
    incidentDate: '',
    anyoneInvolved: '',
    whoInvolved: '',
    whoInvolvedOther: '',
    urgent: false
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Error State
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    getStudentBookings()
      .then(res => {
        const bookingsData = res.data?.bookings || res.data?.data || res.data || [];
        const confirmedBookings = Array.isArray(bookingsData) 
          ? bookingsData.filter(b => b.status === 'confirmed')
          : [];
        setBookings(confirmedBookings);
        if (confirmedBookings.length > 0) {
           setSelectedBooking(confirmedBookings[0]);
           setAllowed(true);
        } else {
           setAllowed(false);
        }
      })
      .catch(err => {
        console.error('Failed to load bookings', err);
        setAllowed(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrors(prev => ({ ...prev, photo: 'Only JPG and PNG files are allowed.' }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB.' }));
      return;
    }
    
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'This field is required';
    else if (formData.title.length > 60) newErrors.title = 'Title must be 60 characters or less';
    
    if (!formData.category) newErrors.category = 'This field is required';
    if (!formData.severity) newErrors.severity = 'This field is required';
    
    if (!formData.description.trim()) newErrors.description = 'This field is required';
    else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    
    if (!formData.location) newErrors.location = 'This field is required';
    
    if (!formData.incidentDate) newErrors.incidentDate = 'This field is required';
    else if (new Date(formData.incidentDate) > new Date()) newErrors.incidentDate = 'Date cannot be in the future';
    
    if (formData.anyoneInvolved === 'Yes') {
      if (!formData.whoInvolved) newErrors.whoInvolved = 'This field is required';
      if (formData.whoInvolved === 'Other' && !formData.whoInvolvedOther.trim()) {
        newErrors.whoInvolvedOther = 'Please specify who was involved';
      }
    }
    
    if (!formData.anyoneInvolved) newErrors.anyoneInvolved = 'This field is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDummyData = () => {
    setFormData({
      title: 'Theft of personal laptop from common room',
      category: 'Theft',
      severity: 'High',
      description: 'I left my laptop in the common room for 10 minutes and it was gone when I returned. It is a silver MacBook Pro.',
      location: 'Other',
      incidentDate: new Date().toISOString().split('T')[0],
      anyoneInvolved: 'Yes',
      whoInvolved: 'Unknown',
      whoInvolvedOther: '',
      urgent: true
    });
    setErrors({});
  };

  const clearForm = () => {
    setFormData({
      title: '',
      category: '',
      severity: '',
      description: '',
      location: '',
      incidentDate: '',
      anyoneInvolved: '',
      whoInvolved: '',
      whoInvolvedOther: '',
      urgent: false
    });
    clearPhoto();
    setErrors({});
    setApiError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      setApiError('Please fill in all required fields correctly before submitting.');
      return;
    }
    
    if (!selectedBooking) return setApiError('No active booking found to attach to this report.');

    setSubmitting(true);
    
    const form = new FormData();
    const propertyId = typeof selectedBooking?.property === 'object' 
      ? selectedBooking.property._id 
      : selectedBooking?.property;
      
    if (!propertyId) {
      setSubmitting(false);
      return setApiError('Invalid property reference. Please refresh and try again.');
    }

    form.append('propertyId', String(propertyId));
    form.append('title', formData.title.trim());
    form.append('category', formData.category);
    form.append('severity', formData.severity);
    
    let fullDescription = `Location: ${formData.location}\nDate: ${formData.incidentDate}\nAnyone Involved: ${formData.anyoneInvolved}\nUrgent: ${formData.urgent ? 'Yes' : 'No'}\n\nDetail: ${formData.description}`;
    
    if (formData.anyoneInvolved === 'Yes') {
      fullDescription += `\nWho was involved: ${formData.whoInvolved === 'Other' ? formData.whoInvolvedOther : formData.whoInvolved}`;
    }
    
    form.append('description', fullDescription);

    if (photo) form.append('photo', photo);

    try {
      await incidentService.createIncident(form);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center font-sans">
      <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
      </div>
      <div className="relative z-10 p-10 text-center bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 ring-1 ring-white/5 max-w-sm mx-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-xl font-bold text-white tracking-tight">Accessing Secure Records</p>
        <p className="text-slate-400 text-sm mt-2 font-medium">Synchronizing your active bookings...</p>
      </div>
    </div>
  );

  if (!allowed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center py-12 px-4 font-sans">
        <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        </div>
        <div className="p-10 max-w-lg mx-auto text-center relative z-10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] border border-white/10 ring-1 ring-white/5">
          <div className="inline-flex items-center justify-center p-4 text-rose-400 bg-white/5 backdrop-blur-xl rounded-3xl mb-8 border border-white/10">
            <AlertTriangle className="h-10 w-10 relative z-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Access Restricted</h2>
          <div className="p-8 bg-rose-500/5 backdrop-blur-3xl border border-rose-500/20 rounded-[2rem] text-rose-300 text-center leading-relaxed">
            <p className="font-bold text-lg mb-2">No Active Booking Found</p>
            <p className="text-sm">You must have a confirmed, active booking to report a safety issue.</p>
          </div>
          <button 
            onClick={() => nav('/student/dashboard')} 
            className="mt-10 px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-white/10 transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center py-12 px-4 font-sans">
        <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        </div>
        <div className="p-10 max-w-xl mx-auto text-center relative z-10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] border border-white/10 ring-1 ring-white/5 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-5 text-emerald-400 bg-white/5 backdrop-blur-xl rounded-[2rem] mb-8 border border-white/10">
            <CheckCircle className="h-14 w-14 relative z-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Transmission Successful</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed font-medium">
            Your report has been encrypted and secured. Our team will investigate with the highest priority.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
            <button 
              onClick={() => nav('/student/incidents')} 
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-lg hover:bg-indigo-500 transition-all duration-300"
            >
              Monitor Progress
            </button>
            <button 
              onClick={() => { setSubmitted(false); clearForm(); }} 
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-white/10 transition-all duration-300"
            >
              New Submission
            </button>
          </div>
        </div>
      </div>
    );
  }

  const propertyName = selectedBooking?.property?.name || 'Your Booked Property';
  const bookingRef = selectedBooking?._id ? selectedBooking._id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <div className="min-h-[calc(100vh-4rem)] relative py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10 mb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 text-rose-400 bg-white/5 backdrop-blur-xl rounded-2xl mb-5 border border-white/10">
            <AlertTriangle className="w-8 h-8 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Report Safety Issue</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">Report any safety concern related to your stay. All reports are handled with priority.</p>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl inline-flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center min-w-[280px]">
            <div className="flex flex-col items-center text-sm">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5"><Building size={16}/> Property</span>
              <span className="text-white font-semibold mt-1">{propertyName}</span>
            </div>
            <div className="hidden sm:block w-px bg-white/10"></div>
            <div className="flex flex-col items-center text-sm">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5"><Hash size={16}/> Booking Ref</span>
              <span className="text-slate-300 font-medium mt-1 uppercase tracking-wider">{bookingRef}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.03] backdrop-blur-3xl shadow-2xl rounded-[3rem] border border-white/10 p-6 sm:p-10 text-slate-200 relative overflow-hidden">
          <form onSubmit={submit} className="relative z-10 space-y-10">
            <div className="pb-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30">1</span>
                Basic Information
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Incident Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Theft of personal item" maxLength={60}
                    className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 text-white font-medium transition-all outline-none ${errors.title ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5 focus:border-indigo-500'}`}
                  />
                  {errors.title && <p className="text-rose-400 text-xs font-semibold mt-1 px-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select name="category" value={formData.category} onChange={handleInputChange} 
                        className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 appearance-none text-white transition-all outline-none ${errors.category ? 'border-rose-500/50' : 'border-white/5 focus:border-indigo-500'}`}
                      >
                        <option value="" disabled className="bg-[#080d1a] text-slate-500">Select category...</option>
                        <option value="Theft" className="bg-[#080d1a]">Theft</option>
                        <option value="Harassment" className="bg-[#080d1a]">Harassment</option>
                        <option value="Infrastructure" className="bg-[#080d1a]">Infrastructure</option>
                        <option value="Other" className="bg-[#080d1a]">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    {errors.category && <p className="text-rose-400 text-xs font-semibold mt-1 px-1">{errors.category}</p>}
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Severity <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Low', 'Medium', 'High'].map((sev) => (
                        <button key={sev} type="button" onClick={() => handleInputChange({ target: { name: 'severity', value: sev }})}
                          className={`py-3.5 rounded-2xl border-2 font-bold text-xs tracking-widest uppercase transition-all ${formData.severity === sev ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-white/5 bg-white/5 text-slate-500'}`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30">2</span>
                Incident Details
              </h3>
              <div className="space-y-8">
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Description <span className="text-rose-500">*</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the incident..."
                    className={`w-full px-6 py-4 rounded-3xl bg-white/[0.03] border-2 text-white min-h-[160px] transition-all outline-none ${errors.description ? 'border-rose-500/50' : 'border-white/5 focus:border-indigo-500'}`}
                  />
                  {errors.description && <p className="text-rose-400 text-xs font-semibold mt-1 px-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Location <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select name="location" value={formData.location} onChange={handleInputChange} className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 appearance-none text-white transition-all outline-none ${errors.location ? 'border-rose-500/50' : 'border-white/5'}`}>
                        <option value="" disabled className="bg-[#080d1a]">Select location...</option>
                        <option value="Room" className="bg-[#080d1a]">Room</option>
                        <option value="Bathroom" className="bg-[#080d1a]">Bathroom</option>
                        <option value="Kitchen" className="bg-[#080d1a]">Kitchen</option>
                        <option value="Outside" className="bg-[#080d1a]">Outside</option>
                        <option value="Other" className="bg-[#080d1a]">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Incident Date <span className="text-rose-500">*</span></label>
                    <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-10">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30">3</span>
                Upload Evidence
              </h3>
              <div className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all ${photoPreview ? 'border-emerald-500/50' : 'border-white/10 hover:border-indigo-500/50'}`}>
                <input type="file" onChange={handleFileChange} className="hidden" id="evidence-upload" ref={fileInputRef} />
                {!photoPreview ? (
                  <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-indigo-400 mb-4" />
                    <span className="text-lg font-bold text-white">Select Evidence Media</span>
                    <span className="text-xs text-slate-500 mt-2 font-black uppercase tracking-widest">MAX 5MB</span>
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={photoPreview} className="max-h-64 rounded-2xl" alt="Preview"/>
                    <button type="button" onClick={clearPhoto} className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-2"><X size={16}/></button>
                  </div>
                )}
              </div>
            </div>

            {apiError && <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300 text-sm font-bold">{apiError}</div>}

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-white/5">
              <button type="submit" disabled={submitting} className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-indigo-500 disabled:opacity-50">
                {submitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto"/> : 'Transmit Report'}
              </button>
              <button type="button" onClick={fillDummyData} className="w-full sm:w-auto px-8 py-5 bg-white/5 text-slate-400 font-bold rounded-2xl uppercase text-xs tracking-widest">Draft Data</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}