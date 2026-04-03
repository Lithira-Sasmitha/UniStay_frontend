import api from './api';

// ── Owner ────────────────────────────────────────────────────────────────────

export const createNotice = (data) => api.post('/notices', data);

export const getOwnerNotices = (propertyId) =>
    api.get(`/notices/property/${propertyId}`);

export const updateNotice = (noticeId, data) =>
    api.put(`/notices/${noticeId}`, data);

export const deleteNotice = (noticeId) =>
    api.delete(`/notices/${noticeId}`);

// ── Student ──────────────────────────────────────────────────────────────────

export const getStudentNotices = () => api.get('/notices/my');
