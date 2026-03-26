import React, { useState, useEffect } from 'react';
import incidentService from '../../services/incidentService';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { AlertTriangle, Clock, MapPin, Building, Eye, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import IncidentDetailModal from '../../components/modals/IncidentDetailModal';

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const nav = useNavigate();

  useEffect(() => {
    incidentService.getMyIncidents()
      .then(res => setIncidents(res.data?.data || res.data || []))
      .catch(err => console.error('Failed to load incidents', err))
      .finally(() => setLoading(false));
  }, []);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-orange-700 bg-orange-100 border-orange-200';   
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const filteredIncidents = filter === 'All' 
    ? incidents 
    : incidents.filter(inc => inc.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Safety Reports</h1>
          <p className="text-gray-500 mt-2">Track the progress of your submitted safety reports</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to="/student/report-incident"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap text-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Report New Incident
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-8 flex items-center justify-between overflow-x-auto overflow-y-hidden">
        <div className="flex gap-2 min-w-max">
          {['All', 'Open', 'Investigating', 'Resolved'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${filter === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center text-gray-400 mr-2">
          <Filter size={18} />
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your reports...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm text-center flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No reports found</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            {filter === 'All' 
              ? "You haven't submitted any safety incidents yet. Your active reports will appear here."
              : `You don't have any reports with a status of "${filter}".`}
          </p>
          {filter !== 'All' && (
            <Button onClick={() => setFilter('All')} variant="outline">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredIncidents.map((inc) => (
            <div key={inc._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-6">
                
                {/* Left: Key Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      ID: {inc._id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-extrabold rounded-md border ${getSeverityStyle(inc.severity)}`}>
                      {inc.severity} Severity
                    </span>
                    <StatusBadge status={inc.status.toLowerCase()} />
                  </div>

                  <h3 className="font-extrabold text-xl text-gray-900 mb-2 truncate">
                    {inc.title || inc.category}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building size={16} className="text-gray-400" />
                      <span className="truncate max-w-[200px]">{inc.property?.title || 'Unknown Property'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-gray-400" />
                      <span>{inc.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-gray-400" />
                      <span>{new Date(inc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions / Image */}
                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-gray-100">
                  {inc.photoUrl && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-gray-100 hidden sm:block">
                      <img src={inc.photoUrl} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors shrink-0 text-sm"
                  >
                    <Eye size={18} />
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
  );
}