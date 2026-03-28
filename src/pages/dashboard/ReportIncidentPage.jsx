import React, { useState, useEffect, useRef } from 'react';
import incidentService from '../../services/incidentService';
import { getStudentBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { CheckCircle, UploadCloud, X, AlertTriangle, Calendar, MapPin, Building, Hash, ChevronDown, Check } from 'lucide-react';

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
    
    if (!validateForm()) return;
    if (!selectedBooking) return setApiError('No active booking found to attach to this report.');

    setSubmitting(true);
    
    const form = new FormData();
    const propertyId = selectedBooking?.property?._id || selectedBooking?.property;
    form.append('propertyId', propertyId);
    form.append('title', formData.title);
    form.append('category', formData.category);
    form.append('severity', formData.severity);
    
    // Append additional info to description since backend only has description field
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
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center font-sans selection:bg-indigo-500 selection:text-white">
      {/* Animated Dark Gradient Background */}
      <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-8000"></div>
        {/* Subtle noise/grain texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
      <div className="relative z-10 p-10 text-center bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 ring-1 ring-white/5 max-w-sm mx-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
        <p className="text-xl font-bold text-white tracking-tight">Accessing Secure Records</p>
        <p className="text-slate-400 text-sm mt-2 font-medium">Synchronizing your active bookings...</p>
      </div>
    </div>
  );

  if (!allowed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center py-12 px-4 font-sans selection:bg-indigo-500 selection:text-white">
        {/* Animated Dark Gradient Background */}
        <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-8000"></div>
          {/* Subtle noise/grain texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
        <div className="p-10 max-w-lg mx-auto text-center relative z-10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] border border-white/10 ring-1 ring-white/5">
          <div className="inline-flex items-center justify-center p-4 text-rose-400 bg-white/5 backdrop-blur-xl rounded-3xl mb-8 border border-white/10 shadow-2xl shadow-rose-950/20 relative group">
            <div className="absolute inset-0 bg-rose-500/10 rounded-3xl animate-pulse"></div>
            <AlertTriangle className="h-10 w-10 relative z-10 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-2xl">Access Restricted</h2>
          <div className="p-8 bg-rose-500/5 backdrop-blur-3xl border border-rose-500/20 rounded-[2rem] text-rose-300 text-center leading-relaxed shadow-inner ring-1 ring-white/5">
            <p className="font-bold text-lg mb-2">No Active Booking Found</p>
            <p className="text-sm">You must have a confirmed, active booking to report a safety issue. If you believe this is an error, please contact management.</p>
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
      <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center py-12 px-4 font-sans selection:bg-indigo-500 selection:text-white">
        {/* Animated Dark Gradient Background */}
        <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-8000"></div>
          {/* Subtle noise/grain texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
        <div className="p-10 max-w-xl mx-auto text-center relative z-10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] border border-white/10 ring-1 ring-white/5 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-5 text-emerald-400 bg-white/5 backdrop-blur-xl rounded-[2rem] mb-8 border border-white/10 shadow-2xl shadow-emerald-950/20 relative group">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-[2rem] animate-pulse"></div>
            <CheckCircle className="h-14 w-14 relative z-10 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-2xl">Transmission Successful</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed font-medium">
            Your report has been encrypted and secured. Our safety team will investigate this matter with the highest priority.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center mt-2">
            <button 
              onClick={() => nav('/student/incidents')} 
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.6)] hover:bg-indigo-500 transition-all duration-300"
            >
              Monitor Progress
            </button>
            <button 
              onClick={() => { setSubmitted(false); clearForm(); }} 
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-white/10 transition-all duration-300 ring-1 ring-white/5 shadow-2xl"
            >
              New Submission
            </button>
          </div>
        </div>
      </div>
    );
  }

  const propertyName = selectedBooking?.property?.title || 'Your Booked Property';
  const bookingRef = selectedBooking?._id ? selectedBooking._id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <div className="min-h-[calc(100vh-4rem)] relative py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Animated Dark Gradient Background */}
      <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#080d1a] to-[#030712] opacity-100"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-7000"></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse duration-8000"></div>
        {/* Subtle noise/grain texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10 mb-20">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 text-rose-400 bg-white/5 backdrop-blur-xl rounded-2xl mb-5 border border-white/10 shadow-2xl shadow-rose-950/20 relative group">
            <div className="absolute inset-0 bg-rose-500/10 rounded-2xl animate-pulse"></div>
            <AlertTriangle className="w-8 h-8 relative z-10 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-2xl">
            Report Safety Issue
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">
            Report any safety concern related to your stay. All reports are handled with priority.
          </p>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl inline-flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center min-w-[280px] shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col items-center text-sm">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5"><Building size={16}/> Property</span>
              <span className="text-white font-semibold mt-1 truncate max-w-[200px]">{propertyName}</span>
            </div>
            <div className="hidden sm:block w-px bg-white/10"></div>
            <div className="flex flex-col items-center text-sm">
              <span className="text-indigo-400 font-bold flex items-center gap-1.5"><Hash size={16}/> Booking Ref</span>
              <span className="text-slate-300 font-medium mt-1 uppercase tracking-wider">{bookingRef}</span>
            </div>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] border border-white/10 p-6 sm:p-10 transition-all text-slate-200 relative overflow-hidden ring-1 ring-white/5">
          {/* Top reflective edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <form onSubmit={submit} className="relative z-10 space-y-10">
            
            {/* Section 1: Basic Information */}
            <div className="pb-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">1</span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Incident Title <span className="text-rose-500 ml-1">*</span></label>
                  <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Theft of personal item"
                    maxLength={60}
                    className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 text-white font-medium transition-all duration-300 outline-none backdrop-blur-md ${errors.title ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white/[0.05]'}`}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  {errors.title ? <p className="text-rose-400 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12}/> {errors.title}</p> : <div></div>}
                  <p className="text-slate-500 text-xs font-bold tracking-tighter">{formData.title.length}/60</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Category <span className="text-rose-500 ml-1">*</span></label>
                  <div className="relative group">
                    <select 
                      name="category"
                      value={formData.category} 
                      onChange={handleInputChange} 
                      className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 appearance-none text-white font-medium transition-all duration-300 outline-none backdrop-blur-md ${errors.category ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white/[0.05]'}`}
                    >
                      <option value="" disabled className="bg-[#080d1a] text-slate-500">Select category...</option>
                      <option value="Theft" className="bg-[#080d1a]">Theft</option>
                      <option value="Harassment" className="bg-[#080d1a]">Harassment</option>
                      <option value="Infrastructure" className="bg-[#080d1a]">Infrastructure</option>
                      <option value="Other" className="bg-[#080d1a]">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  {errors.category && (
                    <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Severity <span className="text-rose-500 ml-1">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Low', 'Medium', 'High'].map((sev) => {
                      const isSelected = formData.severity === sev;
                      const colors = {
                        Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
                        Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10',
                        High: 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                      };
                      const activeColors = {
                        Low: 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
                        Medium: 'bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
                        High: 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      };
                      return (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'severity', value: sev }})}
                          className={`relative overflow-hidden px-4 py-3.5 rounded-2xl border-2 font-bold text-xs transition-all duration-300 flex items-center justify-center tracking-widest uppercase ${
                            isSelected 
                              ? activeColors[sev]
                              : `border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:bg-white/[0.05] hover:text-slate-300`
                          }`}
                        >
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                  {errors.severity && (
                    <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.severity}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Details */}
            <div className="pb-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">2</span>
                Incident Details
              </h3>

              <div className="space-y-8">
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Description <span className="text-rose-500 ml-1">*</span></label>
                  <textarea
                    name="description"
                    className={`w-full px-6 py-4 rounded-3xl bg-white/[0.03] border-2 text-white font-medium transition-all duration-300 outline-none backdrop-blur-md min-h-[160px] resize-y ${errors.description ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white/[0.05]'}`}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of what happened..."
                  />
                  <div className="flex justify-between items-start mt-2 px-1">
                    {errors.description ? (
                      <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 animate-in">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.description}
                      </p>
                    ) : <div></div>}
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-tighter uppercase ${formData.description.length < 20 && formData.description.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : formData.description.length >= 20 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500'}`}>
                        {formData.description.length} / 200+
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Incident Location <span className="text-rose-500 ml-1">*</span></label>
                    <div className="relative group">
                      <select 
                        name="location"
                        value={formData.location} 
                        onChange={handleInputChange} 
                        className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 appearance-none text-white font-medium transition-all duration-300 outline-none backdrop-blur-md ${errors.location ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white/[0.05]'}`}
                      >
                        <option value="" disabled className="bg-[#080d1a] text-slate-500">Select location...</option>
                        <option value="Room" className="bg-[#080d1a]">Room</option>
                        <option value="Bathroom" className="bg-[#080d1a]">Bathroom</option>
                        <option value="Kitchen" className="bg-[#080d1a]">Kitchen</option>
                        <option value="Outside Property" className="bg-[#080d1a]">Outside Property</option>
                        <option value="Other" className="bg-[#080d1a]">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    {errors.location && (
                      <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Incident Date <span className="text-rose-500 ml-1">*</span></label>
                    <div className="relative">
                      <input 
                        type="date"
                        name="incidentDate"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.incidentDate}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 text-white font-medium transition-all duration-300 outline-none backdrop-blur-md color-scheme-dark ${errors.incidentDate ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white/[0.05]'}`}
                      />
                    </div>
                    {errors.incidentDate && (
                      <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.incidentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Additional Information */}
            <div className="pb-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">3</span>
                Additional Information
              </h3>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-400 ml-1 uppercase tracking-widest">Was Anyone Involved? <span className="text-rose-500 ml-1">*</span></label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'anyoneInvolved', value: 'Yes' }})}
                      className={`flex-1 py-4 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 ${formData.anyoneInvolved === 'Yes' ? 'border-indigo-500 bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:bg-white/[0.05]'}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'anyoneInvolved', value: 'No' }})}
                      className={`flex-1 py-4 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 ${formData.anyoneInvolved === 'No' ? 'border-indigo-500 bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:bg-white/[0.05]'}`}
                    >
                      No
                    </button>
                  </div>
                  {errors.anyoneInvolved && <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1"><AlertTriangle className="w-3.5 h-3.5" /> {errors.anyoneInvolved}</p>}
                </div>

                {formData.anyoneInvolved === 'Yes' && (
                  <div className="bg-indigo-500/5 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-2 ring-1 ring-white/5">
                    <label className="block text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Who was involved? <span className="text-rose-500 ml-1">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {['Tenant', 'Owner', 'Unknown', 'Other'].map(opt => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleInputChange({ target: { name: 'whoInvolved', value: opt }})}
                          className={`py-3.5 px-2 rounded-xl border-2 font-bold text-xs transition-all duration-300 tracking-widest uppercase ${formData.whoInvolved === opt ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg' : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.whoInvolved && <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mb-4 animate-in"><AlertTriangle className="w-3.5 h-3.5" /> {errors.whoInvolved}</p>}
                    
                    {formData.whoInvolved === 'Other' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <input 
                          type="text" 
                          name="whoInvolvedOther"
                          value={formData.whoInvolvedOther}
                          onChange={handleInputChange}
                          placeholder="Please specify..."
                          className={`w-full px-6 py-4 rounded-2xl bg-white/[0.03] border-2 text-white font-medium transition-all duration-300 outline-none backdrop-blur-md ${errors.whoInvolvedOther ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5' : 'border-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-white/10'}`}
                        />
                        {errors.whoInvolvedOther && <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-2 px-1"><AlertTriangle className="w-3.5 h-3.5" /> {errors.whoInvolvedOther}</p>}
                      </div>
                    )}
                  </div>
                )}

              <div className="pt-4">
                <label className="flex items-start gap-4 cursor-pointer p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl hover:bg-rose-500/10 transition-all duration-300 shadow-2xl relative overflow-hidden group ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-rose-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="pt-0.5 relative z-10">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleInputChange} className="peer appearance-none w-6 h-6 border-2 border-rose-500/30 rounded-lg checked:bg-rose-500 checked:border-rose-400 focus:ring-4 focus:ring-rose-500/20 transition-all cursor-pointer bg-white/5 backdrop-blur-md" />
                      <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <span className="block text-sm font-black text-rose-400 tracking-widest uppercase">Emergency Response Required</span>
                    <span className="block text-xs text-rose-300/60 mt-2 font-medium leading-relaxed">Check this only for immediate safety threats. This will escalate the report to emergency responders and property management instantly.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Evidence Upload */}
          <div className="pb-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">4</span>
              Evidence Upload <span className="text-slate-500 text-[10px] font-black ml-2 bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter shadow-inner">Optional</span>
            </h3>

            <div className={`relative overflow-hidden border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all duration-500 group ${photoPreview ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-indigo-500/50 bg-white/[0.01] hover:bg-indigo-500/[0.03]'}`}>
              <input 
                type="file" 
                accept="image/jpeg, image/png" 
                onChange={handleFileChange} 
                className="hidden" 
                id="evidence-upload"
                ref={fileInputRef}
              />
              
              {!photoPreview ? (
                <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center justify-center h-full group relative z-10 py-4">
                  <div className="bg-white/5 p-6 rounded-3xl shadow-2xl mb-6 border border-white/10 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-500 group-hover:shadow-indigo-500/20">
                    <UploadCloud className="h-10 w-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  </div>
                  <span className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight">Select Evidence Media</span>
                  <span className="text-xs text-slate-500 mt-3 font-black tracking-widest uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">JPG, PNG • MAX 5MB</span>
                </label>
              ) : (
                <div className="relative inline-block mt-2 z-10 transition-all duration-500 scale-in-center">
                  <div className="relative group">
                    <img src={photoPreview} alt="Evidence preview" className="max-h-72 object-contain rounded-[2rem] shadow-2xl border-2 border-white/10 ring-8 ring-white/[0.02]" />
                    <div className="absolute inset-0 rounded-[2rem] bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <button 
                    type="button" 
                    onClick={clearPhoto}
                    className="absolute -top-4 -right-4 bg-rose-500 text-white rounded-2xl p-3 shadow-2xl shadow-rose-900/40 hover:bg-rose-400 hover:scale-110 hover:rotate-90 transition-all duration-500 border border-rose-400/50 ring-4 ring-[#030712]"
                    title="Remove image"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                  <div className="mt-6 flex justify-center">
                    <p className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-inner border border-emerald-500/30 uppercase tracking-widest">
                      <CheckCircle size={14} className="text-emerald-400" />
                      {photo.name}
                    </p>
                  </div>
                </div>
              )}
              {errors.photo && <p className="text-rose-400 text-xs mt-6 font-bold animate-pulse bg-rose-500/10 inline-block px-5 py-2 rounded-full border border-rose-500/20 shadow-xl">
                <AlertTriangle className="w-4 h-4 inline mr-2" /> {errors.photo}
              </p>}
              
              {/* Animated decorative backgrounds */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all duration-700"></div>
            </div>
          </div>

          {apiError && (
            <div className="mb-10 p-6 bg-rose-500/10 backdrop-blur-3xl text-rose-200 rounded-3xl border border-rose-500/30 flex items-start gap-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 ring-1 ring-white/10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent"></div>
              <AlertTriangle className="h-7 w-7 flex-shrink-0 mt-0.5 text-rose-500 relative z-10" />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-1 text-rose-400">System Error</p>
                <span className="font-bold text-sm leading-relaxed">{apiError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-white/5 mt-10">
            <button 
              type="submit" 
              disabled={submitting} 
              className="group relative w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black tracking-widest uppercase text-sm shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.6)] hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/20"></div>
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Transmit Report <Check size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
              <button 
                type="button" 
                onClick={clearForm} 
                className="w-full sm:w-auto px-8 py-4 border-2 border-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 text-xs tracking-widest uppercase tracking-widest"
              >
                Reset
              </button>
              <button 
                type="button" 
                onClick={fillDummyData} 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 text-xs tracking-widest uppercase tracking-widest border border-white/5"
              >
                Draft Data
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
    </div>
  );
}