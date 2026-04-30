import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Moon, Sun, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthProvider.jsx';

export default function Navbar({ darkMode, toggleDarkMode, user: legacyUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const activeUser = user || legacyUser;

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) onLogout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 ${
        darkMode ? 'bg-gray-900/95' : 'bg-white/95'
      } backdrop-blur-sm shadow-md`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-2 pb-2">
        <div className="flex justify-between items-center h-12"> {/* reduced height */}
          <Link to="/" className="flex items-center space-x-1.5">
            <Shield className="w-6 h-6 text-blue-600" /> {/* smaller icon */}
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SafeText AI
            </span>
          </Link>

          <div className="flex items-center space-x-3"> {/* less spacing */}
            <Link
              to="/"
              className={`transition-colors text-sm ${
                isActive('/')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`transition-colors text-sm ${
                isActive('/about')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>

            <Link
              to="/services"
              className={`transition-colors text-sm ${
                isActive('/services')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Services
            </Link>

            <Link
              to="/contact"
              className={`transition-colors text-sm ${
                isActive('/contact')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </Link>

            {activeUser ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <User className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activeUser.name || activeUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
                      darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive('/login') || isActive('/signup')
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Login
              </Link>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-md transition-colors ${
                darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
