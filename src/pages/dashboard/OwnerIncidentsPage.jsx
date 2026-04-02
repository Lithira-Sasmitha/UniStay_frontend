import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Eye, Loader2, CheckCircle, XCircle, Calendar, Search, Filter, BarChart3, Clock, AlertOctagon } from 'lucide-react';
import incidentService from '../../services/incidentService';
import Toast from '../../components/common/Toast';

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
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
    if (!responseText.trim() && Object.values(actionItems).every(v => !v)) {
      showToast('Please provide a formal response or select at least one safety improvement action.', 'error');
      return;
    }
    setSubmitting(true);
    
    const payload = {
      ownerResponse: responseText.trim(),
      safetyActions: actionItems,
      safetyScore: calculateScore()
    };

    try {
      const res = await incidentService.addOwnerResponse(selectedIncident._id, payload);
      const updatedData = res.data || res;
      showToast('Safety improvement plan deployed successfully!', 'success');
      
      // Update local state with the new database document
      setIncidents(prev => prev.map(inc => inc._id === selectedIncident._id ? updatedData : inc));
      setSelectedIncident(updatedData);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to sync with security governance database', 'error');
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
    return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-semibold">{status}</span>;
  };

  const filteredIncidents = incidents.filter(inc => {
    const searchLower = searchQuery.toLowerCase();
    const categoryStr = inc.category?.toLowerCase() || '';
    const propertyStr = inc.property?.name?.toLowerCase() || '';
    const idStr = inc._id?.toLowerCase() || '';

    const matchesSearch = categoryStr.includes(searchLower) || 
                          propertyStr.includes(searchLower) ||
                          idStr.includes(searchLower);
    
    // Convert status to uniform matching string
    const sStat = inc.status?.toLowerCase() || '';
    const isResolved = sStat === 'resolved';
    const isRejected = sStat === 'rejected';
    const isOpenOrInvestigating = !isResolved && !isRejected;

    const matchesStatus = statusFilter === 'all' ? true :
                          statusFilter === 'active' ? isOpenOrInvestigating :
                          statusFilter === 'resolved' ? isResolved : true;

    const matchesSeverity = severityFilter === 'all' ? true : 
                            (inc.severity?.toLowerCase() === severityFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const totalIncidents = incidents.length;
  const needsActionCount = incidents.filter(i => !i.ownerResponse && !i.ownerRespondedAt).length;
  const highRiskCount = incidents.filter(i => i.severity?.toLowerCase() === 'high').length;
  const respondedRatio = totalIncidents > 0 ? Math.round(((totalIncidents - needsActionCount) / totalIncidents) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans tracking-tight">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER SECTION */}
      <div className="bg-indigo-900 border-b border-indigo-800 pt-16 pb-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/30 p-2 rounded-xl backdrop-blur-md">
                  <Shield className="w-6 h-6 text-indigo-300" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800">Safety Command Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mt-2 mb-2">Property Safety Log</h1>
            <p className="text-indigo-200 text-sm md:text-base max-w-xl">
              Track reported incidents across your properties. Use the advanced tools below to filter, investigate, and deploy proactive safety measures.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-16 relative z-20 space-y-6">
        
        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
           {/* Card 1 */}
           <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reports</p>
              <h3 className="text-3xl font-black text-slate-800">{totalIncidents}</h3>
           </div>

           {/* Card 2 */}
           <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
                   <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-xs font-bold text-amber-600/70 uppercase tracking-wider mb-1">Needs Response</p>
              <h3 className="text-3xl font-black text-amber-600">{needsActionCount}</h3>
           </div>

           {/* Card 3 */}
           <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                   <AlertOctagon className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <p className="text-xs font-bold text-red-500/70 uppercase tracking-wider mb-1">High Risk Issues</p>
              <h3 className="text-3xl font-black text-red-600">{highRiskCount}</h3>
           </div>

           {/* Card 4 */}
           <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-indigo-200 p-5 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 bg-white/20 border border-white/20 rounded-xl flex items-center justify-center">
                   <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Avg Safety Score</p>
                <div className="flex items-end gap-1">
                   <h3 className="text-3xl font-black text-white">{respondedRatio}%</h3>
                   <span className="text-indigo-200 font-bold mb-1">Health</span>
                </div>
              </div>
           </div>
        </div>
        
        {/* FILTERS & SEARCH MODULE */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 sm:p-4 flex flex-col md:flex-row items-center gap-3 mb-8">
           <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by ID, property, or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:font-medium placeholder:text-slate-400"
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group w-full md:w-40">
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border-0 border-r border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                 >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Issues</option>
                    <option value="resolved">Resolved</option>
                 </select>
                 <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative group w-full md:w-40">
                 <select 
                   value={severityFilter}
                   onChange={(e) => setSeverityFilter(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border-0 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                 >
                    <option value="all">All Severities</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                 </select>
                 <AlertTriangle className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
           </div>
        </div>

        {/* INCIDENT LISTS (DIVIDED SAAS TABLE/LIST HYBRID) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-center items-center h-48 bg-slate-50/30 xl:col-span-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <span className="text-slate-500 font-bold text-sm">Syncing security data...</span>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-16 text-center bg-slate-50/30 xl:col-span-2">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                 <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700">No matching incidents</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              {/* SECTION: ACTION REQUIRED */}
              {(() => {
                const activeIssues = filteredIncidents.filter(inc => !inc.ownerResponse && !inc.ownerRespondedAt);
                if (activeIssues.length === 0) return null;
                
                return (
                  <div className="bg-white rounded-3xl shadow-sm border border-amber-200 overflow-hidden">
                    <div className="bg-amber-50/50 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                       <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" /> Action Required 
                          <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs">{activeIssues.length}</span>
                       </h2>
                       <span className="text-xs font-bold text-amber-600/70 bg-white border border-amber-200 px-3 py-1 rounded-lg">High Priority</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {activeIssues.map((incident) => {
                        const isHigh = incident.severity?.toLowerCase() === 'high';
                        return (
                          <div key={incident._id} className={`p-5 lg:p-6 transition-all hover:bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${isHigh ? 'bg-red-50/10' : ''}`}>
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isHigh ? 'bg-red-100 border-red-200' : 'bg-amber-100 border-amber-200'}`}>
                                   <AlertTriangle className={`w-5 h-5 ${isHigh ? 'text-red-500' : 'text-amber-600'}`} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-sm">{formatId(incident._id)}</span>
                                   <span className="font-bold text-slate-400 text-xs">• {new Date(incident.createdAt).toLocaleDateString()}</span>
                                   {severityBadge(incident.severity)}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{incident.category} <span className="text-slate-400 font-medium text-base">— {incident.property?.name || 'Property'}</span></h3>
                                <p className="text-sm font-medium text-slate-500 line-clamp-1">{incident.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                               {statusBadge(incident.status)}
                               <button 
                                 onClick={() => setSelectedIncident(incident)}
                                 className="w-full sm:w-auto text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border bg-indigo-600 text-white border-transparent hover:bg-indigo-700 hover:shadow-lg shadow-md hover:-translate-y-0.5"
                               >
                                 <Shield className="w-4 h-4 text-indigo-300" /> Improve Safety
                               </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION: RESPONDED & RESOLVED */}
              {(() => {
                const resolvedIssues = filteredIncidents.filter(inc => !!inc.ownerResponse || !!inc.ownerRespondedAt);
                if (resolvedIssues.length === 0) return null;
                
                return (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                       <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> Responded / Recorded 
                          <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs">{resolvedIssues.length}</span>
                       </h2>
                       <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg">Historical log</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {resolvedIssues.map((incident) => {
                        return (
                          <div key={incident._id} className="p-5 lg:p-6 transition-all hover:bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
                                   <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                              </div>
                              <div className="flex-1 text-slate-500">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-sm opacity-80">{formatId(incident._id)}</span>
                                   <span className="font-bold text-slate-400 text-xs opacity-80">• {new Date(incident.createdAt).toLocaleDateString()}</span>
                                   <span className="opacity-80">{severityBadge(incident.severity)}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-700 leading-tight mb-1">{incident.category} <span className="font-medium text-base">— {incident.property?.name || 'Property'}</span></h3>
                                <p className="text-sm font-medium line-clamp-1">{incident.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                               {statusBadge(incident.status)}
                               <button 
                                 onClick={() => setSelectedIncident(incident)}
                                 className="w-full sm:w-auto text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border bg-white text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm"
                               >
                                 <Eye className="w-4 h-4 text-slate-400" /> Review Plan
                               </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
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