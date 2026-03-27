import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileText, ShieldAlert, TrendingUp } from 'lucide-react';

const trendData = [
  { month: 'Jan', total: 12, highSeverity: 2 },
  { month: 'Feb', total: 19, highSeverity: 4 },
  { month: 'Mar', total: 15, highSeverity: 3 },
  { month: 'Apr', total: 22, highSeverity: 7 },
  { month: 'May', total: 18, highSeverity: 2 },
  { month: 'Jun', total: 25, highSeverity: 8 },
  { month: 'Jul', total: 20, highSeverity: 5 },
  { month: 'Aug', total: 14, highSeverity: 1 },
];

const riskyProperties = [
  { id: 1, name: 'Sunset Apartment Complex', incidents: 14 },
  { id: 2, name: 'Greenville Student Housing', incidents: 9 },
  { id: 3, name: 'Downtown Annex', incidents: 7 },
  { id: 4, name: 'University Edge', incidents: 6 },
  { id: 5, name: 'Pine View Boarding', incidents: 4 },
];

export default function SafetyAnalyticsDashboard() {
  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-800">
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
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Incidents</p>
                <h3 className="text-4xl font-black text-slate-800">145</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Open Cases</p>
                <h3 className="text-4xl font-black text-slate-800">24</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10"></div>
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">High Severity Incidents</p>
                <h3 className="text-4xl font-black text-red-600">32</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-100">
           <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Incident Trend Over Time</h2>
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
                       border: 'none', 
                       boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                       padding: '12px 16px',
                       fontWeight: 'bold'
                     }}
                     cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Legend 
                     iconType="circle" 
                     wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Incidents" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="highSeverity" 
                    name="High Severity" 
                    stroke="#ef4444" 
                    strokeWidth={4}
                    dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Bottom Section - Risky Properties */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-100">
           <h2 className="text-xl font-bold text-slate-800 mb-6">Top Risky Properties</h2>
           <div className="flex flex-col space-y-3">
              {riskyProperties.map((property, index) => (
                 <div 
                   key={property.id} 
                   className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-sm shadow-inner">
                          #{index + 1}
                       </div>
                       <h4 className="font-semibold text-slate-700 text-lg">{property.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                       <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Incidents</span>
                       <span className={`font-black text-xl ${property.incidents >= 10 ? 'text-red-500' : property.incidents >= 6 ? 'text-orange-500' : 'text-slate-700'}`}>
                          {property.incidents}
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
