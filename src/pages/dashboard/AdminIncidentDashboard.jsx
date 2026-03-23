import React, { useState, useEffect } from 'react';
import incidentService from '../../services/incidentService';
import authService from '../../services/authService';
import Toast from '../../components/common/Toast';

export default function AdminIncidentDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const role = authService.getRole();
  const isAdmin = role === 'superadmin';

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    setLoading(true);
    incidentService.getIncidents()
      .then(res => setIncidents(res.data || []))
      .catch(err => console.error('Failed to load incidents', err))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await incidentService.updateStatus(id, newStatus);
      setToast({ message: 'Status updated successfully', type: 'success' });
      setIncidents(prev => prev.map(inc => inc._id === id ? { ...inc, status: newStatus } : inc));
    } catch (err) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const statusColors = {
    'Open': 'bg-blue-100 text-blue-800',
    'Under Investigation': 'bg-purple-100 text-purple-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-gray-100 text-gray-800'
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'System Safety Control' : 'Property Incidents'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Date & Reporter</th>
                <th className="p-4 font-semibold">Property</th>
                <th className="p-4 font-semibold">Category/Severity</th>
                <th className="p-4 font-semibold">Status</th>
                {isAdmin && <th className="p-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No incidents reported.</td>
                </tr>
              ) : incidents.map(inc => (
                <tr key={inc._id} className="hover:bg-gray-50">
                  <td className="p-4 align-top">
                    <div className="whitespace-nowrap">{new Date(inc.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{inc.reporter?.name || 'Unknown'}</div>
                  </td>
                  <td className="p-4 align-top">
                    {inc.property?.title || 'Unknown'}
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-medium">{inc.category}</div>
                    <div className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full 
                      ${inc.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {inc.severity}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inc.status] || 'bg-gray-100'}`}>
                      {inc.status}
                    </span>
                    <div className="mt-2 text-gray-600 line-clamp-2 max-w-xs" title={inc.description}>
                      {inc.description}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-4 align-top text-right">
                      <select 
                        className="text-xs border border-gray-300 rounded p-1.5 focus:ring-primary-500"
                        value={inc.status}
                        onChange={(e) => handleStatusChange(inc._id, e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="Under Investigation">Investigating</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}