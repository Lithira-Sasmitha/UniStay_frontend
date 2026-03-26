import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, List, X, ChevronRight, Sparkles, Building, PlusCircle, Shield } from 'lucide-react';
import { ROUTES, ROLES } from '../../utils/constants';
import { cn } from '../../utils/cn';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const getMenuItems = () => {
    const items = [];

    // Dashboard — role-specific
    if (role === ROLES.SUPER_ADMIN) {
      items.push({ name: 'Control Center', icon: Shield, path: ROUTES.ADMIN_DASHBOARD });
      items.push({ name: 'Safety Monitoring', icon: Shield, path: '/admin/safety' });
    } else if (role === ROLES.BOARDING_OWNER) {
      items.push({ name: 'Dashboard', icon: LayoutDashboard, path: ROUTES.OWNER_DASHBOARD });
      items.push({ name: 'Safety Monitoring', icon: Shield, path: '/owner/incidents' });
    } else if (role === ROLES.STUDENT) {
      items.push({ name: 'Dashboard', icon: LayoutDashboard, path: ROUTES.STUDENT_DASHBOARD });
      items.push({ name: 'My Incidents', icon: Shield, path: '/student/incidents' });
    }

    // Browse Listings — everyone
    items.push({ name: 'Browse Listings', icon: List, path: ROUTES.LISTINGS });

    // Owner-specific
    if (role === ROLES.BOARDING_OWNER) {
      items.push({ name: 'Create Listing', icon: PlusCircle, path: ROUTES.CREATE_LISTING });
    }

    // Admin-specific
    if (role === ROLES.SUPER_ADMIN) {
      items.push({ name: 'All Properties', icon: Building, path: ROUTES.LISTINGS });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const NavItem = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <NavLink
        to={item.path}
        onClick={onClose}
        className={({ isActive }) => cn(`
          relative flex items-center gap-4 px-6 py-4 rounded-[24px] text-sm font-black transition-all duration-300 group
          ${isActive
            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300/50'
            : 'text-slate-500 hover:bg-primary-50 hover:text-primary-700 hover:translate-x-1'}
        `)}
      >
        {({ isActive }) => (
          <>
            <item.icon className={cn(`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`)} />
            <span className="tracking-tight">{item.name}</span>
            {isActive ? (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 bg-primary-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.8)]"
              />
            ) : (
              <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {/* Backdrop for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen || window.innerWidth >= 1024 ? "open" : "closed"}
        className={cn(`
          fixed inset-y-0 left-0 z-50 w-80 h-screen bg-white transform border-r border-slate-100 shadow-2xl transition-none
          lg:translate-x-0
        `)}
      >
        <div className="flex flex-col h-full px-8 py-10 relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 select-none"></div>

          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">UniStay</h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-3 text-slate-500 hover:bg-slate-50 rounded-2xl active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar relative z-10">
            {menuItems.map((item, idx) => (
              <NavItem key={item.name} item={item} index={idx} />
            ))}
          </nav>

          {/* Sidebar Footer — Branding */}
          <div className="mt-auto pt-10 relative z-10">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                UniStay &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default Sidebar;
