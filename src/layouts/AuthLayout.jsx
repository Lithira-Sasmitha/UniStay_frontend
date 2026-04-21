import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* ─── LEFT PANEL (Marketing) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#081121] relative overflow-hidden p-16 flex-col justify-between select-none">
        {/* Background Accents / Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
        
        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/40">
            <Home className="text-white w-6 h-6" />
          </div>
          <span className="text-white text-3xl font-black tracking-tight">
            UNISTAY<span className="text-primary-500 text-5xl leading-[0]">.</span>
          </span>
        </div>

        {/* Branding Content */}
        <div className="relative z-10 max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-7xl font-black mb-8 leading-[1.05] tracking-tight"
          >
            Find your <br />
            <span className="text-primary-400">perfect stay.</span>
          </motion.h1>
          <p className="text-xl font-medium leading-relaxed mb-12 text-slate-400">
            Sri Lanka's most advanced student housing network. Designed for students, trusted by hosts.
          </p>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="text-4xl font-black text-white mb-2 tracking-tight">100%</div>
              <div className="text-primary-500 text-xs font-black tracking-[0.2em] uppercase">Verified Stays</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2 tracking-tight">12k+</div>
              <div className="text-primary-500 text-xs font-black tracking-[0.2em] uppercase">Monthly Users</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-500 text-sm font-medium">
          © {new Date().getFullYear()} UniStay Advanced Platform
        </div>
      </div>

      {/* ─── RIGHT PANEL (Content) ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center p-8 md:p-12 lg:p-20 overflow-y-auto max-h-screen custom-scrollbar relative bg-white">
        <div className="w-full max-w-[620px] mx-auto animate-in fade-in slide-in-from-right-5 duration-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
