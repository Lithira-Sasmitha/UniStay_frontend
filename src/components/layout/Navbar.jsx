import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Search, Home, Heart, Settings } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROLE_DASHBOARD_MAP, ROUTES } from '../../utils/constants';

const Navbar = ({ onMenuClick, onOpenProfile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.LISTINGS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogoClick = () => {
    const dashboard = user ? ROLE_DASHBOARD_MAP[user.role] : ROUTES.LOGIN;
    navigate(dashboard || ROUTES.LOGIN);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100/50 rounded-xl transition-all active:scale-95"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div onClick={handleLogoClick} className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight transition-colors group-hover:text-primary-700">
                <span className="text-primary-600">Uni</span>Stay
              </h1>
            </div>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for boarding places..."
                className="w-full bg-gray-100/50 border border-transparent focus:border-primary-500/30 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10"
              />
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {user?.role === 'student' && (
              <button
                onClick={() => navigate(ROUTES.WISHLIST)}
                className="relative p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <button
              className="relative p-2 text-gray-600 hover:bg-gray-100/50 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Notifications — Coming Soon"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${showProfileMenu ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user?.name?.[0] || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:flex flex-col items-start pr-1 text-left">
                  <span className="text-xs font-bold text-gray-900 leading-tight line-clamp-1">{user?.name || 'Guest User'}</span>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{user?.role || 'Guest'}</span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-1.5 flex flex-col">
                    <button
                      onClick={() => { setShowProfileMenu(false); onOpenProfile?.(); }}
                      className="flex items-center gap-3 p-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Profile Settings
                    </button>
                    {user?.role === 'student' && (
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate('/student/preferences'); }}
                        className="flex items-center gap-3 p-2.5 text-sm text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Preferences
                      </button>
                    )}
                    <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 p-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
