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
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-200 shadow-sm';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200 shadow-sm';   
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-sm';
    }
  };

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(inc => inc.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-[calc(100vh-4rem)] relative font-sans">
      {/* Animated Gradient Background - Light Mode */}
      <div className="fixed inset-0 z-0 bg-slate-50 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-white opacity-80"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-200/10 rounded-full blur-[150px] mix-blend-multiply animate-pulse duration-7000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 max-w-6xl mx-auto pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 mt-4">
          <div>
            <div className="inline-flex items-center justify-center p-2.5 text-indigo-600 bg-white backdrop-blur-md rounded-2xl mb-4 border border-indigo-100 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">My Safety Reports</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Track the progress of your submitted safety reports</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/student/report-incident"
              className="relative group overflow-hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] whitespace-nowrap text-sm border border-indigo-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus size={18} strokeWidth={3} />
                Report New Incident
              </span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-2.5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center justify-between overflow-x-auto overflow-y-hidden">
          <div className="flex gap-2 min-w-max">
            {['All', 'Open', 'Investigating', 'Resolved'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === cat ? 'bg-indigo-600 text-white shadow-md border border-indigo-500' : 'bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center text-slate-400 mr-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Filter size={18} />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-slate-200">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600 mb-6 shadow-sm"></div>
            <p className="text-slate-500 font-bold text-lg animate-pulse">Loading your reports...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl p-12 lg:p-20 rounded-[2.5rem] border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <div className="h-28 w-28 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
              <AlertCircle className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No reports found</h3>
            <p className="text-slate-500 text-lg max-w-md mb-10 leading-relaxed font-medium">
              {filter === 'All' 
                ? "You haven't submitted any safety incidents yet. Your active reports will appear here."
                : `You don't have any reports with a status of "${filter}".`}
            </p>
            {filter !== 'All' && (
              <button 
                onClick={() => setFilter('All')} 
                className="px-8 py-3.5 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all active:scale-95"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredIncidents.map((inc) => (
              <div key={inc._id} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-white transition-all duration-300 overflow-hidden group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Left: Key Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
                        ID: {inc._id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${getSeverityStyle(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <div className="scale-90 origin-left">
                        <StatusBadge status={inc.status.toLowerCase()} />
                      </div>
                    </div>

                    <h3 className="font-extrabold text-2xl text-slate-900 mb-3 truncate group-hover:text-indigo-600 transition-colors">
                      {inc.title || inc.category}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-600 font-bold">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Building size={16} className="text-indigo-500" />
                        <span className="truncate max-w-[200px]">{inc.property?.title || 'Unknown Property'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span>{inc.category}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Clock size={16} className="text-slate-400" />
                        <span>{new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions / Image */}
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-slate-100 shrink-0">
                    {(inc.photoUrl || (inc.photos && inc.photos[0])) && (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200 hidden sm:block relative shadow-sm">
                        <img src={inc.photoUrl || inc.photos[0]} alt="Evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm active:scale-[0.98] text-sm group/btn"
                    >
                      <Eye size={18} className="text-indigo-600 group-hover/btn:text-indigo-500 transition-colors" />
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