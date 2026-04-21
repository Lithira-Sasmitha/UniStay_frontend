import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Heart, Trash2, Edit, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

const BoardingCard = ({ 
  property, 
  onActionClick, 
  onDeleteClick, 
  isAdmin = false 
}) => {
  const { 
    id, 
    title, 
    location, 
    price, 
    rating, 
    imageUrl, 
    capacity, 
    type 
  } = property;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative bg-white border border-slate-100/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-500"
    >
      {/* Property Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={imageUrl || 'https://via.placeholder.com/640x400?text=UniStay+Booking'} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-10">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/50"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white shadow-lg border border-white/20 uppercase tracking-widest">
            {type}
          </span>
        </div>
        
        {isAdmin && (
          <div className="absolute bottom-4 right-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <button 
              onClick={() => onActionClick(id)}
              className="p-2.5 bg-white/70 backdrop-blur-md text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white shadow-xl border border-white/20"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDeleteClick(id)}
              className="p-2.5 bg-white/70 backdrop-blur-md text-red-600 rounded-2xl hover:bg-red-600 hover:text-white shadow-xl border border-white/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-slate-800 text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100 shadow-sm shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <div className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-slate-50 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Monthly Rent</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">LKR {price.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-bold">/mo</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-black text-slate-600">{capacity}</span>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onActionClick(id)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-primary-600 transition-colors group/btn"
        >
          View Full Detail
          <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BoardingCard;
