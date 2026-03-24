import React, { useState, useEffect } from 'react';
import incidentService from '../../services/incidentService';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge'; 

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentService.getMyIncidents()
      .then(res => setIncidents(res.data || []))
      .catch(err => console.error('Failed to load incidents', err))
      .finally(() => setLoading(false));
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your incidents...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Reports</h1>
        <Link 
          to="/student/report-incident" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          + Report New Incident
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500">You haven't reported any incidents yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((inc) => (
            <div key={inc._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{inc.category}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getSeverityColor(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <StatusBadge status={inc.status.toLowerCase().replace(' ', '-')} />
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Property:</span> {inc.property?.title || 'Unknown Property'}
                </p>
                
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                  {inc.description}
                </p>

                <div className="text-xs text-gray-400 mt-3">
                  Reported on: {new Date(inc.createdAt).toLocaleString()}
                </div>
              </div>

              {inc.photoUrl && (
                <div className="w-full md:w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  <img src={inc.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}