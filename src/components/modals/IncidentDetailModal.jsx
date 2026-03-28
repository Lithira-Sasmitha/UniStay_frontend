import React from 'react';
import { X, Calendar, MapPin, Building, AlertTriangle, User, Hash } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function IncidentDetailModal({ incident, onClose }) {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 z-[9999]" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase bg-white px-2.5 py-1 rounded-md border border-slate-200">
                REPORT #{incident._id.substring(0, 8).toUpperCase()}
              </span>
              <StatusBadge status={incident.status.toLowerCase()} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{incident.title || incident.category}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Property</p>
                  <p className="font-bold text-slate-900">{incident.property?.title || 'Unknown Property'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Reported On</p>
                  <p className="font-bold text-slate-900">{new Date(incident.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Category / Severity</p>
                  <p className="font-bold text-slate-900">{incident.category} <span className="text-slate-400 mx-1">•</span> {incident.severity}</p>
                </div>
              </div>

              {incident.student && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Reporter</p>
                    <p className="font-bold text-slate-900">{incident.student?.name || 'Student'}</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Incident Description</h3>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
              {incident.description}
            </div>
          </div>

          {incident.photoUrl && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Attached Evidence</h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <img src={incident.photoUrl} alt="Evidence" className="w-full h-auto object-contain max-h-[300px] bg-slate-50" />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}