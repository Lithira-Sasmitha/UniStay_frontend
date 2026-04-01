import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';
import incidentService from '../../services/incidentService';
import Toast from '../../components/common/Toast';

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modal state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getIncidents();
      setIncidents(res.data || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
      showToast('Failed to load incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResponseSubmit = async () => {
    if (!responseText.trim()) {
      showToast('Please enter a response', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await incidentService.addOwnerResponse(selectedIncident._id, responseText);
      showToast('Response submitted successfully');
      setIncidents(prev => prev.map(inc => inc._id === selectedIncident._id ? updated.data : inc));
      setSelectedIncident(updated.data);
      setResponseText('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit response', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatId = (id) => `INC-${id?.substring(0, 5).toUpperCase()}`;

  const severityBadge = (severity) => {
    const s = severity?.toLowerCase() || '';
    if (s === 'low') return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">Low</span>;
    if (s === 'medium') return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-semibold">Medium</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-semibold">High</span>;
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'open') return <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold">Open</span>;
    if (s === 'investigating') return <span className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-semibold">Under Investigation</span>;
    if (s === 'resolved') return <span className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold">Resolved</span>;
    if (s === 'rejected') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-semibold">Rejected</span>;
    return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Property Safety Incidents</h1>
          <p className="text-slate-500 mt-1">View and respond to safety reports related to your property</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* SYSTEM NOTICE BANNER */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800 shadow-sm items-start">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-blue-900">System Notice</h4>
            <p className="text-sm mt-0.5">
              Owners can respond to incidents, but only Admin can update status to ensure fairness.
            </p>
          </div>
        </div>

        {/* INCIDENT LIST */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-slate-600 font-medium">Loading incidents...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No incidents reported for your property</h3>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {incidents.map((incident) => {
              const isHigh = incident.severity?.toLowerCase() === 'high';
              return (
                <div 
                  key={incident._id} 
                  className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between transition-all hover:shadow-md ${isHigh ? 'border-red-300 ring-1 ring-red-50' : 'border-slate-200'}`}
                >
                  <div>
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ID: {formatId(incident._id)}</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{incident.category} Issue</h3>
                      </div>
                      <div className="text-right">
                         <span className="text-xs text-slate-500 font-medium block mb-2">{new Date(incident.createdAt).toLocaleDateString()}</span>
                         {statusBadge(incident.status)}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 mb-3">
                      {severityBadge(incident.severity)}
                      <span className="text-xs text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded">
                         <Shield className="w-3 h-3 text-emerald-500 mr-1" /> Reported by: Verified Student
                      </span>
                    </div>

                    {/* Desc preview */}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {incident.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    {incident.ownerResponse ? (
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Response Submitted</span>
                    ) : (
                      <span className="text-xs font-bold text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Needs Response</span>
                    )}
                    <button 
                      onClick={() => setSelectedIncident(incident)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INCIDENT DETAILS FULL MODAL */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div>
                   <h2 className="text-xl font-bold text-slate-800">Incident Details</h2>
                   <span className="text-xs font-semibold text-slate-500">ID: {formatId(selectedIncident._id)}</span>
                </div>
                <button onClick={() => { setSelectedIncident(null); setResponseText(''); }} className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                 {/* Main Details */}
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Category</p>
                      <p className="font-semibold text-slate-700">{selectedIncident.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Severity</p>
                      <div className="mt-1">{severityBadge(selectedIncident.severity)}</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Date Reported</p>
                      <p className="font-semibold text-slate-700">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Current Status</p>
                      <div className="mt-1 flex items-center gap-2">
                        {statusBadge(selectedIncident.status)}
                      </div>
                    </div>
                 </div>

                 {/* VISUAL RESTRICTION */}
                 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 inline-flex">
                   <Shield className="w-4 h-4 text-slate-400" />
                   Status updates are controlled by Admin only
                 </div>

                 {/* Description */}
                 <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 text-sm whitespace-pre-wrap">
                      {selectedIncident.description}
                    </div>
                 </div>

                 {/* Photo Evidence */}
                 {selectedIncident.photoUrl && (
                   <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Evidence Provided</h3>
                      <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 inline-block">
                        <img 
                          src={selectedIncident.photoUrl} 
                          alt="Incident Evidence" 
                          className="max-h-48 rounded-lg object-contain"
                        />
                      </div>
                   </div>
                 )}

                 <div className="h-px bg-slate-200 my-4"></div>

                 {/* OWNER RESPONSE SECTION */}
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                     📝 Owner Response / Statement
                   </h3>
                   
                   {selectedIncident.ownerResponse ? (
                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 relative">
                        <div className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-emerald-800 font-medium mb-1">Response already submitted</p>
                        <p className="text-sm text-emerald-700 mt-2 whitespace-pre-wrap">
                          {selectedIncident.ownerResponse}
                        </p>
                        <span className="text-xs text-emerald-600/70 mt-3 block">
                          Submitted on {new Date(selectedIncident.ownerRespondedAt || selectedIncident.updatedAt).toLocaleString()}
                        </span>
                     </div>
                   ) : (
                     <div className="space-y-3">
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide your explanation or actions taken regarding this incident..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                        />
                        <button
                          onClick={handleResponseSubmit}
                          disabled={submitting}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Submit Response
                        </button>
                     </div>
                   )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}