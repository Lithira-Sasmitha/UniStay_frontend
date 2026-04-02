import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, AlertTriangle, BarChart3, ShieldCheck, Clock, X, Loader2, Eye, Shield, CheckCircle, XCircle 
} from 'lucide-react';
import incidentService from '../../services/incidentService';
import authService from '../../services/authService';
import Toast from '../../components/common/Toast';

// Utility for clicking outside
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const ActionDropdown = ({ incident, onViewDetails, onUpdateStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const status = incident.status;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
      >
        View <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
          >
            <div className="py-1">
              <button 
                onClick={() => { setIsOpen(false); onViewDetails(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-gray-400" /> View Details
              </button>
              
              {status === 'open' && (
                <>
                  <div className="h-px bg-gray-100 my-1 font-bold"></div>
                  <button 
                    onClick={() => { setIsOpen(false); onUpdateStatus('Under Investigation', true); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> Investigate
                  </button>
                  <button 
                    onClick={() => { setIsOpen(false); onUpdateStatus('Rejected', true); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}

              {status === 'Under Investigation' && (
                <>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={() => { setIsOpen(false); onUpdateStatus('Resolved', true); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve
                  </button>
                  <button 
                    onClick={() => { setIsOpen(false); onUpdateStatus('Rejected', true); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);


export default function AdminIncidentDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [viewIncident, setViewIncident] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { incident, action: 'investigate' | 'resolve' | 'reject' }
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [lastUpdated, setLastUpdated] = useState('just now');

  const role = authService.getRole();
  const isAdmin = role === 'superadmin' || role === 'super_admin';

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    setLoading(true);
    incidentService.getIncidents()
      .then(res => {
        setIncidents(res.data || []);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(err => {
        console.error('Failed to load incidents', err);
        showToast('Failed to load incidents', 'error');
      })
      .finally(() => setLoading(false));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChangeSubmit = async () => {
    if (!actionModal) return;
    const { incident, action } = actionModal;
    
    // Validation
    if ((action === 'rejected' || action === 'resolved') && !adminNotes.trim()) {
      showToast('Admin notes are required for this action.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await incidentService.updateStatus(incident._id, action, adminNotes);
      showToast('Status updated successfully!');
      
      // Update local state instantly
      setIncidents(prev => prev.map(inc => 
        inc._id === incident._id ? { ...inc, status: action, adminNotes } : inc
      ));
      
      setActionModal(null);
      setAdminNotes('');
      if (viewIncident && viewIncident._id === incident._id) {
          setViewIncident({ ...viewIncident, status: action, adminNotes });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (incident, action, requireNotes = true) => {
    setActionModal({ incident, action, requireNotes });
    setAdminNotes('');
  };

  // --------------------------------------------------------
  // Filter Logic & Stats
  // --------------------------------------------------------
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch = 
        (inc._id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (inc.property?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (inc.student?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchSeverity = severityFilter === 'All' || inc.severity === severityFilter;
      
      let matchStatus = true;
      if (statusFilter !== 'All') {
            // our DB uses mixed status mostly: 'open', 'under investigation', 'investigating', 'resolved', 'rejected'
            const filterLower = statusFilter.toLowerCase();
            const incStatusLower = inc.status ? inc.status.toLowerCase() : '';

            if (filterLower === 'under investigation' && (incStatusLower === 'investigating' || incStatusLower === 'under investigation')) {
             matchStatus = true;
          } else {
             matchStatus = false;
          }
      }

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: incidents.length,
      open: incidents.filter(i => i.status?.toLowerCase() === 'open').length,
      investigating: incidents.filter(i => i.status?.toLowerCase() === 'under investigation' || i.status?.toLowerCase() === 'investigating').length,
      highSeverity: incidents.filter(i => i.severity === 'High').length,
    };
  }, [incidents]);

  // Design helpers
  const severityBadge = (severity) => {
    const s = severity?.toLowerCase() || '';
    if (s === 'low') return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">Low</span>;
    if (s === 'medium') return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-semibold">Medium</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-semibold">High</span>;
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'open') return <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold">Open</span>;
      if (s === 'under investigation' || s === 'investigating') return <span className="bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Under Inv.</span>;
    if (s === 'resolved') return <span className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Resolved</span>;
    if (s === 'rejected') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
    return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">{status}</span>;
  };

  const formatId = (id) => `INC-${(id || '').substring(0, 5).toUpperCase()}`;

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Only Admins can view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER */}
      <div className="bg-[#F8FAFC] pt-8 pb-6 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Safety Incident Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitor and manage all reported safety incidents.</p>
          </div>
          <div className="flex items-center gap-4"><button onClick={() => navigate("/admin/analytics")} className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"><BarChart3 className="w-4 h-4" /> View Analytics</button><div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Last updated {lastUpdated}</div></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-6">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Total */}
           <div 
             onClick={() => {setStatusFilter('All'); setSeverityFilter('All');}} 
             className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
           >
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-semibold mb-1">Total Incidents</p>
                 <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
              </div>
           </div>

           {/* Open */}
           <div 
             onClick={() => {setStatusFilter('Open'); setSeverityFilter('All');}}
             className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
           >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs group-hover:scale-110 transition-transform">
                 OPN
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-semibold mb-1">Open Cases</p>
                 <h3 className="text-3xl font-black text-slate-800">{stats.open}</h3>
              </div>
           </div>

           {/* Investigating */}
           <div 
             onClick={() => {setStatusFilter('Under Investigation'); setSeverityFilter('All');}}
             className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all group"
           >
              <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-semibold mb-1">Under Investigation</p>
                 <h3 className="text-3xl font-black text-slate-800">{stats.investigating}</h3>
              </div>
           </div>

           {/* High Severity */}
           <div 
             onClick={() => {setSeverityFilter('High'); setStatusFilter('All');}}
             className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:border-red-200 hover:shadow-md transition-all group"
           >
              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                 <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-slate-500 text-sm font-semibold mb-1">High Severity</p>
                 <h3 className="text-3xl font-black text-slate-800">{stats.highSeverity}</h3>
              </div>
           </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-transparent pt-4">
           <div className="flex w-full lg:w-auto items-center gap-4">
             <div className="flex flex-col gap-1 w-full sm:w-48">
               <label className="text-xs font-bold text-slate-500">Severity</label>
               <div className="relative">
                 <select 
                   value={severityFilter} 
                   onChange={e => setSeverityFilter(e.target.value)}
                   className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                 >
                   <option>All</option>
                   <option>Low</option>
                   <option>Medium</option>
                   <option>High</option>
                 </select>
                 <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
             </div>
             
             <div className="flex flex-col gap-1 w-full sm:w-48">
               <label className="text-xs font-bold text-slate-500">Status</label>
               <div className="relative">
                 <select 
                   value={statusFilter} 
                   onChange={e => setStatusFilter(e.target.value)}
                   className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                 >
                   <option>All</option>
                   <option>Open</option>
                   <option>Under Investigation</option>
                   <option>Resolved</option>
                   <option>Rejected</option>
                 </select>
                 <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
             </div>
           </div>

           <div className="w-full lg:w-96 relative flex items-end">
              <div className="relative w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4" />
                <input 
                  type="text" 
                  placeholder="Search incidents..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 text-slate-700"
                />
                <button className="absolute right-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <Search className="w-4 h-4"/> Search
                </button>
              </div>
           </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="font-medium">Loading cases...</p>
              </div>
            ) : filteredIncidents.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                 <ShieldCheck className="w-12 h-12 text-slate-200" />
                 <p className="font-medium text-lg text-slate-500">No safety incidents found</p>
                 <p className="text-sm">Everything looks secure based on your filters.</p>
               </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">Incident ID <span className="text-[10px] text-slate-300 ml-1">?</span></th>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Reported By</th>
                    <th className="px-6 py-4">Severity <span className="text-[10px] text-slate-300 ml-1">?</span></th>
                    <th className="px-6 py-4">Status <span className="text-[10px] text-slate-300 ml-1">?</span></th>
                    <th className="px-6 py-4">Date <span className="text-[10px] text-slate-300 ml-1">?</span></th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filteredIncidents.map(inc => (
                    <tr key={inc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setViewIncident(inc)}>
                        {formatId(inc._id)}
                      </td>
                      <td className="px-6 py-4 whitespace-normal min-w-[200px] text-slate-600">
                        {inc.property?.name || 'Unknown Estate'}
                      </td>
                      <td className="px-6 py-4">
                        {inc.student?.name || 'Unknown Student'}
                      </td>
                      <td className="px-6 py-4">
                        {severityBadge(inc.severity)}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(inc.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(inc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <ActionDropdown 
                          incident={inc}
                          onViewDetails={() => setViewIncident(inc)}
                          onUpdateStatus={(action, requiresNotes) => openActionModal(inc, action, requiresNotes)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && filteredIncidents.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm font-medium text-slate-500">
              <span>Showing 1 to {filteredIncidents.length} of {incidents.length} results</span>
              <div className="flex gap-1">
                 <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-white text-slate-400 bg-slate-100 cursor-not-allowed">
                   &lt;
                 </button>
                 <button className="px-3 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white font-bold">1</button>
                 <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-white bg-white text-slate-700">Next &gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {viewIncident && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <div className="flex gap-3 items-center mb-2">
                     <span className="bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] px-2 py-1 rounded">
                       {formatId(viewIncident._id)}
                     </span>
                     {statusBadge(viewIncident.status)}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{viewIncident.title || viewIncident.category}</h2>
                </div>
                <button onClick={() => setViewIncident(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto flex-1 bg-white">
                 <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Property</p>
                        <p className="font-semibold text-slate-800">{viewIncident.property?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported On</p>
                        <p className="font-semibold text-slate-800">{new Date(viewIncident.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported By</p>
                        <p className="font-semibold text-slate-800">{viewIncident.student?.name || 'Unknown User'}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Severity</p>
                         {severityBadge(viewIncident.severity)}
                      </div>
                    </div>
                 </div>

                 <div className="mb-8">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                   <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                     {viewIncident.description}
                   </div>
                 </div>

                 {viewIncident.photos && viewIncident.photos.length > 0 && (
                   <div className="mb-8">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence Photo</p>
                     <a href={viewIncident.photos[0]} target="_blank" rel="noreferrer">
                       <img src={viewIncident.photos[0]} alt="Evidence" className="rounded-xl border border-slate-200 max-h-64 object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
                     </a>
                   </div>
                 )}

                 {viewIncident.ownerResponse && (
                   <div className="mb-8">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Response</p>
                     <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-900 leading-relaxed font-semibold italic">
                       "{viewIncident.ownerResponse}"
                       {viewIncident.ownerRespondedAt && (
                           <div className="text-xs text-amber-700 mt-2 not-italic opacity-70">
                               Responded on {new Date(viewIncident.ownerRespondedAt).toLocaleString()}
                           </div>
                       )}
                     </div>
                   </div>
                 )}

                 {viewIncident.adminNotes && (
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Remarks / Notes</p>
                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-900 leading-relaxed font-semibold italic">
                       "{viewIncident.adminNotes}"
                     </div>
                   </div>
                 )}
              </div>

              {/* View Actions (Bottom Bar) */}
              {viewIncident.status !== 'resolved' && viewIncident.status !== 'rejected' && (
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    {viewIncident.status === 'Open' || viewIncident.status === 'open' ? (
                       <button onClick={() => openActionModal(viewIncident, 'Under Investigation', false)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                         Begin Investigation
                       </button>
                    ) : null}
                    {viewIncident.status === 'Under Investigation' || viewIncident.status === 'investigating' ? (
                       <button onClick={() => openActionModal(viewIncident, 'Resolved', true)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                         Mark as Resolved
                       </button>
                    ) : null}
                  <button onClick={() => openActionModal(viewIncident, 'rejected', true)} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors">
                     Reject Report
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION CONFIRMATION MODAL WITH NOTES */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-xl font-bold text-slate-800 capitalize">
                      {actionModal.action === 'Under Investigation' ? 'Begin Investigation' : actionModal.action} Incident
                   </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-slate-600 mb-5">
                    You are about to move Incident <strong className="text-slate-800">{formatId(actionModal.incident._id)}</strong> to status: <strong className="uppercase">{actionModal.action === 'Under Investigation' ? 'UNDER INVESTIGATION' : actionModal.action}</strong>                  </p>
                {actionModal.requireNotes && (
                   <div className="mb-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                       Admin Notes / Reason <span className="text-red-500">*</span>
                     </label>
                     <textarea
                       className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[100px] text-slate-700 font-medium"
                       placeholder={actionModal.action === 'rejected' ? 'Provide a reason for rejection...' : 'Provide resolution notes...'}
                       value={adminNotes}
                       onChange={e => setAdminNotes(e.target.value)}
                     ></textarea>
                     {(actionModal.action === 'rejected' || actionModal.action === 'resolved') && !adminNotes.trim() && (
                       <p className="text-xs text-red-500 mt-1 font-medium">Notes are required to {actionModal.action} this incident.</p>
                     )}
                   </div>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                 <button onClick={() => setActionModal(null)} className="px-4 py-2 font-bold text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg">Cancel</button>
                 <button 
                   onClick={handleStatusChangeSubmit}
                   disabled={actionLoading || (actionModal.requireNotes && !adminNotes.trim())}
                   className={`px-6 py-2 font-bold text-sm text-white rounded-lg flex items-center gap-2 ${
                     actionModal.action === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                     actionModal.action === 'resolved' ? 'bg-green-600 hover:bg-green-700' :
                     'bg-blue-600 hover:bg-blue-700'
                   } disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                   {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Action'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}



