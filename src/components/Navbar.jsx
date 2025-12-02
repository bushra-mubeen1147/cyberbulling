import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Moon, Sun, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthProvider.jsx';

export default function Navbar({ darkMode, toggleDarkMode, user: legacyUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const activeUser = user || legacyUser; // fallback

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
      } backdrop-blur-sm shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              SafeText AI
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            {/* <Link
              to="/analyze"
              className={`transition-colors ${
                isActive('/analyze')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Analyze
            </Link> */}
            {/* <Link
              to="/history"
              className={`transition-colors ${
                isActive('/history')
                  ? 'text-blue-600 font-semibold'
                  : darkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              History
            </Link> */}

            {activeUser ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activeUser.name || activeUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                      darkMode
                        ? 'text-red-400 hover:bg-red-900/30'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
