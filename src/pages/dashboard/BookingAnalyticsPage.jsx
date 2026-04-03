import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Home,
  ArrowLeft,
  Loader2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getStudentBookings } from '../../services/bookingService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const BookingAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalSpent: 0,
    mostPreferredRoom: 'N/A',
  });

  const [statusData, setStatusData] = useState([]);
  const [roomTypeData, setRoomTypeData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getStudentBookings();
      const bookings = res.data?.data || [];
      processData(bookings);
    } catch (err) {
      console.error('Error fetching bookings API:', err);
      // Fallback inside error boundary, or use a toast
      setError(err.response?.data?.message || 'Failed to load booking analytics.');
    } finally {
      setLoading(false);
    }
  };

  const processData = (bookings) => {
    const totalBookings = bookings.length;
    let totalSpent = 0;
    const roomTypeCounts = {};
    const statusCounts = {};

    bookings.forEach((b) => {
      // Money spent via advance paid or fully confirmed
      if (b.advancePaid || b.status === 'confirmed') {
        const amount = b.room?.advanceAmount || 0;
        totalSpent += amount;
      }

      // Room Type
      if (b.room?.roomType) {
        roomTypeCounts[b.room.roomType] = (roomTypeCounts[b.room.roomType] || 0) + 1;
      } else {
        roomTypeCounts['Unknown'] = (roomTypeCounts['Unknown'] || 0) + 1;
      }

      // Status
      const st = b.status || 'unknown';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    let mostPreferredRoom = 'N/A';
    let maxCount = 0;
    Object.keys(roomTypeCounts).forEach((type) => {
      if (roomTypeCounts[type] > maxCount) {
        maxCount = roomTypeCounts[type];
        mostPreferredRoom = type;
      }
    });

    setMetrics({
      totalBookings,
      totalSpent,
      mostPreferredRoom,
    });

    setStatusData(Object.keys(statusCounts).map((key) => ({ name: key, value: statusCounts[key] })));
    setRoomTypeData(Object.keys(roomTypeCounts).map((key) => ({ name: key, value: roomTypeCounts[key] })));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
          <p className="font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-sm font-medium hover:bg-red-200">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 text-slate-600 rounded-full transition-colors bg-white shadow-sm border border-slate-200"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Booking Analytics</h1>
            <p className="text-slate-500">Insights into your historical bookings and spending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-slate-800">{metrics.totalBookings}</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Spent</p>
              <h3 className="text-2xl font-bold text-slate-800">
                Rs. {metrics.totalSpent.toLocaleString()}
              </h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Preferred Room Type</p>
              <h3 className="text-xl font-bold text-slate-800 capitalize truncate" title={metrics.mostPreferredRoom}>
                {metrics.mostPreferredRoom}
              </h3>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-700">Room Types Booked</h2>
            </div>
            {roomTypeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No Data Available</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {roomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-700">Booking Status Breakdown</h2>
            </div>
            {statusData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No Data Available</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={80} style={{ textTransform: 'capitalize' }} tick={{ fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingAnalyticsPage;