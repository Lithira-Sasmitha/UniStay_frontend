import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Bell,
  BarChart3,
  ListTodo,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// A clean, standard SaaS Admin Dashboard for Safety Incidents
const SafetyControlCenter = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents');
        setIncidents(response.data.success ? response.data.data : response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  // Compute key metrics
  const metrics = useMemo(() => {
    if (!incidents) return { total: 0, high: 0, resolved: 0, open: 0 };
    return {
      total: incidents.length,
      high: incidents.filter(i => i.severity === 'High').length,
      resolved: incidents.filter(i => i.status === 'Resolved').length,
      open: incidents.filter(i => i.status === 'Open' || i.status === 'Under Investigation').length,
    };
  }, [incidents]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const glassCard = "bg-white border border-slate-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1400px] mx-auto space-y-8"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Safety Overview</h1>
            </div>
            <p className="text-slate-500 font-medium">Monitor, analyze, and resolve reported incidents across all properties.</p>
          </div>
          <button 
            onClick={() => window.location.href='/admin/safety'}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <ListTodo className="w-4 h-4" />
            Manage Incidents
          </button>
        </motion.div>

        {/* Top KPIs Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={glassCard}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">Total Reports</h3>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Activity className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black text-slate-900">{metrics.total}</div>
            <p className="text-xs text-slate-400 mt-2">Lifetime incidents tracked</p>
          </div>

          <div className={glassCard}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">Action Required (Open)</h3>
              <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black text-amber-600">{metrics.open}</div>
            <p className="text-xs text-slate-400 mt-2">Pending investigation or review</p>
          </div>

          <div className={glassCard}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">High Severity</h3>
              <div className="bg-red-50 text-red-600 p-2 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black text-red-600">{metrics.high}</div>
            <p className="text-xs text-slate-400 mt-2">Critical issues requiring immediate action</p>
          </div>

          <div className={glassCard}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">Resolved</h3>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black text-emerald-600">{metrics.resolved}</div>
            <p className="text-xs text-slate-400 mt-2">Successfully closed tickets</p>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recent Incidents List (Takes up 2/3 width) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className={glassCard}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b-2 border-indigo-500 pb-1 inline-block">Recent Open Incidents</h2>
                </div>
                <button 
                  onClick={() => window.location.href='/admin/safety'}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {incidents.filter(i => i.status !== 'Resolved').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400 opacity-50" />
                  <p>No open incidents at the moment. System is clear.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents
                    .filter(i => i.status !== 'Resolved')
                    .slice(0, 5) // Show top 5 recent
                    .map(inc => (
                      <div key={inc._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            inc.severity === 'High' ? 'bg-red-500' : 
                            inc.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{inc.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inc.property?.name || 'Property'}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(inc.createdAt).toLocaleDateString()}</span>
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{inc.category}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          inc.status === 'Open' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* System Audit Recommendations */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
               <div className="flex items-center gap-3 mb-4 text-indigo-800">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Automated Analysis & Recommendations</h3>
               </div>
               <p className="text-indigo-900/80 text-sm leading-relaxed mb-4">
                 Based on the recent influx of reports, the system suggests taking proactive measures.
               </p>
               <ul className="space-y-3">
                 {metrics.high > 0 && (
                   <li className="flex items-start gap-2 text-sm text-indigo-900">
                     <span className="bg-red-100 text-red-600 p-1 rounded"><AlertTriangle className="w-3 h-3" /></span>
                     <span><strong>Critical Action Needed:</strong> You have {metrics.high} high-severity incidents. Prioritize resolution for these cases to comply with safety policies.</span>
                   </li>
                 )}
                 {metrics.open > 5 && (
                   <li className="flex items-start gap-2 text-sm text-indigo-900">
                     <span className="bg-amber-100 text-amber-600 p-1 rounded"><Bell className="w-3 h-3" /></span>
                     <span><strong>Backlog Warning:</strong> Pending investigations are piling up. Consider assigning additional staff to review open tickets.</span>
                   </li>
                 )}
                 {metrics.high === 0 && metrics.open <= 5 && (
                   <li className="flex items-start gap-2 text-sm text-indigo-900">
                     <span className="bg-emerald-100 text-emerald-600 p-1 rounded"><CheckCircle2 className="w-3 h-3" /></span>
                     <span><strong>Status Nominal:</strong> Incident rates are within normal operational limits. Continue standard monitoring.</span>
                   </li>
                 )}
               </ul>
            </div>
          </motion.div>

          {/* Right Column: Breakdown & Quick Actions (Takes up 1/3 width) */}
          <motion.div variants={itemVariants} className="space-y-8">
             
            {/* Category Breakdown (Simulated Bar representation) */}
            <div className={glassCard}>
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Category Breakdown
              </h3>
              
              {(() => {
                const categories = { 'Theft': 0, 'Harassment': 0, 'Infrastructure': 0, 'Other': 0 };
                incidents.forEach(i => { if(categories[i.category] !== undefined) categories[i.category]++; });
                const max = Math.max(...Object.values(categories), 1); // prevent div by zero
                
                return Object.entries(categories).map(([cat, count]) => (
                  <div key={cat} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          cat === 'Theft' ? 'bg-red-400' : 
                          cat === 'Harassment' ? 'bg-orange-400' : 
                          cat === 'Infrastructure' ? 'bg-blue-400' : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>


          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default SafetyControlCenter;
