import { Link } from 'react-router-dom';
import { LayoutDashboard, ChevronRight } from 'lucide-react';

export default function DashboardSidebar({ darkMode, user, menuItems, activePath }) {
  const isActive = (path) => activePath === path;

  return (
    <div
      className={`
        w-full
        p-4
        rounded-lg 
        border 
        ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}
        backdrop-blur-sm 
        sticky 
        top-16
        shadow-sm
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center gap-2 mb-4 pb-3 border-b 
          ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
      >
        <LayoutDashboard className="w-5 h-5 text-blue-600" />
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
          Navigation
        </span>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          if (item.requiresAuth && !user) return null;
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group block px-3 py-2.5 rounded-lg transition-all duration-150
                ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : darkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`
                    w-5 h-5
                    ${active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                    transition-colors
                  `}
                />

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{item.label}</span>

                  {item.description && (
                    <p
                      className={`
                        text-xs mt-0.5 hidden md:block 
                        ${active ? 'text-blue-100' : darkMode ? 'text-gray-500' : 'text-gray-500'}
                      `}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                <ChevronRight
                  className={`
                    w-4 h-4 
                    ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
                    transition-opacity
                  `}
                />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
