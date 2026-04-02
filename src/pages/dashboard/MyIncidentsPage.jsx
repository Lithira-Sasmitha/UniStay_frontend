import React, { useState, useEffect } from 'react';
import incidentService from '../../services/incidentService';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { AlertTriangle, Clock, Building, Eye, AlertCircle, Plus, Filter, ShieldAlert } from 'lucide-react';
import IncidentDetailModal from '../../components/modals/IncidentDetailModal';

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    incidentService.getMyIncidents()
      .then(res => setIncidents(res.data?.data || res.data || []))
      .catch(err => console.error('Failed to load incidents', err))
      .finally(() => setLoading(false));
  }, []);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/30 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';   
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
  };

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(inc => inc.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-[calc(100vh-4rem)] relative font-sans">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0 bg-slate-900 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-900 opacity-80"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-7000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 max-w-6xl mx-auto pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 mt-4">
          <div>
            <div className="inline-flex items-center justify-center p-2.5 text-indigo-400 bg-indigo-500/10 backdrop-blur-md rounded-2xl mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">My Safety Reports</h1>
            <p className="text-slate-400 mt-2 text-lg">Track the progress of your submitted safety reports</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/student/report-incident"
              className="relative group overflow-hidden flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] whitespace-nowrap text-sm border border-white/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                <Plus size={18} strokeWidth={3} />
                Report New Incident
              </span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/40 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl shadow-black/20 border border-white/10 mb-8 flex items-center justify-between overflow-x-auto overflow-y-hidden">
          <div className="flex gap-2 min-w-max">
            {['All', 'Open', 'Investigating', 'Resolved'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === cat ? 'bg-slate-700 text-white shadow-md border border-white/10' : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center text-slate-500 mr-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
            <Filter size={18} />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-800/30 backdrop-blur-xl rounded-[2rem] border border-white/5">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-400 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            <p className="text-slate-400 font-medium text-lg animate-pulse">Loading your reports...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-slate-800/30 backdrop-blur-xl p-12 lg:p-20 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20 text-center flex flex-col items-center">
            <div className="h-28 w-28 bg-slate-900/80 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <AlertCircle className="h-12 w-12 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No reports found</h3>
            <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed">
              {filter === 'All' 
                ? "You haven't submitted any safety incidents yet. Your active reports will appear here."
                : `You don't have any reports with a status of "${filter}".`}
            </p>
            {filter !== 'All' && (
              <button 
                onClick={() => setFilter('All')} 
                className="px-8 py-3.5 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all active:scale-95"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredIncidents.map((inc) => (
              <div key={inc._id} className="bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl shadow-black/20 hover:bg-slate-800/60 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Left: Key Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                        ID: {inc._id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${getSeverityStyle(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <div className="scale-90 origin-left">
                        <StatusBadge status={inc.status.toLowerCase()} />
                      </div>
                    </div>

                    <h3 className="font-extrabold text-2xl text-white mb-3 truncate group-hover:text-indigo-300 transition-colors">
                      {inc.title || inc.category}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-400 font-medium">
                      <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <Building size={16} className="text-slate-500" />
                        <span className="truncate max-w-[200px]">{inc.property?.title || 'Unknown Property'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <AlertTriangle size={16} className="text-slate-500" />
                        <span>{inc.category}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <Clock size={16} className="text-slate-500" />
                        <span>{new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions / Image */}
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-white/10 shrink-0">
                    {inc.photoUrl && (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 hidden sm:block relative">
                        <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10 pointer-events-none"></div>
                        <img src={inc.photoUrl} alt="Evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 text-sm group/btn"
                    >
                      <Eye size={18} className="text-indigo-400 group-hover/btn:text-indigo-300 transition-colors" />
                      View Details
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {selectedIncident && (
          <IncidentDetailModal 
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)} 
          />
        )}
      </div>
    </div>
  );
}