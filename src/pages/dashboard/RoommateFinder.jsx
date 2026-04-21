import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Search, Calendar, LogOut,
  User as UserIcon, ChevronDown, Loader2,
  CreditCard, XCircle, CheckCircle, Clock,
  ShieldCheck, ShieldAlert, Award, Mail, Key, Zap,
  Filter, MapPin, Phone, Info
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import StudentCard from '../../components/dashboard/StudentCard';
import ContactModal from '../../components/modals/ContactModal';

const RoommateFinder = () => {
  const { user } = useAuth();
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    faculty: '',
    year: '',
    semester: '',
    hometown: ''
  });

  const fetchRoommates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getRoommates(filters);
      setRoommates(response.roommates || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to search roommates. Ensure you are verified and have no active bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ faculty: '', year: '', semester: '', hometown: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-24 pt-32">
      {/* Header */}
      <div className="mb-12">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2 rounded-xl border border-amber-200 shadow-sm">
             <Award className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-sm">Elite Feature</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">Roommate Finder</h1>
        <p className="text-slate-500 font-medium max-w-2xl text-lg mb-8 leading-relaxed">Connect with verified students who share your academic background and habits. Only verified students without current bookings are listed here.</p>
        
        {/* Filter Panel */}
        <motion.div 
           initial={{ y: 20, opacity: 0 }} 
           animate={{ y: 0, opacity: 1 }}
           className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 mb-12 flex flex-col xl:flex-row items-center gap-6"
        >
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
              <div className="relative group/filter">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <GraduationCap className="w-4 h-4 text-slate-400 group-focus-within/filter:text-primary-500 transition-colors" />
                 </div>
                 <select 
                    name="faculty" value={filters.faculty} onChange={handleFilterChange}
                    className="w-full bg-slate-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                 >
                    <option value="">Faculty (Any)</option>
                    <option value="Computing">Computing</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Humanities">Humanities</option>
                 </select>
              </div>

              <div className="relative group/filter">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Calendar className="w-4 h-4 text-slate-400 group-focus-within/filter:text-primary-500 transition-colors" />
                 </div>
                 <select 
                    name="year" value={filters.year} onChange={handleFilterChange}
                    className="w-full bg-slate-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                 >
                    <option value="">Year (Any)</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                 </select>
              </div>

              <div className="relative group/filter">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Key className="w-4 h-4 text-slate-400 group-focus-within/filter:text-primary-500 transition-colors" />
                 </div>
                 <select 
                    name="semester" value={filters.semester} onChange={handleFilterChange}
                    className="w-full bg-slate-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                 >
                    <option value="">Semester (Any)</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                 </select>
              </div>

              <div className="relative group/filter">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-slate-400 group-focus-within/filter:text-primary-500 transition-colors" />
                 </div>
                 <input 
                    name="hometown" value={filters.hometown} onChange={handleFilterChange} placeholder="Hometown"
                    className="w-full bg-slate-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
                 />
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                 onClick={fetchRoommates}
                 className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:scale-[1.05] transition-transform flex items-center gap-2"
              >
                 <Search className="w-4 h-4" />
                 Apply Filters
              </button>
              <button onClick={clearFilters} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors">
                 <LogOut className="w-5 h-5" />
              </button>
           </div>
        </motion.div>
      </div>

      {/* Results */}
      {error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-red-50 rounded-[3rem] border-2 border-dashed border-red-200">
           <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h3 className="text-2xl font-black text-slate-900">Access Restricted</h3>
           <p className="text-slate-500 font-medium max-w-md mx-auto">{error}</p>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
           <p className="text-slate-400 font-bold uppercase tracking-widest">Searching verified roommates...</p>
        </div>
      ) : roommates.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <p className="text-5xl mb-4">🔍</p>
           <h3 className="text-2xl font-black text-slate-900">No roommates found</h3>
           <p className="text-slate-500 font-medium">Try adjusting your filters to see more students.</p>
        </motion.div>
      ) : (
        <motion.div 
           variants={containerVariants} initial="hidden" animate="show"
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {roommates.map((student) => (
            <StudentCard key={student._id} student={student} onOpenProfile={(s) => { setSelectedStudent(s); setContactRevealed(false); }} />
          ))}
        </motion.div>
      )}

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedStudent(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               <div className="w-full md:w-5/12 bg-slate-100 relative">
                  {selectedStudent.profileImage ? (
                    <img src={selectedStudent.profileImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center min-h-[300px]">
                       <UserIcon className="w-24 h-24 text-primary-200" />
                    </div>
                  )}
               </div>

               <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Gold Verified</span>
                     </div>
                     <button onClick={() => setSelectedStudent(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <XCircle className="w-6 h-6 text-slate-400" />
                     </button>
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedStudent.name}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Role: Student Profile</p>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Faculty</p>
                        <p className="text-slate-800 font-black">{selectedStudent.faculty || 'Unspecified'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Academic Level</p>
                        <p className="text-slate-800 font-black">{selectedStudent.year || 'N/A'} - {selectedStudent.semester || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Hometown</p>
                        <p className="text-slate-800 font-black text-xs">{selectedStudent.hometown || 'Anywhere'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">University</p>
                        <p className="text-slate-800 font-black text-xs uppercase">{selectedStudent.university || 'SLIIT'}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {contactRevealed ? (
                        <div className="space-y-3 bg-primary-50 p-6 rounded-[2rem] border border-primary-100">
                           <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-primary-600" />
                              <span className="text-primary-900 font-black text-lg">{selectedStudent.phonenumber}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-primary-600" />
                              <span className="text-primary-900 font-bold break-all">{selectedStudent.email}</span>
                           </div>
                           <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest pt-2">Contact revealed from verification data</p>
                        </div>
                     ) : (
                        <div className="flex flex-col gap-3">
                           <button 
                              onClick={() => { setContactRevealed(true); }}
                              className="w-full py-4 bg-primary-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 mb-2"
                           >
                              <Phone className="w-5 h-5" />
                              Unlock Contact Details
                           </button>
                           <button 
                              onClick={() => setIsMessageOpen(true)}
                              className="w-full py-4 bg-primary-50 text-primary-700 border border-primary-200 rounded-[2rem] font-black text-lg shadow-sm hover:bg-primary-100 transition-colors flex items-center justify-center gap-3"
                           >
                              <Mail className="w-5 h-5" />
                              Message Student
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>

            {/* Modals for inside the profile view */}
            <ContactModal
                isOpen={isMessageOpen}
                onClose={() => setIsMessageOpen(false)}
                receiverId={selectedStudent._id}
                receiverName={selectedStudent.name}
                receiverRole="student"
                isShareRequest={false}
            />
            <ContactModal
                isOpen={isRequestOpen}
                onClose={() => setIsRequestOpen(false)}
                receiverId={selectedStudent._id}
                receiverName={selectedStudent.name}
                receiverRole="student"
                isShareRequest={true}
            />

          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoommateFinder;
