import React, { useState, useEffect, useRef } from 'react';
import incidentService from '../../services/incidentService';
import { getStudentBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { CheckCircle, UploadCloud, X, AlertTriangle, Calendar, MapPin, Building, Hash } from 'lucide-react';

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
    
    // Append additional info to description since backend likely only has description
    let fullDescription = `Title: ${formData.title}\nLocation: ${formData.location}\nDate: ${formData.incidentDate}\nAnyone Involved: ${formData.anyoneInvolved}\nUrgent: ${formData.urgent ? 'Yes' : 'No'}\n\nDetail: ${formData.description}`;
    
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your active bookings...</div>;

  if (!allowed) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Cannot Report Incident</h2>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-left">
          You must have a confirmed, active booking to report a safety issue. If you believe this is an error, please contact support.
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Report Submitted Successfully</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Your report is now under review. We take safety concerns seriously and will investigate this matter promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
            <button 
              onClick={() => nav('/student/incidents')} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              View My Reports
            </button>
            <button 
              onClick={() => { setSubmitted(false); clearForm(); }} 
              className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const propertyName = selectedBooking?.property?.title || 'Your Booked Property';
  const bookingRef = selectedBooking?._id ? selectedBooking._id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Safety Issue</h1>
          <p className="text-gray-500 mt-1">Report any safety concern related to your stay</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col gap-1 min-w-[200px]">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-700 font-medium flex items-center gap-1"><Building size={14}/> Property:</span>
            <span className="text-gray-900 font-semibold truncate max-w-[150px]">{propertyName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-700 font-medium flex items-center gap-1"><Hash size={14}/> Booking Ref:</span>
            <span className="text-gray-700">{bookingRef}</span>
          </div>
        </div>
      </div>
      
      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={submit} className="p-6 sm:p-8">
          
          {/* Section 1: Basic Information */}
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Title <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Theft of personal item"
                  maxLength={60}
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-colors ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
                <p className="text-gray-400 text-xs mt-1 text-right">{formData.title.length}/60</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select 
                    name="category"
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className={`w-full bg-white border rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-colors ${errors.category ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                  >
                    <option value="">Select category</option>
                    <option value="Theft">Theft</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Severity <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="severity" value="Low" checked={formData.severity === 'Low'} onChange={handleInputChange} className="hidden peer" />
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-gray-600 peer-checked:border-[6px] transition-all"></div>
                      <span className="text-sm text-gray-700 font-medium px-2 py-1 rounded bg-gray-50 group-hover:bg-gray-100 peer-checked:bg-gray-100 peer-checked:text-gray-900 transition-colors">Low</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="severity" value="Medium" checked={formData.severity === 'Medium'} onChange={handleInputChange} className="hidden peer" />
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-orange-500 peer-checked:border-[6px] transition-all"></div>
                      <span className="text-sm text-gray-700 font-medium px-2 py-1 rounded bg-orange-50 group-hover:bg-orange-100 peer-checked:bg-orange-100 peer-checked:text-orange-900 transition-colors">Medium</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="severity" value="High" checked={formData.severity === 'High'} onChange={handleInputChange} className="hidden peer" />
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-red-600 peer-checked:border-[6px] transition-all"></div>
                      <span className="text-sm text-gray-700 font-medium px-2 py-1 rounded bg-red-50 group-hover:bg-red-100 peer-checked:bg-red-100 peer-checked:text-red-900 transition-colors">High</span>
                    </label>
                  </div>
                  {errors.severity && <p className="text-red-500 text-xs mt-2 font-medium">{errors.severity}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Details */}
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span>
              Incident Details
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:outline-none min-h-[140px] transition-colors ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what happened clearly (include location, situation)"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</p>}
                <div className="flex justify-between mt-1.5">
                  <p className="text-gray-400 text-xs">Minimum 20 characters</p>
                  <p className={`text-xs font-medium ${formData.description.length < 20 && formData.description.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formData.description.length}/200+</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Location <span className="text-red-500">*</span></label>
                  <select 
                    name="location"
                    value={formData.location} 
                    onChange={handleInputChange} 
                    className={`w-full bg-white border rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-colors ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                  >
                    <option value="">Select location</option>
                    <option value="Room">Room</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Outside Property">Outside Property</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.location && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="date"
                      name="incidentDate"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.incidentDate}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:outline-none transition-colors ${errors.incidentDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                    />
                  </div>
                  {errors.incidentDate && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.incidentDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Information */}
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span>
              Additional Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Was Anyone Involved? <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="anyoneInvolved" value="Yes" checked={formData.anyoneInvolved === 'Yes'} onChange={handleInputChange} className="hidden peer" />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:border-[6px] transition-all"></div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="anyoneInvolved" value="No" checked={formData.anyoneInvolved === 'No'} onChange={handleInputChange} className="hidden peer" />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:border-[6px] transition-all"></div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">No</span>
                  </label>
                </div>
                {errors.anyoneInvolved && <p className="text-red-500 text-xs mt-2 font-medium">{errors.anyoneInvolved}</p>}
              </div>

              {formData.anyoneInvolved === 'Yes' && (
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-inner">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Who was involved? <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {['Tenant', 'Owner', 'Unknown', 'Other'].map(opt => (
                      <label key={opt} className={`flex justify-center items-center gap-2 cursor-pointer p-3 rounded-lg border text-sm font-medium transition-colors ${formData.whoInvolved === opt ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        <input type="radio" name="whoInvolved" value={opt} checked={formData.whoInvolved === opt} onChange={handleInputChange} className="hidden" />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.whoInvolved && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.whoInvolved}</p>}
                  
                  {formData.whoInvolved === 'Other' && (
                    <div className="mt-4">
                      <input 
                        type="text" 
                        name="whoInvolvedOther"
                        value={formData.whoInvolvedOther}
                        onChange={handleInputChange}
                        placeholder="Please specify..."
                        className={`w-full border rounded-lg p-3 text-sm focus:outline-none transition-colors ${errors.whoInvolvedOther ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 hover:border-gray-400'}`}
                      />
                      {errors.whoInvolvedOther && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.whoInvolvedOther}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded bg-white focus:ring-red-500 border-red-300 shadow-sm" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-red-800">This issue requires immediate attention</span>
                    <span className="block text-sm text-red-600 mt-1">Check this only for urgent safety matters. It will trigger high-priority alerts.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Evidence Upload */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm font-bold">4</span>
              Evidence Upload <span className="text-gray-400 text-sm font-normal ml-2">(Optional)</span>
            </h3>

            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${photoPreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
              <input 
                type="file" 
                accept="image/jpeg, image/png" 
                onChange={handleFileChange} 
                className="hidden" 
                id="evidence-upload"
                ref={fileInputRef}
              />
              
              {!photoPreview ? (
                <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                    <UploadCloud className="h-8 w-8 text-blue-500" />
                  </div>
                  <span className="text-base font-semibold text-gray-700">Click to upload or drag and drop</span>
                  <span className="text-sm text-gray-500 mt-2">JPG or PNG (max. 5MB)</span>
                </label>
              ) : (
                <div className="relative inline-block mt-4">
                  <img src={photoPreview} alt="Evidence preview" className="max-h-56 rounded-xl shadow-md border border-gray-200" />
                  <button 
                    type="button" 
                    onClick={clearPhoto}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                    title="Remove image"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                  <p className="text-sm text-green-700 mt-3 font-medium bg-white px-3 py-1 rounded-full border border-green-200 inline-block shadow-sm">
                    {photo.name}
                  </p>
                </div>
              )}
              {errors.photo && <p className="text-red-500 text-sm mt-3 font-medium">{errors.photo}</p>}
            </div>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-100 mt-8">
            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all text-sm"
            >
              {submitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
            
            <div className="flex gap-4 w-full sm:w-auto sm:ml-auto">
              <button 
                type="button" 
                onClick={clearForm} 
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                Clear Form
              </button>
              <button 
                type="button" 
                onClick={fillDummyData} 
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                Fill Dummy Data
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}