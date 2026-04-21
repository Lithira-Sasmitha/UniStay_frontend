import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Home,
  Star,
  Zap,
  LayoutGrid,
  List as ListIcon,
  ChevronDown
} from 'lucide-react';
import Button from '../../components/common/Button';
import BoardingCard from '../../components/cards/BoardingCard';
import { cn } from '../../utils/cn';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          const mockListings = [
            { id: 1, title: 'Premium Girl\'s Hostel', location: 'Homagama', price: 15000, rating: 4.8, capacity: 4, type: 'Hostel', imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' },
            { id: 2, title: 'Modern Studio Apartment', location: 'Nugegoda', price: 45000, rating: 4.5, capacity: 1, type: 'Apartment', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' },
            { id: 3, title: 'Boys Shared Room', location: 'Malabe', price: 12000, rating: 4.2, capacity: 2, type: 'Room', imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80' },
            { id: 4, title: 'Luxury Villa Room', location: 'Mount Lavinia', price: 65000, rating: 5.0, capacity: 1, type: 'Villa', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1380&q=80' },
            { id: 5, title: 'University Annex', location: 'Kelaniya', price: 18000, rating: 4.0, capacity: 3, type: 'Annex', imageUrl: 'https://images.unsplash.com/photo-1626808642875-0aa54545298c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80' },
            { id: 6, title: 'Cozy Shared Space', location: 'Kandy', price: 14500, rating: 4.4, capacity: 4, type: 'Shared', imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' },
            { id: 7, title: 'Elite Student Residency', location: 'Colombo 03', price: 35000, rating: 4.9, capacity: 2, type: 'Apartment', imageUrl: 'https://images.unsplash.com/photo-1536376074432-bf424210c41b?auto=format&fit=crop&w=600&q=80' },
            { id: 8, title: 'Budget Friendly Annex', location: 'Moratuwa', price: 10500, rating: 3.8, capacity: 5, type: 'Annex', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80' },
          ];
          setListings(mockListings);
          setLoading(false);
        }, 1200);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleAction = (id) => console.log('Viewing listing:', id);
  const handleDelete = (id) => console.log('Deleting listing:', id);

  const filteredListings = listings.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(item => filterType === 'All' || item.type === filterType);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 pb-20"
    >
      {/* Search & Header Section */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="flex flex-col gap-4">
            <motion.p 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="text-primary-600 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Real Estate Explorer
            </motion.p>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Find your <span className="text-primary-600">perfect</span> stay.
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
              Curated housing experiences for students who want a home away from home.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="primary" size="lg" className="rounded-[24px] font-black shadow-3xl shadow-primary-500/20 py-5 group" icon={Plus}>
              List Your Property
            </Button>
          </motion.div>
        </div>

        {/* Dynamic Search & Bar */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="flex-1 w-full glass bg-white/80 p-2 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 transition-all focus-within:ring-4 focus-within:ring-primary-500/5 focus-within:border-primary-500/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xl shadow-slate-900/40">
               <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Where do you want to stay? Search by city or university..."
              className="w-full bg-transparent border-none py-3 pr-6 text-base font-bold outline-none placeholder:text-slate-400 placeholder:font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
          
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 px-2 scroll-smooth">
             <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setViewMode('list')}
                   className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
             </div>
             
             <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[22px] text-sm font-black border border-slate-100 shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all whitespace-nowrap active:scale-95">
                <Filter className="w-4 h-4 text-primary-500" />
                Sort By: Recent
                <ChevronDown className="w-4 h-4 opacity-40 ml-2" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-auto pb-2 px-1 scroll-smooth">
             {['All', 'Hostel', 'Apartment', 'Room', 'Annex', 'Villa'].map((type, idx) => (
               <motion.button
                 key={type}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => setFilterType(type)}
                 className={cn(`px-8 py-3.5 rounded-[22px] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap active:scale-95 border-2`, 
                   filterType === type 
                     ? 'bg-primary-600 text-white border-primary-600 shadow-2xl shadow-primary-300' 
                     : 'bg-white text-slate-400 border-slate-50 hover:border-primary-100 hover:text-primary-600 hover:bg-primary-50/30'
                 )}
               >
                 {type}
               </motion.button>
             ))}
          </div>
      </section>

      {/* Grid Display */}
      <section className="relative min-h-[500px]">
        <AnimatePresence mode='wait'>
          {loading ? (
             <motion.div 
               key="loader"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 flex flex-col items-center justify-center"
             >
                <div className="relative group">
                   <div className="w-24 h-24 border-8 border-primary-100 border-t-primary-600 rounded-[35px] animate-spin mb-6 shadow-3xl shadow-primary-100/50 transform group-hover:scale-110 transition-transform"></div>
                   <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-600 animate-pulse" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Scanning Premium Stays...</p>
             </motion.div>
          ) : (
            <motion.div 
               key="grid"
               initial="hidden"
               animate="show"
               variants={{
                 show: { transition: { staggerChildren: 0.1 } }
               }}
               className={cn("grid gap-10", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}
            >
              {filteredListings.length > 0 ? (
                filteredListings.map(listing => (
                  <BoardingCard
                    key={listing.id}
                    property={listing}
                    onActionClick={handleAction}
                    onDeleteClick={handleDelete}
                    isAdmin={true}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                   <div className="w-32 h-32 bg-slate-50 rounded-[50px] flex items-center justify-center mb-8 border border-white shadow-inner transform -rotate-12">
                      <Search className="w-12 h-12 text-slate-300" />
                   </div>
                   <h4 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">No stays found.</h4>
                   <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
                      We couldn't find anything matching your search. Try adjusting your filters or search terms.
                   </p>
                   <Button variant="secondary" className="px-12 py-5 rounded-[22px] border-2 shadow-2xl shadow-slate-100" onClick={() => {setSearchTerm(''); setFilterType('All');}}>
                      Reset Filters
                   </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
};

export default Listings;
