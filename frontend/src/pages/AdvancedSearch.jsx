import { useState } from 'react';
import { 
  Search as SearchIcon,
  Filter,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  Download,
  ChevronRight
} from 'lucide-react';

export default function AdvancedSearch({ darkMode }) {
  const [filters, setFilters] = useState({
    query: '',
    severity: 'all',
    dateRange: 'all',
    status: 'all',
    type: 'all'
  });

  const [results, setResults] = useState([
    {
      id: 1,
      text: 'This is hate speech content example',
      severity: 'critical',
      date: '2024-04-28',
      type: 'Hate Speech',
      toxicity: 98,
      user: 'User #1234'
    },
    {
      id: 2,
      text: 'Cyberbullying message example here',
      severity: 'high',
      date: '2024-04-27',
      type: 'Cyberbullying',
      toxicity: 89,
      user: 'User #5678'
    },
    {
      id: 3,
      text: 'Harassment and threats content',
      severity: 'high',
      date: '2024-04-26',
      type: 'Harassment',
      toxicity: 85,
      user: 'User #9012'
    },
    {
      id: 4,
      text: 'Mild negative comment',
      severity: 'low',
      date: '2024-04-25',
      type: 'Negativity',
      toxicity: 42,
      user: 'User #3456'
    }
  ]);

  const handleSearch = () => {
    // Search logic here
    console.log('Searching with filters:', filters);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Advanced Search
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Search and filter your analysis history with advanced options
        </p>
      </div>

      {/* Search Form */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Query
            </label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-300'
            } focus-within:ring-2 focus-within:ring-blue-500`}>
              <SearchIcon className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search for content, keywords, or patterns..."
                className={`flex-1 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} focus:outline-none`}
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Types</option>
                <option value="cyberbullying">Cyberbullying</option>
                <option value="harassment">Harassment</option>
                <option value="hate">Hate Speech</option>
                <option value="spam">Spam</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Status</option>
                <option value="flagged">Flagged</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <SearchIcon className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Results ({results.length})
          </h2>
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } transition-colors`}>
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-5 rounded-xl border ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getSeverityColor(result.severity)} flex-shrink-0`}>
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-semibold break-words mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      "{result.text}"
                    </p>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        result.severity === 'critical'
                          ? darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                          : result.severity === 'high'
                            ? darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'
                            : darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.severity}
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-4 h-4" />
                        {result.date}
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <User className="w-4 h-4" />
                        {result.user}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-3xl font-bold ${
                    result.toxicity > 80
                      ? 'text-red-600'
                      : result.toxicity > 50
                        ? 'text-orange-600'
                        : 'text-blue-600'
                  }`}>
                    {result.toxicity}%
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>toxicity</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
