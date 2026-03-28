import React, { useState, useEffect, useRef } from 'react';
import incidentService from '../../services/incidentService';
import { getStudentBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { CheckCircle, UploadCloud, X, AlertTriangle, Calendar, MapPin, Building, Hash, ChevronDown, Plus, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen relative flex items-center justify-center font-sans bg-slate-50 selection:bg-primary-500 selection:text-white">
      <div className="flex flex-col items-center justify-center p-10 text-center max-w-sm mx-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-xl font-bold text-slate-800">Checking Records...</p>
        <p className="text-slate-500 text-sm mt-2 font-medium">Synchronizing your active bookings...</p>
      </div>
    </div>
  );

  if (!allowed) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12 px-4 font-sans bg-slate-50">    
        <div className="p-10 max-w-lg mx-auto text-center relative z-10 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="inline-flex items-center justify-center p-4 text-rose-500 bg-rose-50 rounded-2xl mb-6 border border-rose-100">
            <AlertTriangle className="h-10 w-10 relative z-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Access Restricted</h2>
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-center leading-relaxed">
            <p className="font-bold text-lg mb-2 text-slate-700">No Active Booking Found</p>   
            <p className="text-sm">You must have a confirmed, active booking to report a safety issue. If you believe this is an error, please contact management.</p>
          </div>
          <button
            onClick={() => nav('/student/dashboard')}
            className="mt-8 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-sm w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12 px-4 font-sans bg-slate-50">    
        <div className="p-10 max-w-xl mx-auto text-center relative z-10 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">     
          <div className="inline-flex items-center justify-center p-5 text-emerald-500 bg-emerald-50 rounded-[2rem] mb-6 border border-emerald-100">
            <CheckCircle className="h-14 w-14 relative z-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Report Submitted</h2>
          <p className="text-lg text-slate-500 mb-8 max-w-md leading-relaxed font-medium">
            Your report has been successfully submitted. Our safety team will review the information shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => nav('/student/incidents')}
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-sm"
            >
              Monitor Progress
            </button>
            <button
              onClick={() => { setSubmitted(false); clearForm(); }}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all"
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto mb-20">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 text-rose-500 bg-rose-50 rounded-2xl mb-4 border border-rose-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 mt-2">
            Report a <span className="text-rose-600">Safety Issue</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-8">
            Report any safety concern related to your stay. All reports are handled with priority.
          </p>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl inline-flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center min-w-[280px] shadow-sm">
            <div className="flex flex-col items-center justify-center text-sm">
              <span className="text-primary-600 font-bold flex items-center gap-1.5"><Building size={16}/> Property</span>
              <span className="text-slate-800 font-semibold mt-1 truncate max-w-[200px]">{propertyName}</span>
            </div>
            <div className="hidden sm:block w-px bg-slate-200"></div>
            <div className="flex flex-col items-center justify-center text-sm">
              <span className="text-primary-600 font-bold flex items-center gap-1.5"><Hash size={16}/> Booking Ref</span>
              <span className="text-slate-600 font-medium mt-1 uppercase tracking-wider">{bookingRef}</span>
            </div>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-10 shadow-sm relative"
        >
          <button 
            type="button" 
            onClick={fillDummyData} 
            className="absolute top-6 right-6 text-xs font-bold text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-wider"
          >
            Auto-fill
          </button>

          <form onSubmit={submit} className="relative z-10 space-y-10">

            {/* Section 1: Basic Information */}
            <div className="pb-10 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-primary-50 text-primary-600 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-primary-100">1</span>
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Incident Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Theft of personal item"
                    maxLength={60}
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 font-medium transition-all outline-none ${errors.title ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                  />
                  <div className="flex justify-between items-center mt-1 px-1">   
                    {errors.title ? <p className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12}/> {errors.title}</p> : <div></div>}
                    <p className="text-slate-400 text-xs font-semibold">{formData.title.length}/60</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Category <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50 appearance-none text-slate-900 font-medium transition-all outline-none ${errors.category ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                    >
                      <option value="" disabled className="text-slate-500">Select category...</option>
                      <option value="Theft">Theft</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5 group-hover:text-primary-500 transition-colors" />
                  </div>
                  {errors.category && (
                    <p className="text-rose-500 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Severity <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map((sev) => {
                      const isSelected = formData.severity === sev;
                      let colorClass = 'border-slate-200 text-slate-600 hover:bg-slate-50';
                      if (isSelected) {
                        if (sev === 'Low') colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-500/20';
                        else if (sev === 'Medium') colorClass = 'bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-500/20';
                        else colorClass = 'bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-500/20';
                      }
                      return (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, severity: sev }));
                            setErrors(prev => ({ ...prev, severity: '' }));
                          }}
                          className={`px-3 py-3 rounded-xl border text-sm font-bold transition-all ${colorClass}`}
                        >
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                  {errors.severity && (
                    <p className="text-rose-500 text-xs font-semibold flex items-center gap-1.5 mt-1 px-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.severity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Details */}
            <div className="pb-10 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-primary-50 text-primary-600 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-primary-100">2</span>
                Incident Details
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Location <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pl-11 rounded-xl border bg-slate-50 appearance-none text-slate-900 font-medium transition-all outline-none ${errors.location ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                      >
                        <option value="" disabled className="text-slate-500">Select location...</option>
                        <option value="My Room">My Room</option>
                        <option value="Common Area">Common Area</option>
                        <option value="Bathroom">Bathroom</option>
                        <option value="Outside/Premises">Outside / Property Grounds</option>
                        <option value="Other">Other</option>
                      </select>
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5 group-hover:text-primary-500 transition-colors" />
                    </div>
                    {errors.location && <p className="text-rose-500 text-xs font-semibold px-1 mt-1">{errors.location}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Date of Incident <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        max={new Date().toISOString().split('T')[0]} // Max date is today
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pl-11 rounded-xl border bg-slate-50 appearance-none text-slate-900 font-medium transition-all outline-none ${errors.incidentDate ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    </div>
                    {errors.incidentDate && <p className="text-rose-500 text-xs font-semibold px-1 mt-1">{errors.incidentDate}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1 flex justify-between">
                    <span>Description <span className="text-rose-500">*</span></span>
                    <span className="text-xs text-slate-400 font-normal">Min 20 characters</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide as many details as possible about what happened, when, and who was involved..."
                    rows="5"
                    className={`w-full px-4 py-4 rounded-xl border bg-slate-50 text-slate-900 font-medium transition-all outline-none resize-none ${errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                  ></textarea>
                  {errors.description && <p className="text-rose-500 text-xs font-semibold px-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Additional People */}
            <div className="pb-10 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-primary-50 text-primary-600 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold border border-primary-100">3</span>
                Involvement
              </h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Was anyone else involved? <span className="text-rose-500">*</span></label>
                  <div className="flex gap-4">
                    <label className={`flex-1 relative border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 ${formData.anyoneInvolved === 'Yes' ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100' : 'border-slate-200'}`}>
                      <input type="radio" name="anyoneInvolved" value="Yes" checked={formData.anyoneInvolved === 'Yes'} onChange={handleInputChange} className="sr-only" />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${formData.anyoneInvolved === 'Yes' ? 'text-primary-700' : 'text-slate-600'}`}>Yes, someone else</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.anyoneInvolved === 'Yes' ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                           {formData.anyoneInvolved === 'Yes' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    </label>
                    <label className={`flex-1 relative border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 ${formData.anyoneInvolved === 'No' ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100' : 'border-slate-200'}`}>
                      <input type="radio" name="anyoneInvolved" value="No" checked={formData.anyoneInvolved === 'No'} onChange={handleInputChange} className="sr-only" />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${formData.anyoneInvolved === 'No' ? 'text-primary-700' : 'text-slate-600'}`}>No, just me</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.anyoneInvolved === 'No' ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                           {formData.anyoneInvolved === 'No' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    </label>
                  </div>
                  {errors.anyoneInvolved && <p className="text-rose-500 text-xs font-semibold px-1 mt-1">{errors.anyoneInvolved}</p>}
                </div>

                {formData.anyoneInvolved === 'Yes' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 ml-1">Who was involved? <span className="text-rose-500">*</span></label>
                      <div className="relative group">
                        <select
                          name="whoInvolved"
                          value={formData.whoInvolved}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border bg-slate-50 appearance-none text-slate-900 font-medium transition-all outline-none ${errors.whoInvolved ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                        >
                          <option value="" disabled className="text-slate-500">Select involvement...</option>
                          <option value="Roommate">My Roommate</option>
                          <option value="Other Boarder">Another Boarder in Property</option>
                          <option value="Property Owner">Property Owner/Staff</option>
                          <option value="Outsider">Outsider / Non-Resident</option>
                          <option value="Unknown">Unknown Person(s)</option>
                          <option value="Other">Other (Specify below)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5 group-hover:text-primary-500 transition-colors" />
                      </div>
                      {errors.whoInvolved && <p className="text-rose-500 text-xs font-semibold px-1">{errors.whoInvolved}</p>}
                    </div>

                    {formData.whoInvolved === 'Other' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Please specify <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          name="whoInvolvedOther"
                          value={formData.whoInvolvedOther}
                          onChange={handleInputChange}
                          placeholder="Please provide details..."
                          className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 font-medium transition-all outline-none ${errors.whoInvolvedOther ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
                        />
                        {errors.whoInvolvedOther && <p className="text-rose-500 text-xs font-semibold px-1">{errors.whoInvolvedOther}</p>}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Section 4: Evidence & Urgent */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 ml-1 mb-2">Photo Evidence (Optional)</label>
                
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden group border border-slate-200 bg-white max-w-sm inline-block shadow-sm">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button type="button" onClick={clearPhoto} className="p-3 bg-rose-500/90 text-white rounded-full hover:bg-rose-500 hover:scale-110 transition-all shadow-xl">
                        <X size={20} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-50 group ${errors.photo ? 'border-rose-300 bg-rose-50' : 'border-slate-300 hover:border-primary-400'}`}
                  >
                    <div className="w-14 h-14 bg-slate-100 group-hover:bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm mb-1 group-hover:text-primary-600 transition-colors">Click to upload photo evidence</p>
                    <p className="text-xs font-medium text-slate-500">JPG or PNG. Max size 5MB.</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                {errors.photo && <p className="text-rose-500 text-xs font-semibold px-1">{errors.photo}</p>}
              </div>

              {/* Urgent Toggle */}
              <div className="p-5 md:p-6 rounded-2xl border border-rose-100 bg-rose-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all hover:bg-rose-50">
                <div className="flex gap-4 items-start max-w-lg">
                  <div className="mt-1 p-2 bg-rose-100 rounded-lg text-rose-500 shrink-0">
                     <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm mb-1">Mark as Urgent Priority</h4>
                    <p className="text-xs font-medium text-rose-700 leading-relaxed">Check this box ONLY if this incident requires immediate attention, poses an ongoing physical threat, or leaves you vulnerable right now.</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer pb-2 sm:pb-0 shrink-0 ml-12 sm:ml-0">
                  <input 
                    type="checkbox" 
                    name="urgent" 
                    checked={formData.urgent} 
                    onChange={handleInputChange} 
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
            </div>

            {apiError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{apiError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => nav('/student/dashboard')}
                className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors w-full sm:w-auto"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-primary-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
