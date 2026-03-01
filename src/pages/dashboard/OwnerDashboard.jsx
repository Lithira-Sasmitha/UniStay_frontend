import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building, 
  Plus, 
  Settings, 
  LogOut, 
  BarChart3, 
  User as UserIcon, 
  ChevronDown 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import EditProfileModal from '../../components/modals/EditProfileModal';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-slate-50 p-6 md:p-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-200">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Boarding Owner
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{currentUserData?.name || 'Owner'}</span>.
          </p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">
              {currentUserData?.name?.[0] || 'O'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none mb-1">{currentUserData?.name || 'Owner'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Property Manager</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-50 p-2 z-[100]"
              >
                <button 
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-amber-600"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">Edit Profile</span>
                </button>
                <div className="h-px bg-slate-50 my-1"></div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-bold">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={currentUserData}
        onUpdate={(updated) => setCurrentUserData(updated)}
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'My Properties', value: '—', icon: Home, color: 'bg-amber-600', shadow: 'shadow-amber-200' },
          { label: 'Active Bookings', value: '—', icon: Building, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
          { label: 'Revenue', value: '—', icon: BarChart3, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${stat.shadow}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-amber-50 hover:border-amber-200 border border-slate-100 transition-all group">
            <Plus className="w-6 h-6 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Add New Property</p>
            <p className="text-xs text-slate-500 mt-1">List a new boarding place</p>
          </button>
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group">
            <Settings className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Manage Properties</p>
            <p className="text-xs text-slate-500 mt-1">Edit or remove existing listings</p>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OwnerDashboard;
