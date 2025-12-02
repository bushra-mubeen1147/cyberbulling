import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

export default function Dashboard({ darkMode }) {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;
  const atRoot = location.pathname === '/dashboard';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}> 
      {/* Top bar */}
      <div className={`fixed top-0 inset-x-0 z-40 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-lg">Dashboard</div>
          <div className="flex items-center gap-3">
            <input className={`w-64 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 placeholder-gray-500' : 'bg-white border-gray-300 placeholder-gray-500'}`} placeholder="Search" />
            <div className={`px-3 py-2 rounded-xl text-sm ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'}`}>{user ? user.email : 'Guest'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className={`md:col-span-3 lg:col-span-2 p-4 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} sticky top-20 h-fit`}>
          <div className="text-xs uppercase tracking-wider mb-3 opacity-70">Menu</div>
          <nav className="space-y-1">
            {user && (
              <Link to="/dashboard/analyze" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard/analyze') ? 'bg-blue-600 text-white' : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>Analyze</Link>
            )}
            {user && (
              <Link to="/dashboard/history" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard/history') ? 'bg-blue-600 text-white' : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>History</Link>
            )}
            <Link to="/dashboard/profile" className={`block px-3 py-2 rounded-lg ${isActive('/dashboard/profile') ? 'bg-blue-600 text-white' : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>Profile</Link>
          </nav>
        </aside>

        {/* Main content simplified */}
        <main className="md:col-span-9 lg:col-span-10 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          {atRoot ? (user ? <Navigate to="/dashboard/analyze" replace /> : <Navigate to="/dashboard/profile" replace />) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
