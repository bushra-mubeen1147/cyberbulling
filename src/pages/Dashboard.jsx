import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  User, 
  Search, 
  Bell, 
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar.jsx';

export default function Dashboard({ darkMode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  const atRoot = location.pathname === '/dashboard';

  const menuItems = [
    {
      path: '/dashboard/analyze',
      icon: FileText,
      label: 'Analyze Text',
      description: 'Check content',
      requiresAuth: true,
      badge: 'New'
    },
    {
      path: '/dashboard/history',
      icon: History,
      label: 'Analysis History',
      description: 'Past results',
      requiresAuth: true
    },
    {
      path: '/dashboard/profile',
      icon: User,
      label: 'Profile Settings',
      description: 'Manage account'
    }
  ];

  const notifications = [
    { id: 1, text: 'New analysis completed', time: '2m ago', unread: true },
    { id: 2, text: 'Weekly report available', time: '1h ago', unread: true },
    { id: 3, text: 'Account security updated', time: '3h ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}> 
      {/* Compact Top Navigation Bar */}
      <div className={`fixed top-0 inset-x-0 z-40 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">SafeText AI</span>
            </div>
          </div>

          {/* Search + User */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                className={`w-64 pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm`} 
                placeholder="Search..." 
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-72 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl overflow-hidden`}> 
                  <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-600 text-white rounded-full">{unreadCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} text-sm ${n.unread ? 'bg-blue-500/5' : ''}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${n.unread ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                          <div className="flex-1">
                            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{n.text}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user ? user.email.charAt(0).toUpperCase() : 'G'}
                </div>
                <span className="hidden md:block text-sm font-medium truncate max-w-[10rem]">
                  {user ? user.email.split('@')[0] : 'Guest'}
                </span>
              </button>
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-60 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl overflow-hidden`}> 
                  <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user ? user.email.split('@')[0] : 'Guest User'}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user ? user.email : 'guest@example.com'}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link 
                      to="/dashboard/profile"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-sm`}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link 
                      to="/dashboard/settings"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-sm`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </Link>
                  </div>
                  <div className={`p-1.5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button 
                      onClick={logout}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'} text-sm`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Compact Sidebar */}
          <aside className={`lg:col-span-3`}>
            <DashboardSidebar
              darkMode={darkMode}
              user={user}
              menuItems={menuItems}
              activePath={location.pathname}
            />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                Dashboard
              </Link>
              {location.pathname !== '/dashboard' && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium capitalize truncate`}>
                    {location.pathname.split('/').pop()}
                  </span>
                </>
              )}
            </div>

            {/* Smaller Welcome Banner */}
            {atRoot && (
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'} shadow-sm`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Welcome back, {user ? user.email.split('@')[0] : 'Guest'}!
                    </h2>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Analyze text, track history, and manage your account.</p>
                  </div>
                  <Sparkles className="w-10 h-10 text-blue-600 opacity-50 hidden sm:block" />
                </div>
              </div>
            )}

            {/* Auto-redirect to default child */}
            {atRoot ? (user ? <Navigate to="/dashboard/analyze" replace /> : <Navigate to="/dashboard/profile" replace />) : null}

            {/* Nested content */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}