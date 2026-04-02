import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Eye, Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react';
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
  const [actionItems, setActionItems] = useState({
    investigated: false,
    fixedIssue: false,
    installedSecurity: false,
    monitoring: false
  });

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
    
    // Package checkboxes into the response for record keeping.
    let finalResponse = responseText + '\n\n---\n**Safety Actions Taken:**\n';
    if(actionItems.investigated) finalResponse += '☑ Conducted Investigation\n';
    if(actionItems.fixedIssue) finalResponse += '☑ Fixed Primary Issue\n';
    if(actionItems.installedSecurity) finalResponse += '☑ Installed/Upgraded Security\n';
    if(actionItems.monitoring) finalResponse += '☑ Initiated Active Monitoring\n';

    try {
      const updated = await incidentService.addOwnerResponse(selectedIncident._id, finalResponse);
      showToast('Improvement plan submitted successfully');
      setIncidents(prev => prev.map(inc => inc._id === selectedIncident._id ? updated.data : inc));
      setSelectedIncident(updated.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    if(actionItems.investigated) score += 20;
    if(actionItems.fixedIssue) score += 35;
    if(actionItems.installedSecurity) score += 30;
    if(actionItems.monitoring) score += 15;
    return score;
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
    if (s === 'under investigation' || s === 'investigating') return <span className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-semibold">Under Investigation</span>;
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ID: {formatId(incident._id)} • {incident.property?.name || 'Unknown Property'}</span>
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
                      className="text-sm font-bold text-indigo-700 hover:text-white bg-indigo-100 hover:bg-indigo-600 px-5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm border border-indigo-200"
                    >
                      <Shield className="w-4 h-4" /> Improve Safety
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
                   <h2 className="text-xl font-bold text-slate-800">Safety Improvement Dashboard</h2>
                   <span className="text-xs font-semibold text-slate-500">Target ID: {formatId(selectedIncident._id)}</span>
                </div>
                <button onClick={() => { 
                    setSelectedIncident(null); 
                    setResponseText(''); 
                    setActionItems({investigated: false, fixedIssue: false, installedSecurity: false, monitoring: false});
                  }} 
                  className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                 {/* Main Details */}
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Property</p>
                      <p className="font-semibold text-slate-700">{selectedIncident.property?.name || 'Unknown Property'}</p>
                    </div>
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
                 {selectedIncident.photos && selectedIncident.photos.length > 0 && (
                   <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Evidence Provided</h3>
                      <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 inline-block">
                        <img
                          src={selectedIncident.photos[0]}
                          alt="Incident Evidence" 
                          className="max-h-48 rounded-lg object-contain"
                        />
                      </div>
                   </div>
                 )}

                 <div className="h-px bg-slate-200 my-4"></div>

                 {/* OWNER SAFETY IMPROVEMENT PANEL (INNOVATION) */}
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                           <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Property Improvement Plan</h3>
                    </div>

                   {selectedIncident.ownerResponse ? (
                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 relative">
                        <div className="absolute top-6 right-6 text-emerald-600 bg-white p-2 rounded-full shadow-sm">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-emerald-900 mb-2 text-lg">Safety Plan Deployed</h4>
                        <p className="text-sm text-emerald-800/80 mb-4 font-medium">Your response and action plan have been securely logged.</p>
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 text-sm font-semibold text-emerald-900 whitespace-pre-wrap leading-relaxed">
                          {selectedIncident.ownerResponse}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-600 bg-emerald-100/50 inline-flex px-3 py-1.5 rounded-lg border border-emerald-200">
                           <Calendar className="w-4 h-4" />
                           Follow-Up Reminder: Please monitor the property over the next 7 days.
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        
                        {/* 1. Automated Suggestions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                              <h4 className="text-sm font-black text-indigo-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                                AI Suggested Improvements
                              </h4>
                              <ul className="space-y-2">
                                 {selectedIncident.category === 'Theft' || selectedIncident.category === 'Harassment' ? (
                                    <>
                                       <li className="flex gap-2 text-xs font-semibold text-indigo-800"><CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Install CCTV covering entry points</li>
                                       <li className="flex gap-2 text-xs font-semibold text-indigo-800"><CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Improve exterior perimeter lighting</li>
                                    </>
                                 ) : (
                                    <>
                                       <li className="flex gap-2 text-xs font-semibold text-indigo-800"><CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Perform structural integrity check</li>
                                       <li className="flex gap-2 text-xs font-semibold text-indigo-800"><CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Restrict access to damaged areas</li>
                                    </>
                                 )}
                                 <li className="flex gap-2 text-xs font-semibold text-indigo-800"><CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Monitor tenant behavior closely</li>
                              </ul>
                           </div>

                           {/* 2. Improvement Score Visualization */}
                           <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
                               <h4 className="text-sm font-black text-slate-700 mb-2">Safety Score Projection</h4>
                               <div className="relative w-24 h-24 mb-2">
                                  <svg className="w-24 h-24 transform -rotate-90">
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                         strokeDasharray={251.2} 
                                         strokeDashoffset={251.2 - (251.2 * calculateScore()) / 100}
                                         className={`${calculateScore() < 50 ? 'text-orange-500' : calculateScore() < 80 ? 'text-blue-500' : 'text-emerald-500'} transition-all duration-700`}
                                      />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-xl font-black text-slate-800">{calculateScore()}%</span>
                                  </div>
                               </div>
                               <p className="text-xs font-semibold text-slate-500">Committing to an action plan increases your property safety rating.</p>
                           </div>
                        </div>

                        {/* 3. Action Plan Checklist */}
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                           <h4 className="text-sm font-black text-slate-800 mb-4">Select Actions Taken</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${actionItems.investigated ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                 <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={actionItems.investigated} onChange={(e) => setActionItems(p => ({...p, investigated: e.target.checked}))} />
                                 <span className="font-bold text-sm text-slate-700">Conducted Investigation</span>
                              </label>
                              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${actionItems.fixedIssue ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                 <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={actionItems.fixedIssue} onChange={(e) => setActionItems(p => ({...p, fixedIssue: e.target.checked}))} />
                                 <span className="font-bold text-sm text-slate-700">Fixed Primary Issue</span>
                              </label>
                              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${actionItems.installedSecurity ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                 <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={actionItems.installedSecurity} onChange={(e) => setActionItems(p => ({...p, installedSecurity: e.target.checked}))} />
                                 <span className="font-bold text-sm text-slate-700">Installed Security Measure</span>
                              </label>
                              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${actionItems.monitoring ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                 <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={actionItems.monitoring} onChange={(e) => setActionItems(p => ({...p, monitoring: e.target.checked}))} />
                                 <span className="font-bold text-sm text-slate-700">Activated Active Monitoring</span>
                              </label>
                           </div>
                        </div>

                        {/* 4. Owner Statement */}
                        <div className="bg-white border text-center p-0 rounded-2xl shadow-sm overflow-hidden">
                           <textarea
                             rows={3}
                             value={responseText}
                             onChange={(e) => setResponseText(e.target.value)}
                             placeholder="Provide additional context or formal statement regarding the report..."
                             className="w-full bg-slate-50 border-0 px-5 py-4 text-sm text-slate-700 font-medium focus:ring-0 focus:outline-none placeholder:text-slate-400 resize-none"
                           />
                           <div className="bg-slate-100 px-5 py-3 flex items-center justify-between border-t border-slate-200">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                               <Shield className="w-4 h-4" /> Committing Plan
                             </div>
                             <button
                               onClick={handleResponseSubmit}
                               disabled={submitting || (!responseText.trim() && Object.values(actionItems).every(v=>!v))}
                               className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                             >
                               {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                               Deploy Action Plan
                             </button>
                           </div>
                        </div>
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