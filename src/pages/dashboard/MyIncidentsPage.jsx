import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Building, Eye, Plus, ShieldAlert, Loader2 } from 'lucide-react';
import incidentService from '../../services/incidentService';
import StatusBadge from '../../components/common/StatusBadge';
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
      case 'High': return 'text-rose-700 bg-rose-50 border border-rose-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border border-amber-200';
      default: return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    }
  };

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(inc => inc.status.toLowerCase() === filter.toLowerCase());

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 mt-8">
          My <span className="text-primary-600">Safety Reports</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Track the progress of your submitted safety reports and view responses.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/student/report-incident"
            className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} strokeWidth={3} />
            Report New Incident
          </Link>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl mx-auto bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-200 mb-10 flex items-center justify-center sm:justify-start overflow-x-auto"
      >
        <div className="flex gap-2 min-w-max mx-auto sm:mx-0">
          {['All', 'Open', 'Investigating', 'Resolved'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === cat ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-slate-500 font-medium">Loading your reports...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-6xl mb-4">🛡️</p>
            <h3 className="text-xl font-black text-slate-700 mb-2">No Reports Found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
              {filter === 'All' 
                ? "You haven't submitted any safety incidents yet."
                : `You don't have any reports with a status of "${filter}".`}
            </p>
            {filter !== 'All' && (
              <button 
                onClick={() => setFilter('All')} 
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6"
          >
            {filteredIncidents.map((inc) => (
              <motion.div key={inc._id} variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Left: Key Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        ID: {inc._id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg ${getSeverityStyle(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <div className="scale-90 origin-left">
                        <StatusBadge status={inc.status.toLowerCase()} />
                      </div>
                    </div>

                    <h3 className="font-extrabold text-2xl text-slate-900 mb-3 truncate group-hover:text-primary-600 transition-colors">
                      {inc.title || inc.category}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Building size={16} className="text-slate-400" />
                        <span className="truncate max-w-[200px] text-slate-700">{inc.property?.title || 'Unknown Property'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <AlertTriangle size={16} className="text-slate-400" />
                        <span className="text-slate-700">{inc.category}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-slate-700">{new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions / Image */}
                  <div className="flex items-center justify-between md:justify-end gap-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none border-slate-100 shrink-0">
                    {inc.photoUrl && (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200 hidden sm:block relative">
                        <img src={inc.photoUrl} alt="Evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 text-sm group/btn shadow-sm"
                    >
                      <Eye size={18} className="text-primary-500 group-hover/btn:text-primary-600 transition-colors" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
