import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { ChevronRight } from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleDesktop = () => setIsDesktopCollapsed(!isDesktopCollapsed);

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-primary-100 selection:text-primary-800">
      <Navbar onMenuClick={toggleSidebar} />
      
      <div className="flex pt-16 h-screen overflow-hidden relative">
        {/* Floating Toggle Button for when desktop sidebar is hidden */}
        <button 
          onClick={toggleDesktop}
          className={`hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-slate-200 border-l-0 rounded-r-xl items-center justify-center text-slate-400 hover:text-primary-600 shadow-md cursor-pointer z-[60] transition-all duration-500 ease-in-out ${
            isDesktopCollapsed ? 'translate-x-0' : '-translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Fixed Desktop Sidebar Spacer */}
        <div className={`hidden lg:block ${isDesktopCollapsed ? 'w-0 opacity-0 relative z-[-1]' : 'w-80'} h-full flex-shrink-0 transition-all duration-500 ease-in-out`}>
          <Sidebar isOpen={true} onClose={() => {}} toggleDesktop={toggleDesktop} isDesktopCollapsed={isDesktopCollapsed} />
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
          
          <footer className="mt-auto py-8 border-t border-slate-200/60 transition-all duration-300 opacity-60">
            <p className="text-center text-sm font-medium text-slate-500 tracking-tight">
              © {new Date().getFullYear()} <span className="text-primary-600 font-bold">UniStay</span> — Student Boarding Platform
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
