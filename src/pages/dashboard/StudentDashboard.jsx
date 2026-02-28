import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Search, Heart, Calendar, LogOut, MapPin } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

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
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Student
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{user?.name || 'Student'}</span>. Find your perfect stay.
          </p>
        </div>
        <Button
          onClick={logout}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Saved Listings', value: '—', icon: Heart, color: 'bg-pink-600', shadow: 'shadow-pink-200' },
          { label: 'My Bookings', value: '—', icon: Calendar, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
          { label: 'Nearby Places', value: '—', icon: MapPin, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
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
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-primary-50 hover:border-primary-200 border border-slate-100 transition-all group">
            <Search className="w-6 h-6 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Browse Listings</p>
            <p className="text-xs text-slate-500 mt-1">Find boarding places near your university</p>
          </button>
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-pink-50 hover:border-pink-200 border border-slate-100 transition-all group">
            <Heart className="w-6 h-6 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">My Favorites</p>
            <p className="text-xs text-slate-500 mt-1">View your saved boarding places</p>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
