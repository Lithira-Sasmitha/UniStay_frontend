import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, MapPin, GraduationCap, Phone, Mail, Award, Info } from 'lucide-react';

const StudentCard = ({ student, onOpenProfile }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full"
    >
      <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
        {student.profileImage ? (
          <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <User className="w-16 h-16 text-primary-200" />
          </div>
        )}
        {student.isVerified && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-amber-100">
             <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
        )}
        <div className="absolute bottom-4 left-4">
           <div className="bg-primary-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg">
             {student.faculty || 'Uni Student'}
           </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
           <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{student.name}</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">IT No: {student.username?.split('@')[0] || 'N/A'}</p>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-2 text-slate-600">
             <GraduationCap className="w-4 h-4 text-slate-400" />
             <span className="text-sm font-medium">{student.year || 'Unknown Year'} · {student.semester || 'Sem'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
             <MapPin className="w-4 h-4 text-slate-400" />
             <span className="text-sm font-medium">{student.hometown || 'Anywhere'}</span>
          </div>
        </div>

        <button 
          onClick={() => onOpenProfile(student)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-200"
        >
          <Info className="w-4 h-4" />
          View Full Profile
        </button>
      </div>
    </motion.div>
  );
};

export default StudentCard;
