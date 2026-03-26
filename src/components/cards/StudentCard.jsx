import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, GraduationCap, Phone, Mail, ShieldCheck } from 'lucide-react';

const StudentCard = ({ student }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
    >
      <div className="absolute top-0 right-0 p-4">
        <div className="bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1.5 border border-amber-100">
          <ShieldCheck className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Verified</span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-primary-50 text-primary-600">
           {student.name?.[0] || 'S'}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{student.name}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Student @ {student.university || 'University'}</p>

        <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-slate-50 pt-4 mb-6">
           <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{student.hometown || 'Colombo'}</span>
           </div>
           <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{student.year || '3rd Year'}</span>
           </div>
        </div>

        <div className="w-full flex flex-col gap-2">
           <button 
             className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
             onClick={() => alert(`Contacting ${student.name}...`)}
           >
              <Mail className="w-3.5 h-3.5" />
              Message
           </button>
           <button 
             className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
             onClick={() => alert(`Call: ${student.phonenumber}`)}
           >
              <Phone className="w-3.5 h-3.5" />
              Call
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCard;
