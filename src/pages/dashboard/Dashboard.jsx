import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  TrendingUp, 
  MapPin, 
  Star, 
  Plus, 
  Calendar,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Search,
  Zap,
  Box
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { cn } from '../../utils/cn';

const Dashboard = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const stats = [
    { name: 'Total Bookings', value: '1,280', change: '+12.5%', icon: Calendar, color: 'bg-blue-600', trend: 'up' },
    { name: 'Active Listings', value: '432', change: '+5.2%', icon: Home, color: 'bg-indigo-600', trend: 'up' },
    { name: 'New Reviews', value: '24', change: '-2.1%', icon: Star, color: 'bg-amber-500', trend: 'down' },
    { name: 'Total Users', value: '8.5k', change: '+18.7%', icon: Users, color: 'bg-slate-900', trend: 'up' },
  ];

  const recentListings = [
    { title: 'Modern Studio Apartment', location: 'Colombo 07', price: '45,000', rating: 4.8, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=150&q=80' },
    { title: 'Shared Dormitory', location: 'Nugegoda', price: '12,500', rating: 4.3, img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=150&q=80' },
    { title: 'Luxury Penthouse Room', location: 'Mount Lavinia', price: '65,000', rating: 5.0, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=150&q=80' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12 pb-20"
    >
      {/* Dynamic Header */}
      <motion.section variants={itemVariants} className="relative overflow-hidden p-10 md:p-14 rounded-[50px] bg-white border border-slate-100 shadow-2xl shadow-slate-200 group">
         {/* Background Orbs */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 select-none group-hover:scale-125 transition-transform duration-1000"></div>
         
         <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div className="flex flex-col gap-5 text-center md:text-left">
               <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]"
                >
                 <Zap className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
                 Smart Management
               </motion.div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                 Your <span className="text-primary-600">UniStay</span><br className="hidden md:block"/> Command Center.
               </h2>
               <p className="text-slate-500 font-medium text-lg md:text-xl max-w-xl leading-relaxed">
                 Welcome back, {user?.name || 'Explorer'}. Here's what's happening with your student bookings today.
               </p>
            </div>
            <div className="flex-shrink-0 animate-bounce transition-all duration-1000">
               <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-600 rounded-[35px] flex items-center justify-center text-white shadow-3xl shadow-primary-500/40 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <Box className="w-12 h-12 md:w-16 md:h-16" />
               </div>
            </div>
         </div>
      </motion.section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-10 transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full select-none group-hover:scale-150 transition-transform duration-700"></div>
             
             <div className="flex items-center justify-between relative z-10">
                <div className={cn(stat.color, "p-4 rounded-[24px] text-white shadow-2xl shadow-current group-hover:rotate-12 transition-transform duration-500")}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <div className={cn(`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`)}>
                   {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                   {stat.change}
                </div>
             </div>
             <div className="relative z-10">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{stat.name}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    {stat.trend === 'up' && <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />}
                </div>
             </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Activity */}
        <motion.section variants={itemVariants} className="lg:col-span-2 flex flex-col gap-8">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                 Top Performing
                 <span className="w-3 h-3 bg-primary-500 rounded-full animate-ping"></span>
              </h3>
              <Button variant="secondary" className="rounded-2xl group text-xs font-black uppercase tracking-widest">
                Analytics <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
           </div>
           
           <div className="flex flex-col gap-5">
              {recentListings.map((listing, idx) => (
                <motion.div 
                   key={idx}
                   whileHover={{ x: 10, backgroundColor: "#ffffff" }}
                   className="p-6 rounded-[32px] border border-slate-100 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-100/30 transition-all duration-300 flex items-center gap-6 group cursor-pointer"
                >
                   <div className="w-24 h-24 rounded-[22px] overflow-hidden flex-shrink-0 shadow-lg group-hover:rotate-3 transition-transform duration-500 border-4 border-white">
                      <img src={listing.img} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none">{listing.title}</h4>
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 rounded-lg text-xs font-black text-amber-600 py-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {listing.rating}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400 font-bold mb-4">
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                         {listing.location}
                      </div>
                      <div className="flex items-center gap-8">
                          <div className="flex flex-col">
                             <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Revenue</span>
                             <span className="text-primary-600 font-black text-lg">LKR {listing.price}</span>
                          </div>
                      </div>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                      <ChevronRight className="w-6 h-6" />
                   </div>
                </motion.div>
              ))}
           </div>
        </motion.section>

        {/* Action Sidebar */}
        <motion.section variants={itemVariants} className="flex flex-col gap-10">
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">Growth Hub</h3>
           
           <div className="bg-gradient-to-br from-indigo-700 via-primary-600 to-indigo-900 p-10 rounded-[50px] text-white flex flex-col gap-10 shadow-3xl shadow-primary-900/40 relative overflow-hidden group">
              {/* Floating icon */}
              <div className="absolute top-10 right-10 opacity-20 group-hover:rotate-12 group-hover:scale-150 transition-transform duration-1000">
                 <Sparkles className="w-24 h-24" />
              </div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl select-none"></div>

              <div className="relative z-10 flex flex-col gap-4">
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-[20px] flex items-center justify-center border border-white/20 shadow-2xl">
                    <TrendingUp className="w-7 h-7" />
                 </div>
                 <h4 className="text-3xl font-black leading-tight tracking-tight">Expand Your Portfolio</h4>
                 <p className="text-white/70 text-base font-medium leading-relaxed">Hosts with 3+ listings see 40% higher booking rates in the first month.</p>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                 <button className="bg-white text-slate-900 py-5 rounded-[24px] text-sm font-black flex items-center justify-center gap-3 hover:bg-primary-50 active:scale-95 transition-all shadow-2xl shadow-slate-900/50 group/action">
                    Post New Listing
                    <Plus className="w-5 h-5 transition-transform group-hover/action:rotate-90" />
                 </button>
                 <button className="bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white py-4 rounded-[22px] text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900/60 active:scale-95 transition-all">
                    View Market Trends
                 </button>
              </div>
           </div>

           {/* Mini Card */}
           <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-xl shadow-slate-200/50 flex items-center gap-6 overflow-hidden relative group">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                 <Calendar className="w-8 h-8" />
              </div>
              <div className="flex-1">
                 <h5 className="font-black text-slate-900 tracking-tight leading-none mb-2">Next Sync</h5>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tomorrow, 09:00 AM</p>
              </div>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-3 h-3 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.8)]"></motion.div>
           </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Dashboard;
