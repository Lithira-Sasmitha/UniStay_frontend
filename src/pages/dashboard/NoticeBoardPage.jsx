import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plus, ChevronLeft, Loader2, Trash2, Edit3,
  AlertTriangle, Calendar, X, CheckCircle, ChevronLeft as ChevLeft, ChevronRight as ChevRight,
  Clock, FileText,
} from 'lucide-react';
import {
  createNotice, getOwnerNotices, updateNotice, deleteNotice,
} from '../../services/noticeService';

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// Format a date for datetime-local input: "YYYY-MM-DDTHH:MM"
const toDateTimeLocal = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Keep old helper for calendar dot mapping
const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ─── Tiny form component ──────────────────────────────────────────────────────
const NoticeForm = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    content: initial?.content || '',
    isUrgent: initial?.isUrgent || false,
    eventDate: initial?.eventDate ? toDateTimeLocal(initial.eventDate) : '',
    expiresAt: initial?.expiresAt ? toDateTimeLocal(initial.expiresAt) : '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Title *</label>
        <input
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-slate-800 font-semibold text-sm transition-all"
          placeholder="e.g. Water cut scheduled for Sunday"
        />
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Content *</label>
        <textarea
          required
          rows={4}
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-slate-800 font-semibold text-sm transition-all resize-none"
          placeholder="Describe the notice in detail…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-400" />
            Event / Deadline Date &amp; Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Clock className="absolute left-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
            <input
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => set('eventDate', e.target.value)}
              className="w-full pl-14 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-slate-800 text-sm transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5 ml-1">Shown on the calendar &amp; notice card</p>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Expires At — Date &amp; Time (optional)
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-slate-800 text-sm transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5 ml-1">Notice auto-hides after this date &amp; time</p>
        </div>
      </div>

      {/* Urgent toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none group">
        <div
          onClick={() => set('isUrgent', !form.isUrgent)}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.isUrgent ? 'bg-red-500' : 'bg-slate-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isUrgent ? 'left-7' : 'left-1'}`} />
        </div>
        <span className="text-sm font-black text-slate-700 flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${form.isUrgent ? 'text-red-500' : 'text-slate-300'}`} />
          Mark as Urgent
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {initial ? 'Save Changes' : 'Post Notice'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3.5 border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Calendar component ───────────────────────────────────────────────────────
const NoticeCalendar = ({ notices }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelected(null);
  };

  // Build map: dateStr → notices[]
  const eventMap = {};
  notices.forEach((n) => {
    if (n.eventDate) {
      const key = toDateStr(n.eventDate);
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(n);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = toDateStr(today);

  const selectedDateNotices = selected ? (eventMap[selected] || []) : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ChevLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h3 className="font-black text-slate-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ChevRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-slate-50">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const hasEvents = eventMap[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;
          const hasUrgent = hasEvents?.some((n) => n.isUrgent);

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : dateStr)}
              className={`h-12 flex flex-col items-center justify-center relative transition-all rounded-xl m-0.5 ${
                isSelected ? 'bg-primary-600 text-white' :
                isToday ? 'bg-primary-50 text-primary-700 font-black' :
                'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold">{day}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasUrgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {hasEvents.some(n => !n.isUrgent) && <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day notices */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                {new Date(selected + 'T00:00:00').toDateString()}
              </p>
              {selectedDateNotices.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium">No notices on this date.</p>
              ) : (
                selectedDateNotices.map((n) => (
                  <div key={n._id} className={`p-3 rounded-2xl border text-sm font-semibold ${n.isUrgent ? 'bg-red-50 border-red-200 text-red-800' : 'bg-primary-50 border-primary-100 text-primary-800'}`}>
                    {n.isUrgent && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mr-2">Urgent</span>}
                    {n.title}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const NoticeBoardPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // notice being edited
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchNotices = useCallback(async () => {
    try {
      const { data } = await getOwnerNotices(propertyId);
      setNotices(data.notices || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [propertyId]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      const { data } = await createNotice({ propertyId, ...form });
      setNotices((prev) => [data.notice, ...prev]);
      setShowForm(false);
      showToast('Notice posted and students notified via email.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to post notice.');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    try {
      const { data } = await updateNotice(editTarget._id, form);
      setNotices((prev) => prev.map((n) => n._id === editTarget._id ? data.notice : n));
      setEditTarget(null);
      showToast('Notice updated.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update notice.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget._id);
      setNotices((prev) => prev.filter((n) => n._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast('Notice deleted.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete notice.');
    }
  };

  const urgentNotices = notices.filter((n) => n.isUrgent);
  const regularNotices = notices.filter((n) => !n.isUrgent);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="min-h-screen bg-slate-50 p-6 md:p-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <button onClick={() => navigate('/owner')}
            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 text-sm font-bold mb-3 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Notice Board
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Manage Notices</h1>
          <p className="text-slate-500 font-medium mt-1">Post announcements to your boarding house students.</p>
        </div>

        <button
          onClick={() => { setShowForm(true); setEditTarget(null); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-xl shadow-primary-200 transition-all hover:scale-[1.03]"
        >
          <Plus className="w-4 h-4" /> New Notice
        </button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: notices list */}
        <div className="xl:col-span-2 space-y-6">

          {/* Create / Edit form */}
          <AnimatePresence>
            {(showForm || editTarget) && (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className="bg-white rounded-3xl p-8 border border-primary-100 shadow-lg shadow-primary-50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-slate-900">
                    {editTarget ? 'Edit Notice' : 'Post New Notice'}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditTarget(null); }}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <NoticeForm
                  initial={editTarget}
                  onSubmit={editTarget ? handleUpdate : handleCreate}
                  onCancel={() => { setShowForm(false); setEditTarget(null); }}
                  loading={formLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : notices.length === 0 ? (
            <motion.div variants={itemVariants}
              className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-black text-slate-600 text-lg mb-1">No notices yet</p>
              <p className="text-slate-400 text-sm">Post your first notice to keep students informed.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Urgent notices first */}
              {urgentNotices.map((notice) => (
                <NoticeCard key={notice._id} notice={notice}
                  onEdit={() => { setEditTarget(notice); setShowForm(false); }}
                  onDelete={() => setDeleteTarget(notice)} />
              ))}
              {regularNotices.map((notice) => (
                <NoticeCard key={notice._id} notice={notice}
                  onEdit={() => { setEditTarget(notice); setShowForm(false); }}
                  onDelete={() => setDeleteTarget(notice)} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Calendar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <NoticeCalendar notices={notices} />

          {/* Legend */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legend</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-bold text-slate-600">Urgent notice event</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-400" />
                <span className="text-sm font-bold text-slate-600">Regular notice event</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-100 border-2 border-primary-400" />
                <span className="text-sm font-bold text-slate-600">Today</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Summary</p>
            <div className="space-y-3">
              {[
                { label: 'Total Notices', value: notices.length, color: 'text-slate-800' },
                { label: 'Urgent', value: urgentNotices.length, color: 'text-red-600' },
                { label: 'With Event Date', value: notices.filter(n => n.eventDate).length, color: 'text-primary-600' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">{s.label}</span>
                  <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Notice?</h3>
              <p className="text-slate-500 text-sm font-medium mb-7">
                "{deleteTarget.title}" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all">
                  Delete
                </button>
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ notice, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${
        notice.isUrgent ? 'border-red-200 shadow-red-50' : 'border-slate-100'
      }`}
    >
      {notice.isUrgent && (
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-orange-400" />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              notice.isUrgent ? 'bg-red-100' : 'bg-primary-50'
            }`}>
              {notice.isUrgent
                ? <AlertTriangle className="w-4 h-4 text-red-600" />
                : <Bell className="w-4 h-4 text-primary-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {notice.isUrgent && (
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Urgent
                  </span>
                )}
                <h3 className="font-black text-slate-800 text-sm">{notice.title}</h3>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(notice.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                </span>
                {notice.eventDate && (
                  <span className="flex items-center gap-1 text-[11px] text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.eventDate).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                    {' · '}
                    <Clock className="w-3 h-3" />
                    {new Date(notice.eventDate).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                  </span>
                )}
                {notice.expiresAt && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    Expires {new Date(notice.expiresAt).toLocaleDateString('en-US', { day:'numeric', month:'short' })}{' '}
                    {new Date(notice.expiresAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onEdit}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete}
              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content toggle */}
        <button onClick={() => setExpanded((p) => !p)}
          className="mt-4 text-left w-full">
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.p key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {notice.content}
              </motion.p>
            ) : (
              <p className="text-sm text-slate-500 font-medium line-clamp-2 hover:text-slate-700 transition-colors">
                {notice.content}
              </p>
            )}
          </AnimatePresence>
          <span className="text-xs font-black text-primary-500 mt-1 inline-block">
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default NoticeBoardPage;
