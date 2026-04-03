import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileText, ShieldAlert, TrendingUp, Loader2 } from 'lucide-react';
import incidentService from '../../services/incidentService';
import Toast from '../../components/common/Toast';

export default function SafetyAnalyticsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await incidentService.getIncidents();
      setIncidents(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch safety analytics data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const { stats, trendData, riskyProperties } = useMemo(() => {
    let openCount = 0;
    let highCount = 0;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = {};
    monthNames.forEach(m => monthCounts[m] = { month: m, total: 0, highSeverity: 0 });

    const propertyCounts = {};

    incidents.forEach(inc => {
      // Basic stats
      if (inc.status?.toLowerCase() === 'open') openCount++;
      if (inc.severity?.toLowerCase() === 'high') highCount++;

      // Monthly Trend
      const d = inc.createdAt ? new Date(inc.createdAt) : null;
      if (d && !isNaN(d.getTime())) {
        const monthStr = monthNames[d.getMonth()];
        monthCounts[monthStr].total++;
        if (inc.severity?.toLowerCase() === 'high') {
          monthCounts[monthStr].highSeverity++;
        }
      }

      // Risky Properties
      const property = inc.property;
      if (property) {
        const propId = property._id || property;
        const propName = property.name || 'Unknown Property';
        if (!propertyCounts[propId]) {
          propertyCounts[propId] = { id: propId, name: propName, incidents: 0 };
        }
        propertyCounts[propId].incidents++;
      }
    });

    const topProperties = Object.values(propertyCounts)
      .sort((a, b) => b.incidents - a.incidents)
      .slice(0, 5);

    const trendArray = monthNames.map(m => monthCounts[m]);

    return {
      stats: { total: incidents.length, openCases: openCount, highSeverity: highCount },
      trendData: trendArray,
      riskyProperties: topProperties,
    };
  }, [incidents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-700 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Safety Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-lg">
            Analyze incident trends and safety performance
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Incidents</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Open Cases</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.openCases}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-6 shadow-sm border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full -z-10"></div>
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <p className="text-sm font-semibold text-rose-600 uppercase tracking-wider mb-2">High Severity Incidents</p>
                <h3 className="text-4xl font-black text-rose-700">{stats.highSeverity}</h3>
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Trend Over Time</h2>
           </div>
           
           <div className="w-full h-[450px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                    dx={-10} 
                  />
                  <Tooltip 
                     contentStyle={{ 
                       borderRadius: '12px', 
                       border: '1px solid #e2e8f0', 
                       backgroundColor: '#ffffff',
                       color: '#0f172a',
                       padding: '12px 16px',
                       fontWeight: 'bold',
                       boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                     }}
                     itemStyle={{ color: '#475569' }}
                     cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Legend 
                     iconType="circle" 
                     wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600, color: '#475569' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Incidents" 
                    stroke="#4f46e5" 
                    strokeWidth={4}
                    dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="highSeverity" 
                    name="High Severity" 
                    stroke="#f43f5e" 
                    strokeWidth={4}
                    dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#f43f5e', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Bottom Section - Risky Properties */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
           <h2 className="text-xl font-bold text-slate-900 mb-6">Top Risky Properties</h2>
           <div className="flex flex-col space-y-3">
              {riskyProperties.length === 0 ? (
                 <div className="text-center py-8 text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                   No incidents reported yet.
                 </div>
              ) : (
                riskyProperties.map((property, index) => (
                 <div 
                   key={property.id} 
                   className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 font-extrabold text-sm shadow-sm border border-slate-200">
                          #{index + 1}
                       </div>
                       <h4 className="font-semibold text-slate-800 text-lg">{property.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                       <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incidents</span>
                       <span className={`font-black text-xl ${property.incidents >= 10 ? 'text-rose-600' : property.incidents >= 6 ? 'text-amber-600' : 'text-indigo-600'}`}>
                          {property.incidents}
                       </span>
                    </div>
                 </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
