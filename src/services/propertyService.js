import api from './api';

// ── Owner ────────────────────────────────────────────────────────────

/** Create a new property with first room + photos (FormData) */
export const createProperty = (formData) =>
    api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

/** Get owner's own properties */
export const getOwnerListings = () => api.get('/properties/my-listings');

/** Add a room to an existing property */
export const addRoom = (propertyId, data) =>
    api.post(`/properties/${propertyId}/rooms`, data);

/** Update an existing room */
export const updateRoom = (roomId, data) =>
    api.put(`/properties/rooms/${roomId}`, data);

/** Delete a room */
export const deleteRoom = (roomId) =>
    api.delete(`/properties/rooms/${roomId}`);

/** Upload a photo to a property */
export const addPhoto = (propertyId, formData) =>
    api.post(`/properties/${propertyId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

/** Delete a photo from a property */
export const deletePhoto = (propertyId, publicId) =>
    api.delete(`/properties/${propertyId}/photos/${encodeURIComponent(publicId)}`);

/** Toggle property active/inactive */
export const toggleActive = (propertyId) =>
    api.patch(`/properties/${propertyId}/toggle-active`);

/** Get Film Hall view (rooms + occupants) */
export const getFilmHallView = (propertyId) =>
    api.get(`/properties/${propertyId}/film-hall`);

/** Get owner's properties with rooms + occupant details (all properties) */
export const getOwnerBoarding = () => api.get('/properties/my-boarding');

// ── Public ────────────────────────────────────────────────────────────

/** Search public listings (verified + active) */
export const getPublicListings = (search = '') =>
    api.get('/properties/public', { params: search ? { search } : {} });

/** Get single property detail */
export const getListingById = (propertyId) =>
    api.get(`/properties/${propertyId}`);

// ── Admin ─────────────────────────────────────────────────────────────

/** Get verification queue */
export const getVerificationQueue = () =>
    api.get('/properties/admin/verification-queue');

/** Get all properties (admin view) */
export const getAllProperties = () =>
    api.get('/properties/admin/all');

/** Assign trust badge to a property */
export const setTrustBadge = (propertyId, badge) =>
    api.patch(`/properties/admin/${propertyId}/badge`, { badge });
