import React from 'react';
import { CheckCircle2, Circle, Clock, User, Shield, Building, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * IncidentTimeline - Visual history of an incident report's lifecycle.
 * @param {Array} history - List of history objects: { status, action, note, updatedBy: {name}, actorType, timestamp }
 * @param {string} currentStatus - current status of the incident
 */
const IncidentTimeline = ({ history = [], currentStatus = 'open' }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
        <Clock className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-semibold text-slate-500">Timeline view is only available for newer reports.</p>
        <p className="text-xs max-w-[240px] text-center mt-1">Audit logs will start appearing as this incident moves through the process.</p>
      </div>
    );
  }

  // Sort history by timestamp (chronological)
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Track unique statuses to highlight progress path
  const statuses = ['open', 'investigating', 'resolved', 'rejected'];

  return (
    <div className="relative pl-6 py-2">
      {/* Vertical Line track */}
      <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-slate-100 rounded-full"></div>

      <div className="space-y-8">
        {sortedHistory.map((event, index) => {
          const isLatest = index === sortedHistory.length - 1;
          const isInitial = index === 0;
          
          let colorClass = "text-slate-400 border-slate-200 bg-white";
          let icon = <Circle className="w-2.5 h-2.5 fill-current" />;
          
          if (event.status === 'resolved') {
             colorClass = "text-emerald-500 border-emerald-500 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
             icon = <CheckCircle2 className="w-3.5 h-3.5" />;
          } else if (event.status === 'rejected') {
             colorClass = "text-red-500 border-red-500 bg-red-50";
             icon = <CheckCircle2 className="w-3.5 h-3.5" />;
          } else if (isLatest) {
             colorClass = "text-blue-600 border-blue-600 bg-blue-50 ring-4 ring-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.25)]";
             icon = <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse ring-2 ring-white" />;
          }

          return (
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              key={index} 
              className="relative group"
            >
              {/* Vertical line fill (past events) */}
              {!isLatest && (
                <div className="absolute left-[-15px] top-8 w-[2px] h-[calc(100%+8px)] bg-blue-500/20 rounded-full group-hover:bg-blue-400 transition-colors"></div>
              )}

              {/* Status Circle Icon */}
              <div className={`absolute -left-[32px] top-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${colorClass}`}>
                {icon}
              </div>

              {/* Event Content Container */}
              <div className={`p-5 rounded-2xl border transition-all duration-500 overflow-hidden relative ${
                isLatest ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-xl shadow-blue-500/5' : 'bg-white border-slate-100/80 hover:border-slate-300 hover:shadow-md'
              }`}>
                {/* Visual Flair for latest */}
                {isLatest && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-base font-black tracking-tight ${isLatest ? 'text-blue-900' : 'text-slate-800'}`}>
                      {event.action}
                    </h4>
                    {isLatest && (
                       <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-blue-700/50">
                          Current status
                       </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <Clock size={12} className="opacity-60" />
                    {new Date(event.timestamp).toLocaleDateString('en-GB', { 
                       day: '2-digit', month: 'short' 
                    })} 
                    <span className="opacity-30">•</span>
                    {new Date(event.timestamp).toLocaleTimeString('en-GB', { 
                       hour: '2-digit', minute: '2-digit', hour12: true 
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                   {/* Actor Badge */}
                   <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border-2 transition-transform group-hover:scale-105 ${
                     event.actorType === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                     event.actorType === 'owner' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                     'bg-emerald-50 text-emerald-700 border-emerald-100'
                   }`}>
                     {event.actorType === 'admin' ? <Shield size={14} className="stroke-[2.5]" /> : 
                      event.actorType === 'owner' ? <Building size={14} className="stroke-[2.5]" /> : 
                      <User size={14} className="stroke-[2.5]" />}
                     <span className="uppercase tracking-wide opacity-60 mr-1">{event.actorType}</span>
                     <span className="text-sm font-black tracking-tight">{event.updatedBy?.name || 'Authorized User'}</span>
                   </div>
                   
                   {/* Optional: Navigation hint */}
                   {!isLatest && (
                     <div className="text-slate-300">
                        <ChevronRight size={14} />
                     </div>
                   )}
                </div>

                {event.note && (
                  <div className={`mt-3 p-4 rounded-xl text-sm leading-relaxed border font-medium ${
                    isLatest ? 'bg-blue-600/5 border-blue-100/50 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}>
                    <div className="flex gap-2">
                       <span className="text-lg opacity-20 -mt-1 font-serif">“</span>
                       <span>{event.note}</span>
                       <span className="text-lg opacity-20 mt-auto ml-auto font-serif">”</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* FINAL TARGET INDICATOR (If not complete) */}
      {!['resolved', 'rejected'].includes(currentStatus) && (
         <div className="mt-8 relative group opacity-40 hover:opacity-100 transition-opacity">
            <div className="absolute -left-[32px] top-1.5 w-7 h-7 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center z-10">
               <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-slate-300"></div>
            </div>
            <div className="ml-5 p-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-between">
               <p className="text-slate-400 text-sm font-bold tracking-tight">Pending Resolution / Final Action</p>
               <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Awaiting Admin</span>
            </div>
         </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
