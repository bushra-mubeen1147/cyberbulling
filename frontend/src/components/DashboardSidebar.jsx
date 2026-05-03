import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardSidebar({ darkMode, user, menuItems, activePath }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => activePath === path;
  
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4 flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2.5 rounded-lg transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Menu
        </span>
      </div>

      {/* Desktop Sidebar - Always visible */}
      <div
        className={`
          hidden lg:block
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
                          text-xs mt-0.5
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

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`
            lg:hidden
            mb-4
            p-4
            rounded-lg 
            border 
            ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}
            backdrop-blur-sm 
            shadow-md
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
                  onClick={closeMobileMenu}
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
                            text-xs mt-0.5
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
        </motion.div>
      )}
    </>
  );
}
