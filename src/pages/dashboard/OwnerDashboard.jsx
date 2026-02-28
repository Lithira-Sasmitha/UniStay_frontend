import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building, Plus, Settings, LogOut, BarChart3 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const OwnerDashboard = () => {
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
            Welcome, <span className="text-slate-800 font-bold">{user?.name || 'Owner'}</span>. Manage your properties and bookings.
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
