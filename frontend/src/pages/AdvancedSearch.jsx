import { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  Download,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

export default function AdvancedSearch({ darkMode }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    query: '',
    severity: 'all',
    dateRange: 'all',
    sentiment: 'all',
    type: 'all'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getDateCutoff = (range) => {
    const now = new Date();
    if (range === 'today') { now.setHours(0, 0, 0, 0); return now; }
    if (range === 'week') { now.setDate(now.getDate() - 7); return now; }
    if (range === 'month') { now.setDate(now.getDate() - 30); return now; }
    return null;
  };

  const scoredSeverity = (toxicity, cyberbullying) => {
    const max = Math.max(toxicity || 0, cyberbullying || 0);
    if (max > 0.7) return 'critical';
    if (max > 0.5) return 'high';
    if (max > 0.3) return 'medium';
    return 'low';
  };

  const handleSearch = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await historyAPI.getByUserId(user.id);
      let allData = res.data?.data || [];

      // Apply date range filter
      const cutoff = getDateCutoff(filters.dateRange);
      if (cutoff) allData = allData.filter(item => new Date(item.created_at) >= cutoff);

      // Apply text search
      if (filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        allData = allData.filter(item => item.input_text.toLowerCase().includes(q));
      }

      // Apply sentiment filter
      if (filters.sentiment !== 'all') {
        allData = allData.filter(item => item.sentiment === filters.sentiment);
      }

      let mapped = allData.map(item => ({
        id: item.id,
        text: item.input_text,
        severity: scoredSeverity(item.toxicity_score, item.cyberbullying_prob),
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        sentiment: item.sentiment || 'neutral',
        toxicity: Math.round((item.toxicity_score || 0) * 100),
        cyberbullying: Math.round((item.cyberbullying_prob || 0) * 100),
        sarcasm: item.result_sarcasm,
        tweet_url: item.tweet_url
      }));

      // Apply severity filter
      if (filters.severity !== 'all') {
        mapped = mapped.filter(r => r.severity === filters.severity);
      }

      setResults(mapped);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all results on mount
  useEffect(() => {
    if (user) handleSearch();
  }, [user?.id]);

  const handleExport = () => {
    if (!results.length) return;
    const headers = ['Text', 'Severity', 'Toxicity%', 'Cyberbullying%', 'Sentiment', 'Sarcasm', 'Date'];
    const rows = results.map(r => [
      `"${r.text.replace(/"/g, '""')}"`,
      r.severity,
      r.toxicity,
      r.cyberbullying,
      r.sentiment,
      r.sarcasm ? 'Yes' : 'No',
      r.date
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'from-red-500 to-red-600';
    if (severity === 'high') return 'from-orange-500 to-orange-600';
    if (severity === 'medium') return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical') return darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
    if (severity === 'high') return darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
    if (severity === 'medium') return darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
    return darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
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
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          {/* Query */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Query
            </label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            } focus-within:ring-2 focus-within:ring-blue-500`}>
              <SearchIcon className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for content, keywords, or patterns..."
                className={`flex-1 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'} focus:outline-none`}
              />
              {filters.query && (
                <button onClick={() => setFilters({ ...filters, query: '' })}>
                  <XCircle className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Severity', key: 'severity', options: [['all','All Severities'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
              { label: 'Date Range', key: 'dateRange', options: [['all','All Time'],['today','Today'],['week','Last 7 Days'],['month','Last 30 Days']] },
              { label: 'Sentiment', key: 'sentiment', options: [['all','All Sentiments'],['positive','Positive'],['negative','Negative'],['neutral','Neutral']] },
              { label: 'Content Type', key: 'type', options: [['all','All Types'],['cyberbullying','Cyberbullying'],['harassment','Harassment'],['hate','Hate Speech']] }
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {label}
                </label>
                <select
                  value={filters[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {options.map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !user}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <SearchIcon className="w-5 h-5" />
            )}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Results ({results.length})
            </h2>
            {results.length > 0 && (
              <button
                onClick={handleExport}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border-2 border-dashed ${
              darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'
            }`}>
              <Filter className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No results found
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-5 rounded-xl border ${
                    darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                  } transition-all`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${getSeverityColor(result.severity)} flex-shrink-0`}>
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-base font-medium break-words mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          "{result.text.length > 120 ? result.text.slice(0, 120) + '…' : result.text}"
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full font-semibold ${getSeverityBadge(result.severity)}`}>
                            {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {result.sentiment}
                          </span>
                          {result.sarcasm && (
                            <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                              Sarcasm
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {result.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-2xl font-bold ${
                        result.toxicity > 70 ? 'text-red-600' : result.toxicity > 40 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {result.toxicity}%
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>toxicity</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
