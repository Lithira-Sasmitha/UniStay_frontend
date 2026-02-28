import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-primary-100 selection:text-primary-800">
      <Navbar onMenuClick={toggleSidebar} />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Fixed Desktop Sidebar, absolute mobile sidebar */}
        <div className="hidden lg:block w-72 h-full flex-shrink-0 transition-all duration-500 ease-in-out">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
        
        {/* Moble Sidebar Component handling its own state */}
        <div className="lg:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Outlet />
          </div>
          
          <footer className="mt-auto py-12 border-t border-slate-200/60 transition-all duration-300 opacity-60">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm font-medium text-slate-500 tracking-tight">
                © {new Date().getFullYear()} <span className="text-primary-600 font-bold">UniStay</span> Student Booking Platform. All rights reserved.
              </p>
              <div className="flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary-500 transition-colors">Contact Us</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
