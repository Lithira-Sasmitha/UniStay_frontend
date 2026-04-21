import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  X, 
  AlertTriangle, 
  Eye, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Search, 
  Filter, 
  BarChart3, 
  Clock, 
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
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
      setIncidents(res.data?.data || res.data || []);
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
      const updatedData = res.data?.data || res.data || res;
      showToast('Safety improvement plan deployed successfully!', 'success');
      
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
    if (s === 'low') return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Low Severity</span>;
    if (s === 'medium') return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Medium Severity</span>;
    return <span className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">High Severity</span>;
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'open') return <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Open</span>;
    if (s === 'under investigation' || s === 'investigating') return <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Investigating</span>;
    if (s === 'resolved') return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Resolved</span>;
    if (s === 'rejected') return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">Rejected</span>;
    return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{status}</span>;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const searchLower = searchQuery.toLowerCase();
      const categoryStr = inc.category?.toLowerCase() || '';
      const propertyStr = inc.property?.name?.toLowerCase() || '';
      const idStr = inc._id?.toLowerCase() || '';

      const matchesSearch = categoryStr.includes(searchLower) || 
                            propertyStr.includes(searchLower) ||
                            idStr.includes(searchLower);
      
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
  }, [incidents, searchQuery, statusFilter, severityFilter]);

  const totalIncidents = incidents.length;
  const needsActionCount = incidents.filter(i => !i.ownerResponse && !i.ownerRespondedAt).length;
  const highRiskCount = incidents.filter(i => i.severity?.toLowerCase() === 'high').length;
  const healthScore = totalIncidents > 0 ? Math.round(((totalIncidents - needsActionCount) / totalIncidents) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans tracking-tight text-slate-900 pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* BACKGROUND ELEMENTS - Light Mode Dashboard */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-200/15 rounded-full blur-[150px] mix-blend-multiply" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 pt-16 pb-12 border-b border-slate-200 backdrop-blur-3xl bg-white/70">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2.5 rounded-2xl border border-indigo-200 shadow-sm">
                  <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                Governance Command
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">Property Safety Log</h1>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl font-medium leading-relaxed">
              Track reported incidents and deploy proactive safety measures across your properties.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/80 p-4 rounded-[2rem] border border-slate-200 shadow-sm backdrop-blur-xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                   <p className="text-xl font-black text-rose-600">{needsActionCount}</p>
                </div>
             </div>
             <div className="w-px h-10 bg-slate-200 mx-2" />
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{healthScore}%</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 mt-12 space-y-12">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <BarChart3 className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Reports</p>
              <h3 className="text-3xl font-black text-slate-900">{totalIncidents}</h3>
           </div>
           
           <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 group-hover:scale-110 transition-transform">
                 <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Action Required</p>
              <h3 className="text-3xl font-black text-amber-600">{needsActionCount}</h3>
           </div>

           <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 group-hover:scale-110 transition-transform">
                 <AlertOctagon className="w-6 h-6 text-rose-600" />
              </div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">High Risk Cases</p>
              <h3 className="text-3xl font-black text-rose-600">{highRiskCount}</h3>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] shadow-xl shadow-indigo-100 group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                 <Activity className="w-6 h-6 text-white" />
              </div>
              <p className="text-[10px] font-black text-indigo-50 uppercase tracking-[0.2em] mb-1">Platform Rating</p>
              <div className="flex items-end gap-2 text-white">
                 <h3 className="text-3xl font-black">{healthScore}%</h3>
                 <span className="text-indigo-100 text-sm font-bold mb-1">Excellent</span>
              </div>
           </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-3 shadow-sm flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search by ID, property, or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none placeholder:text-slate-400 shadow-inner"
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto px-2">
              <div className="relative group w-full md:w-44">
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-600 cursor-pointer focus:ring-4 focus:ring-indigo-500/10 outline-none uppercase tracking-widest shadow-inner [&>option]:bg-white"
                 >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Issues</option>
                    <option value="resolved">Resolved</option>
                 </select>
                 <Filter className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative group w-full md:w-44">
                 <select 
                   value={severityFilter}
                   onChange={(e) => setSeverityFilter(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-600 cursor-pointer focus:ring-4 focus:ring-indigo-500/10 outline-none uppercase tracking-widest shadow-inner [&>option]:bg-white"
                 >
                    <option value="all">All Severities</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                 </select>
                 <TrendingUp className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
           </div>
        </div>

        {/* INCIDENT GRID */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white/40 rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Syncing Case Records...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-32 text-center bg-white/40 rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
                <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-400">Zero matches found</h3>
            <p className="text-slate-500 font-medium mt-2">Adjust your filters to locate the desired incidents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20">
             {filteredIncidents.map((incident) => {
                const isHigh = incident.severity?.toLowerCase() === 'high';
                const needsAction = !incident.ownerResponse && !incident.ownerRespondedAt;
                
                return (
                   <motion.div 
                     layout
                     key={incident._id}
                     className={`group relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] border p-8 flex flex-col gap-6 transition-all duration-500 shadow-sm border-slate-200 overflow-hidden ${
                       needsAction 
                       ? 'ring-2 ring-amber-500/20 bg-amber-500/[0.02] border-amber-200' 
                       : 'hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5'
                     }`}
                   >
                     {/* HIGHLIGHT FOR ACTION REQUIRED */}
                     {needsAction && (
                        <div className="absolute top-0 right-0 p-1.5 bg-amber-500 rounded-bl-2xl z-20 shadow-lg">
                           <Clock className="w-4 h-4 text-white" />
                        </div>
                     )}

                     <div className="flex justify-between items-start">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm uppercase tracking-wider">
                                {formatId(incident._id)}
                              </span>
                              <span className="text-xs font-bold text-slate-400">• {new Date(incident.createdAt).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors leading-tight text-slate-800">
                             {incident.category} <span className="text-slate-500 font-bold block text-sm mt-1 uppercase tracking-widest">{incident.property?.name || 'Property'}</span>
                           </h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           {statusBadge(incident.status)}
                           {severityBadge(incident.severity)}
                        </div>
                     </div>

                     <p className="text-slate-600 font-medium leading-relaxed line-clamp-2 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        {incident.description}
                     </p>

                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                           {incident.ownerResponse ? (
                             <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <CheckCircle className="w-3.5 h-3.5" /> Plan Deployed
                             </div>
                           ) : (
                             <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-wider bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                <AlertTriangle className="w-3.5 h-3.5" /> Action Required
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => setSelectedIncident(incident)}
                          className="flex items-center gap-2 text-sm font-black text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white border border-slate-200 px-6 py-3.5 rounded-2xl transition-all shadow-sm active:scale-95 group/btn"
                        >
                          <Eye size={18} className="text-indigo-600 group-hover/btn:text-white transition-colors" />
                          View Details
                        </button>
                     </div>
                   </motion.div>
                );
             })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
            >
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-3xl">
                <div>
                   <h2 className="text-3xl font-black tracking-tight leading-none text-slate-800">Safety Governance Record</h2>
                   <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Case #{formatId(selectedIncident._id)}</span>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs font-bold text-slate-400">{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                   </div>
                </div>
                <button onClick={() => { setSelectedIncident(null); setResponseText(''); }} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-90">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-10 space-y-10 custom-scrollbar bg-white">
                 
                 {/* GRID INFO */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                            <p className="text-lg font-black text-slate-800">{selectedIncident.category}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Property</p>
                            <p className="text-lg font-black text-slate-800">{selectedIncident.property?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Severity</p>
                            <div className="mt-1">{severityBadge(selectedIncident.severity)}</div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                            <div className="mt-1">{statusBadge(selectedIncident.status)}</div>
                          </div>
                       </div>

                       <div>
                          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <AlertOctagon className="w-4 h-4 text-rose-500" /> Evidence Statement
                          </h3>
                          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-slate-600 font-medium leading-relaxed shadow-sm">
                             {selectedIncident.description}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       {selectedIncident.photos && selectedIncident.photos.length > 0 && (
                          <div className="group relative">
                             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Visual Evidence</h3>
                             <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-xl bg-slate-100 h-72">
                                <img 
                                  src={selectedIncident.photoUrl || (selectedIncident.photos && selectedIncident.photos[0])} 
                                  alt="Evidence" 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                   <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white">
                                      <Clock className="w-5 h-5 text-indigo-600" />
                                      <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Captured at Scene</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}

                       <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex gap-4 text-indigo-700">
                          <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                             <h4 className="font-black text-sm uppercase tracking-wider">Compliance Protocol</h4>
                             <p className="text-sm font-medium leading-relaxed text-indigo-600/80">
                                Your response will be appended to the official governance log. Statements are legally binding.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* RESPONSE PANEL */}
                 <div className="pt-10 border-t border-slate-100">
                    {selectedIncident.ownerResponse ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 flex flex-col md:flex-row gap-10">
                         <div className="flex flex-col items-center gap-4 bg-emerald-100 p-8 rounded-[2rem] border border-emerald-200 h-fit">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                               <CheckCircle className="w-10 h-10" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">RECORD SECURE</span>
                         </div>
                         <div className="flex-1 space-y-6">
                            <div>
                               <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Owner Response Record</h3>
                               <div className="bg-white p-8 rounded-3xl border border-emerald-100 text-lg font-bold text-slate-800 shadow-sm">
                                  {selectedIncident.ownerResponse}
                               </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 px-4">
                               <Calendar className="w-4 h-4" />
                               Filed on {new Date(selectedIncident.ownerRespondedAt || selectedIncident.updatedAt).toLocaleString()}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        {/* ACTION CHECKLIST */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {Object.keys(actionItems).map((key) => (
                              <button
                                key={key}
                                onClick={() => setActionItems(p => ({...p, [key]: !p[key]}))}
                                className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                  actionItems[key] 
                                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' 
                                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
                                   actionItems[key] ? 'bg-white border-white' : 'bg-transparent border-slate-200'
                                 }`}>
                                    {actionItems[key] && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                                 </div>
                                 <span className="font-black text-sm uppercase tracking-wider">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                 </span>
                              </button>
                           ))}
                        </div>

                        <div className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-4 flex justify-between items-center">
                              <span>Official Statement</span>
                              <span className="text-indigo-600">Score Projection: {calculateScore()}%</span>
                           </h3>
                           <textarea
                             rows={5}
                             value={responseText}
                             onChange={(e) => setResponseText(e.target.value)}
                             placeholder="Provide a comprehensive explanation and mitigation strategy..."
                             className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-8 text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-inner"
                           />
                           <div className="flex justify-end pt-4">
                              <button
                                onClick={handleResponseSubmit}
                                disabled={submitting}
                                className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 px-12 rounded-[2rem] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:scale-105 active:scale-95"
                              >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                                Deploy Safety Plan
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