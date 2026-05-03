import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Moon, Sun, LogOut, User, Menu, X, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthProvider.jsx';
import { alertsAPI } from '../api/api.js';

const relTime = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const parseNotifContent = (content = '') => {
  const idx = content.indexOf('\n\n');
  if (idx === -1) return { title: content, body: '' };
  return { title: content.slice(0, idx).trim(), body: content.slice(idx + 2).trim() };
};

const NOTIF_ICON = { admin_notification: Bell, analysis_complete: CheckCircle, high_risk: AlertTriangle };
const NOTIF_COLOR = {
  admin_notification: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  analysis_complete:  'text-green-500 bg-green-100 dark:bg-green-900/30',
  high_risk:          'text-red-500 bg-red-100 dark:bg-red-900/30',
};

export default function Navbar({ darkMode, toggleDarkMode, user: legacyUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const activeUser = user || legacyUser;
  const dk = darkMode;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!activeUser?.id) return;
    setNotifsLoading(true);
    try {
      const res = await alertsAPI.getByUserId(activeUser.id);
      setNotifs((res.data?.data || []).map(a => ({
        id: a.id,
        ...parseNotifContent(a.content),
        type: a.alert_type || 'admin_notification',
        time: relTime(a.created_at),
        unread: !a.is_read,
      })));
    } catch {}
    finally { setNotifsLoading(false); }
  }, [activeUser?.id]);

  useEffect(() => { if (activeUser?.id) fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    if (!activeUser?.id) return;
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, [fetchNotifs]);

  useEffect(() => {
    if (notifOpen && notifications.some(n => n.unread)) {
      alertsAPI.markAllRead()
        .then(() => setNotifs(p => p.map(n => ({ ...n, unread: false }))))
        .catch(() => {});
    }
  }, [notifOpen]);

  // Close dropdown on outside click (using data attribute to handle all notif elements)
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-notif-area]')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const isActive = (path) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) onLogout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const NavLink = ({ to, children, className = '' }) => (
    <Link to={to} onClick={closeMobileMenu}
      className={`transition-colors ${isActive(to) ? 'text-blue-600 font-semibold' : dk ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} ${className}`}
    >{children}</Link>
  );

  // Reusable notification dropdown panel
  const NotifDropdown = () => (
    <AnimatePresence>
      {notifOpen && (
        <motion.div data-notif-area
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden border z-[60] ${dk ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
              {notifications.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${dk ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{notifications.length}</span>
              )}
            </div>
            <button onClick={fetchNotifs} title="Refresh"
              className={`p-1 rounded-lg ${dk ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {notifsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className={`w-8 h-8 mx-auto mb-2 ${dk ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => {
                const NI = NOTIF_ICON[n.type] || Bell;
                const nc = NOTIF_COLOR[n.type] || 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
                return (
                  <div key={n.id}
                    className={`px-4 py-3 border-b ${dk ? 'border-gray-700' : 'border-gray-50'} ${n.unread ? dk ? 'bg-blue-900/10' : 'bg-blue-50/60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${nc}`}>
                        <NI className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>{n.title || 'Notification'}</p>
                        {n.body && <p className={`text-xs mt-0.5 leading-relaxed ${dk ? 'text-gray-400' : 'text-gray-600'}`}>{n.body}</p>}
                        <p className={`text-[10px] mt-1 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{n.time}</p>
                      </div>
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className={`px-4 py-2.5 border-t ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-[10px] text-center ${dk ? 'text-gray-600' : 'text-gray-400'}`}>Opening this panel marks all as read</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const BellButton = () => (
    <button data-notif-area onClick={() => setNotifOpen(p => !p)}
      className={`relative p-1.5 rounded-md transition-colors ${dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      <Bell className="w-4 h-4" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center"
          >{unreadCount > 9 ? '9+' : unreadCount}</motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }}
      className={`fixed w-full z-50 ${dk ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm shadow-md`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-2">
        <div className="flex justify-between items-center h-12">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SafeText AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            <NavLink to="/" className="text-sm">Home</NavLink>
            <NavLink to="/about" className="text-sm">About</NavLink>
            <NavLink to="/services" className="text-sm">Services</NavLink>
            <NavLink to="/contact" className="text-sm">Contact</NavLink>

            {activeUser ? (
              <>
                <Link to="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >Dashboard</Link>

                {/* Bell */}
                <div data-notif-area className="relative">
                  <BellButton />
                  <NotifDropdown />
                </div>

                {/* User + Logout */}
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <User className={`w-3 h-3 ${dk ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${dk ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activeUser.name || activeUser.email}
                    </span>
                  </div>
                  <button onClick={handleLogout}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${dk ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <LogOut className="w-3 h-3" /><span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive('/login') || isActive('/signup')
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >Login</Link>
            )}

            <button onClick={toggleDarkMode}
              className={`p-1.5 rounded-md transition-colors ${dk ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Bell on mobile */}
            {activeUser && (
              <div data-notif-area className="relative">
                <BellButton />
                <NotifDropdown />
              </div>
            )}

            <button onClick={toggleDarkMode}
              className={`p-1.5 rounded-md transition-colors ${dk ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-md transition-colors ${dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden mt-2 pb-3 space-y-2 border-t ${dk ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <NavLink to="/" className="block px-3 py-2 rounded-md text-sm">Home</NavLink>
            <NavLink to="/about" className="block px-3 py-2 rounded-md text-sm">About</NavLink>
            <NavLink to="/services" className="block px-3 py-2 rounded-md text-sm">Services</NavLink>
            <NavLink to="/contact" className="block px-3 py-2 rounded-md text-sm">Contact</NavLink>

            {activeUser ? (
              <>
                <Link to="/dashboard" onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >Dashboard</Link>
                <div className={`flex items-center justify-between px-3 py-2 rounded-md ${dk ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center space-x-1">
                    <User className={`w-3 h-3 ${dk ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${dk ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activeUser.name || activeUser.email}
                    </span>
                  </div>
                </div>
                <button onClick={() => { handleLogout(); closeMobileMenu(); }}
                  className={`w-full text-left flex items-center space-x-1 px-3 py-2 rounded-md text-xs transition-colors ${dk ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                >
                  <LogOut className="w-3 h-3" /><span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/login') || isActive('/signup')
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : dk ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >Login</Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
