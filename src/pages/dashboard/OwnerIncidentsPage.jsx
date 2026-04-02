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
    if (s === 'low') return <span className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Low</span>;
    if (s === 'medium') return <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Medium</span>;
    return <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">High</span>;
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'open') return <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Open</span>;
    if (s === 'investigating') return <span className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Under Investigation</span>;
    if (s === 'resolved') return <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Resolved</span>;
    if (s === 'rejected') return <span className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">Rejected</span>;
    return <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm inline-block">{status}</span>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 pb-12 font-sans overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER SECTION */}
      <div className="pt-12 pb-10 px-4 sm:px-8 border-b border-white/10 relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[40%] h-[150%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
               <Shield className="w-8 h-8 text-indigo-300" />
             </div>
             Property Safety Incidents
          </h1>
          <p className="text-slate-300 mt-3 text-base font-medium">
             Monitor, review, and respond to safety reports professionally
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 space-y-6 relative z-10">
        {/* SYSTEM NOTICE BANNER */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-4 text-white shadow-xl items-start">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
             <Shield className="w-5 h-5 text-indigo-300 flex-shrink-0" />
          </div>
          <div className="pt-0.5">
            <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-wider">Governance & Compliance Notice</h4>
            <p className="text-sm mt-1.5 text-slate-300 leading-relaxed max-w-3xl">
              As an owner, you have the right to respond and provide statements. Final status resolution remains with Admin governance to ensure impartial fairness.
            </p>
          </div>
        </div>

        {/* CONTROLS (Search & Filters) */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search incidents or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 text-white text-sm border border-white/10 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-all font-light placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
             <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
               <Filter className="w-4 h-4 text-indigo-400" />
               <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Status:</span>
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900"
               >
                 <option value="All">All Status</option>
                 <option value="Open">Open</option>
                 <option value="Investigating">Investigating</option>
                 <option value="Resolved">Resolved</option>
                 <option value="Rejected">Rejected</option>
               </select>
             </div>

             <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
               <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Severity:</span>
               <select 
                 value={filterSeverity}
                 onChange={(e) => setFilterSeverity(e.target.value)}
                 className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900"
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
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="ml-3 text-slate-300 font-medium">Loading incidents...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-16 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-5 opacity-80" />
            <h3 className="text-xl font-bold text-white">No incidents found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredIncidents.map((incident) => {
              const isHigh = incident.severity?.toLowerCase() === 'high';
              return (
                <div 
                  key={incident._id} 
                  className={`relative bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${isHigh ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-indigo-500/40'}`}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded border border-white/10">ID: {formatId(incident._id)}</span>
                        <h3 className="text-lg font-bold text-white mt-4 tracking-wide">{incident.category} Issue</h3>
                      </div>
                      <div className="text-right">
                         <span className="text-xs text-slate-400 font-semibold block mb-2">{new Date(incident.createdAt).toLocaleDateString()}</span>
                         {statusBadge(incident.status)}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mb-5">
                      {severityBadge(incident.severity)}
                      <span className="text-xs text-slate-300 flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                         <Shield className="w-3.5 h-3.5 text-indigo-400 mr-2" /> Verified Student
                      </span>
                    </div>

                    {/* Desc preview */}
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-6 font-normal">
                      {incident.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 border-t border-white/10 flex justify-between items-center relative z-10 mt-auto">
                    {incident.ownerResponse ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> Response Submitted</span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Action Required</span>
                    )}
                    <button 
                      onClick={() => setSelectedIncident(incident)}
                      className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2 rounded-xl transition-all flex items-center gap-2"
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
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
            >
              {/* Modal Blur background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-10">
                <div>
                   <h2 className="text-xl font-bold text-white tracking-wide">Incident Governance Details</h2>
                   <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1 block">Case ID: {formatId(selectedIncident._id)}</span>
                </div>
                <button onClick={() => { setSelectedIncident(null); setResponseText(''); }} className="p-2 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-7 relative z-10 custom-scrollbar">
                 
                 {/* Main Details */}
                 <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                      <p className="font-semibold text-white mt-1">{selectedIncident.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</p>
                      <div className="mt-1">{severityBadge(selectedIncident.severity)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Reported</p>
                      <p className="font-semibold text-white mt-1">{new Date(selectedIncident.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                      <div className="mt-1 flex items-center gap-2">
                        {statusBadge(selectedIncident.status)}
                      </div>
                    </div>
                 </div>

                 {/* VISUAL RESTRICTION */}
                 <div className="flex items-center gap-2 text-xs text-indigo-200 font-medium bg-indigo-500/10 px-4 py-2.5 rounded-xl border border-indigo-500/20 inline-flex">
                   <Shield className="w-4 h-4 text-indigo-400" />
                   Status updates are controlled by Admin only
                 </div>

                 {/* Description */}
                 <div>
                    <h3 className="text-sm font-bold text-white mb-2 tracking-wide">Description</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-light">
                      {selectedIncident.description}
                    </div>
                 </div>

                 {/* Photo Evidence */}
                 {selectedIncident.photoUrl && (
                   <div>
                      <h3 className="text-sm font-bold text-white mb-2 tracking-wide">Evidence Provided</h3>
                      <div className="bg-black/40 rounded-2xl p-2 border border-white/5 inline-block">
                        <img 
                          src={selectedIncident.photoUrl} 
                          alt="Incident Evidence" 
                          className="max-h-48 rounded-xl object-contain"
                        />
                      </div>
                   </div>
                 )}

                 <div className="h-px bg-white/10 my-4"></div>

                 {/* OWNER RESPONSE SECTION */}
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 tracking-wide">
                     <span className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-300">📝</span> Owner Response Statement
                   </h3>
                   
                   {selectedIncident.ownerResponse ? (
                     <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-5 relative">
                        <div className="absolute top-5 right-5 text-emerald-400">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-emerald-400/80 tracking-widest mb-2">Record Locked</p>
                        <p className="text-sm font-normal text-emerald-50 mt-2 whitespace-pre-wrap leading-relaxed">
                          {selectedIncident.ownerResponse}
                        </p>
                        <span className="text-xs font-medium text-emerald-400/60 mt-4 block flex items-center gap-1.5">
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
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all placeholder:text-slate-500 font-light leading-relaxed resize-y"
                        />
                        <button
                          onClick={handleResponseSubmit}
                          disabled={submitting}
                          className="w-full sm:w-auto bg-white hover:bg-slate-200 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
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