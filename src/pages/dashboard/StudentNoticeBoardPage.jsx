import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronLeft, Loader2, AlertTriangle, Calendar,
  Clock, FileText, ChevronLeft as ChevLeft, ChevronRight as ChevRight, Timer,
} from 'lucide-react';
import { getStudentNotices } from '../../services/noticeService';

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ChevLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h3 className="font-black text-slate-800">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ChevRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-12" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const hasEvents = eventMap[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;
          const hasUrgent = hasEvents?.some(n => n.isUrgent);

          return (
            <button key={day} onClick={() => setSelected(isSelected ? null : dateStr)}
              className={`h-12 flex flex-col items-center justify-center relative transition-all rounded-xl m-0.5 ${
                isSelected ? 'bg-primary-600 text-white' :
                isToday ? 'bg-primary-50 text-primary-700 font-black' :
                'hover:bg-slate-50 text-slate-700'
              }`}>
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

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="border-t border-slate-100 overflow-hidden">
            <div className="p-4 space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                {new Date(selected + 'T00:00:00').toDateString()}
              </p>
              {selectedDateNotices.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium">No notices on this date.</p>
              ) : (
                selectedDateNotices.map((n) => (
                  <div key={n._id}
                    className={`p-3 rounded-2xl border text-sm font-semibold ${
                      n.isUrgent ? 'bg-red-50 border-red-200 text-red-800' : 'bg-primary-50 border-primary-100 text-primary-800'
                    }`}>
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

// ─── Student Notice Card ───────────────────────────────────────────────────────
const StudentNoticeCard = ({ notice }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
        notice.isUrgent ? 'border-red-200 shadow-red-50' : 'border-slate-100'
      }`}>
      {notice.isUrgent && (
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-orange-400" />
      )}
      <div className="p-6">
        <div className="flex items-start gap-3">
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
                  <Timer className="w-3 h-3" />
                  Expires {new Date(notice.expiresAt).toLocaleDateString('en-US', { day:'numeric', month:'short' })}{' '}
                  {new Date(notice.expiresAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                </span>
              )}
            </div>

            <button onClick={() => setExpanded(p => !p)} className="mt-4 text-left w-full">
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
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const StudentNoticeBoardPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [propertyName, setPropertyName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getStudentNotices();
        setNotices(data.notices || []);
        setPropertyName(data.propertyName || null);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const urgentNotices = notices.filter(n => n.isUrgent);
  const regularNotices = notices.filter(n => !n.isUrgent);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="min-h-screen bg-slate-50 p-6 md:p-10">

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-10">
        <button onClick={() => navigate('/student')}
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
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {propertyName ? `${propertyName}` : 'Notice Board'}
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Announcements and updates from your boarding house.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : !propertyName && notices.length === 0 ? (
        <motion.div variants={itemVariants}
          className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center max-w-lg mx-auto">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-black text-slate-600 text-lg mb-1">No confirmed booking</p>
          <p className="text-slate-400 text-sm">
            You need a confirmed booking to view notices from your boarding house.
          </p>
          <button onClick={() => navigate('/listings')}
            className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-colors text-sm">
            Browse Listings
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Notices */}
          <div className="xl:col-span-2 space-y-4">
            {/* Urgent banner */}
            {urgentNotices.length > 0 && (
              <motion.div variants={itemVariants}
                className="bg-red-50 border border-red-200 rounded-3xl px-6 py-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm font-black text-red-700">
                  {urgentNotices.length} urgent notice{urgentNotices.length > 1 ? 's' : ''} — please read immediately.
                </p>
              </motion.div>
            )}

            {notices.length === 0 ? (
              <motion.div variants={itemVariants}
                className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="font-black text-slate-600 text-lg mb-1">No notices yet</p>
                <p className="text-slate-400 text-sm">Your boarding house hasn't posted any notices.</p>
              </motion.div>
            ) : (
              <>
                {urgentNotices.map(n => <StudentNoticeCard key={n._id} notice={n} />)}
                {regularNotices.map(n => <StudentNoticeCard key={n._id} notice={n} />)}
              </>
            )}
          </div>

          {/* Calendar */}
          <motion.div variants={itemVariants} className="space-y-6">
            <NoticeCalendar notices={notices} />

            {/* Stats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Overview</p>
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

            {/* Legend */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legend</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-slate-600">Urgent event</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-400" />
                  <span className="text-sm font-bold text-slate-600">Regular event</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentNoticeBoardPage;
