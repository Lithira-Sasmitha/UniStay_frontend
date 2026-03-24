import React, { useState, useEffect } from 'react';
import incidentService from '../../services/incidentService';
import { getStudentBookings } from '../../services/bookingService';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';

export default function ReportIncidentPage() {
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  
  const [bookings, setBookings] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  const nav = useNavigate();

  useEffect(() => {
    getStudentBookings()
      .then(res => {
        const data = res.data?.data || res.data || [];
        const confirmedBookings = data.filter(b => b.status === 'confirmed');
        setBookings(confirmedBookings);
        setAllowed(confirmedBookings.length > 0);
        if (confirmedBookings.length > 0) {
           setSelectedPropertyId(confirmedBookings[0].property._id || confirmedBookings[0].property);
        }
      })
      .catch(err => {
        console.error('Failed to load bookings', err);
        setAllowed(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedPropertyId) return setError('Please select a property.');
    if (!category) return setError('Category is required.');
    if (!description.trim()) return setError('Description is required.');

    setSubmitting(true);
    
    const form = new FormData();
    form.append('propertyId', selectedPropertyId);
    form.append('category', category);
    form.append('severity', severity);
    form.append('description', description);
    if (photo) form.append('photo', photo);

    try {
      await incidentService.createIncident(form);
      setToast({ message: 'Incident reported successfully!', type: 'success' });
      setTimeout(() => nav('/student/incidents'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your active bookings...</div>;

  if (!allowed) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Report an Incident</h2>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-left">
          You must have a confirmed, active booking to report an incident. If you believe this is an error, please contact support.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Report a Safety Incident</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={submit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
            <select 
              value={selectedPropertyId} 
              onChange={e => setSelectedPropertyId(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {bookings.map((b, idx) => (
                <option key={idx} value={b.property._id || b.property}>
                  {b.property.title || 'Your Booked Property'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option value="Theft">Theft</option>
                <option value="Harassment">Harassment</option>
                <option value="Infrastructure">Infrastructure Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select 
                value={severity} 
                onChange={e => setSeverity(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Low">Low - Not immediate danger</option>
                <option value="Medium">Medium - Requires prompt attention</option>
                <option value="High">High - Emergency / Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500 min-h-[120px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide specific details about what happened..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setPhoto(e.target.files[0])} 
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? 'Submitting...' : 'Submit Incident Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}