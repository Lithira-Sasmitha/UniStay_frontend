import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Dynamic Branding Side (Left Side) - Premium Dark Mode */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 px-16 lg:px-24 pt-12 relative overflow-hidden select-none border-r border-white/5">
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-slate-900 to-indigo-950 opacity-90"></div>
        
        <div className="max-w-xl relative z-10 animate-in fade-in slide-in-from-left-10 duration-1000 text-left">
           <div className="mb-10 inline-flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <Home className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">UniStay<span className="text-primary-500">.</span></h2>
           </div>
           
           <h1 className="text-5xl lg:text-8xl font-black text-white leading-[1] mb-8 tracking-tighter">
             Find your <br/>
             <span className="text-primary-400">perfect</span> stay.
           </h1>
           
           <p className="text-xl text-slate-400 font-medium leading-relaxed mb-16 max-w-md">
             Sri Lanka's most advanced student housing network. Designed for students, trusted by hosts.
           </p>
           
           <div className="grid grid-cols-2 gap-12 justify-items-start">
              <div className="flex flex-col gap-3">
                 <span className="text-4xl font-black text-white">100%</span>
                 <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] opacity-80">Verified Stays</span>
              </div>
              <div className="flex flex-col gap-3">
                 <span className="text-4xl font-black text-white">12k+</span>
                 <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] opacity-80">Monthly Users</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Auth Form Area (Right Side) */}
      <div className="flex-1 flex flex-col items-center px-6 pt-12 relative bg-white overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-right-5 duration-700 pb-20">
          <Outlet />
          
          <div className="mt-16 pt-10 border-t border-slate-50 flex justify-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} UniStay Advanced Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
