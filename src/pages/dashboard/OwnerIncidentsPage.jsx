import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Eye, Loader2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import incidentService from '../../services/incidentService';
import Toast from '../../components/common/Toast';

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filter and Search State
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    if (s === 'low') return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Low</span>;
    if (s === 'medium') return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Medium</span>;
    return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">High</span>;    
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'open') return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Open</span>;
    if (s === 'investigating') return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Under Investigation</span>;
    if (s === 'resolved') return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Resolved</span>;
    if (s === 'rejected') return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Rejected</span>;
    return <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">{status}</span>;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchStatus = filterStatus === 'All' || inc.status?.toLowerCase() === filterStatus.toLowerCase();
      const matchSeverity = filterSeverity === 'All' || inc.severity?.toLowerCase() === filterSeverity.toLowerCase();
      const matchSearch = inc.category?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          formatId(inc._id).toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchStatus && matchSeverity && matchSearch;
    });
  }, [incidents, filterStatus, filterSeverity, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER SECTION */}
      <div className="pt-12 pb-10 px-4 sm:px-8 border-b border-slate-200 relative bg-white shadow-sm">
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
             <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100">
               <Shield className="w-8 h-8 text-primary-600" />
             </div>
             Property Safety Incidents
          </h1>
          <p className="text-slate-500 mt-3 text-base font-medium">
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 space-y-6 relative z-10">
        {/* SYSTEM NOTICE BANNER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 text-slate-800 shadow-sm items-start">
          <div className="p-2.5 bg-primary-50 rounded-xl border border-primary-100">
             <Shield className="w-5 h-5 text-primary-600 flex-shrink-0" />       
          </div>
          <div className="pt-0.5">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Governance & Compliance Notice</h4>
            <p className="text-sm mt-1.5 text-slate-500 leading-relaxed max-w-3xl">
            </p>
          </div>
        </div>

        {/* CONTROLS (Search & Filters) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
               <Filter className="w-4 h-4 text-primary-500" />
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status:</span>
               <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="bg-transparent text-slate-800 text-sm font-medium focus:outline-none cursor-pointer"
               >
                 <option value="All">All Status</option>
                 <option value="Open">Open</option>
                 <option value="Investigating">Investigating</option>
                 <option value="Resolved">Resolved</option>
                 <option value="Rejected">Rejected</option>
               </select>
             </div>

             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Severity:</span>
               <select
                 value={filterSeverity}
                 onChange={(e) => setFilterSeverity(e.target.value)}
                 className="bg-transparent text-slate-800 text-sm font-medium focus:outline-none cursor-pointer"
               >
                 <option value="All">All Severity</option>
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
               </select>
             </div>
          </div>
        </div>

        {/* INCIDENT LIST */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-slate-500 font-medium">Loading incidents...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-5 opacity-80" />
            <h3 className="text-xl font-bold text-slate-800">No incidents found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredIncidents.map((incident) => {
              const isHigh = incident.severity?.toLowerCase() === 'high';
              return (
                <div 
                  key={incident._id} 
                  className={`relative bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md group overflow-hidden ${isHigh ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-primary-200'}`}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">ID: {formatId(incident._id)}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-4 tracking-wide">{incident.category} Issue</h3>
                      </div>
                      <div className="text-right">
                         <span className="text-xs text-slate-500 font-semibold block mb-2">{new Date(incident.createdAt).toLocaleDateString()}</span>
                         {statusBadge(incident.status)}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mb-5">
                      {severityBadge(incident.severity)}
                      <span className="text-xs text-slate-600 flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                         <Shield className="w-3.5 h-3.5 text-primary-500 mr-2" /> Verified Student
                      </span>
                    </div>

                    {/* Desc preview */}
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-6 font-normal">
                      {incident.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 border-t border-slate-100 flex justify-between items-center relative z-10 mt-auto">
                    {incident.ownerResponse ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> Response Submitted</span>
                    ) : (
                      <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Action Required</span>
                    )}
                    <button 
                      onClick={() => setSelectedIncident(incident)}
                      className="text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-5 py-2 rounded-xl transition-all flex items-center gap-2"
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
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"       
            >
              {/* Modal Blur background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50 relative z-10">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-wide">Incident Governance Details</h2>
                   <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1 block">Case ID: {formatId(selectedIncident._id)}</span>
                </div>
<button onClick={() => { setSelectedIncident(null); setResponseText(''); }} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm hover:bg-slate-50 transition-all">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-7 relative z-10 custom-scrollbar">
                 
                 {/* Main Details */}
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</p>
                      <p className="font-semibold text-slate-900 mt-1">{selectedIncident.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Severity</p>
                      <div className="mt-1">{severityBadge(selectedIncident.severity)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date Reported</p>
                      <p className="font-semibold text-slate-900 mt-1">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</p>
                      <div className="mt-1 flex items-center gap-2">
                        {statusBadge(selectedIncident.status)}
                      </div>
                    </div>
                 </div>

                 {/* VISUAL RESTRICTION */}
                 <div className="flex items-center gap-2 text-xs text-primary-700 font-medium bg-primary-50 px-4 py-2.5 rounded-xl border border-primary-200 inline-flex">
                   <Shield className="w-4 h-4 text-primary-500" />
                   Status updates are controlled by Admin only
                 </div>

                 {/* Description */}
                 <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-wide">Description</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed font-light">
                      {selectedIncident.description}
                    </div>
                 </div>

                 {/* Photo Evidence */}
                 {selectedIncident.photoUrl && (
                   <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-wide">Evidence Provided</h3>
                      <div className="bg-slate-100 rounded-2xl p-2 border border-slate-200 inline-block">
                        <img 
                          src={selectedIncident.photoUrl} 
                          alt="Incident Evidence" 
                          className="max-h-48 rounded-xl object-contain"
                        />
                      </div>
                   </div>
                 )}

                 <div className="h-px bg-slate-200 my-4"></div>

                 {/* OWNER RESPONSE SECTION */}
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 tracking-wide">
                     <span className="p-1.5 bg-primary-100 rounded-lg border border-primary-200 text-primary-600">📝</span> Owner Response Statement
                   </h3>
                   
                   {selectedIncident.ownerResponse ? (
                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 relative">
                        <div className="absolute top-5 right-5 text-emerald-500">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mb-2">Record Locked</p>
                        <p className="text-sm font-normal text-emerald-900 mt-2 whitespace-pre-wrap leading-relaxed">
                          {selectedIncident.ownerResponse}
                        </p>
                        <span className="text-xs font-medium text-emerald-600 mt-4 block flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Filed on: {new Date(selectedIncident.ownerRespondedAt || selectedIncident.updatedAt).toLocaleString()}
                        </span>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide a comprehensive explanation regarding this incident..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-light leading-relaxed resize-y shadow-sm"
                        />
                        <button
                          onClick={handleResponseSubmit}
                          disabled={submitting}
                          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                        >
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                          Submit Official Record
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
