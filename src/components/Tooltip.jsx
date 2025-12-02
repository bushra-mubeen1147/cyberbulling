import { useState } from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ content, darkMode, icon = true }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
      >
        {icon && <Info className="w-4 h-4" />}
      </button>
      
      {show && (
        <div className={`absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg whitespace-nowrap ${
          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'
        } -top-2 left-6 transform -translate-y-full`}>
          <div className="relative">
            {content}
            {/* Arrow */}
            <div className={`absolute top-full left-0 w-2 h-2 transform rotate-45 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-900'
            }`} style={{ marginTop: '-4px' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
