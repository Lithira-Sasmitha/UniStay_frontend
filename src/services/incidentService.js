import api from './api';

const incidentService = {
  createIncident: (formData) =>
    api.post('/incidents', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }).then(r => r.data),

  getMyIncidents: () => 
    api.get('/incidents/me').then(r => r.data),

  getIncidents: (params) => 
    api.get('/incidents', { params }).then(r => r.data),

  updateStatus: (id, status) => 
    api.patch(`/incidents/${id}/status`, { status }).then(r => r.data),

  getPropertySafety: (propertyId) => 
    api.get(`/properties/${propertyId}/safety`).then(r => r.data),
};

export default incidentService;