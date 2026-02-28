import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, UserCog, Trash2, LogOut, BarChart3, Activity } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
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
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Admin Control Panel
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Welcome, <span className="text-slate-800 font-bold">{user?.name || 'Admin'}</span>. You have full system access.
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
          { label: 'Total Users', value: '—', icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
          { label: 'Boarding Owners', value: '—', icon: UserCog, color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
          { label: 'Platform Activity', value: 'Live', icon: Activity, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-blue-50 hover:border-blue-200 border border-slate-100 transition-all group">
            <UserCog className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Manage Roles</p>
            <p className="text-xs text-slate-500 mt-1">Change user roles system-wide</p>
          </button>
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-red-50 hover:border-red-200 border border-slate-100 transition-all group">
            <Trash2 className="w-6 h-6 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">Delete Users</p>
            <p className="text-xs text-slate-500 mt-1">Remove accounts from the platform</p>
          </button>
          <button className="p-6 bg-slate-50 rounded-2xl text-left hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all group">
            <BarChart3 className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-slate-900">View Analytics</p>
            <p className="text-xs text-slate-500 mt-1">Platform usage statistics</p>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
