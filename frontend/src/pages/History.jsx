import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, AlertCircle, RefreshCw, Download, Filter, SortDesc,
  Search as SearchIcon, XCircle, AlertTriangle,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import HistoryTable from '../components/HistoryTable';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

/* ─── shared helpers ─────────────────────────────────────────────────────── */

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return {
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    full: date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

const scoreSeverity = (toxicity, cyberbullying) => {
  const max = Math.max(toxicity || 0, cyberbullying || 0);
  if (max > 0.7) return 'critical';
  if (max > 0.5) return 'high';
  if (max > 0.3) return 'medium';
  return 'low';
};

const getDateCutoff = (range) => {
  const now = new Date();
  if (range === 'today') { now.setHours(0, 0, 0, 0); return now; }
  if (range === 'week')  { now.setDate(now.getDate() - 7); return now; }
  if (range === 'month') { now.setDate(now.getDate() - 30); return now; }
  return null;
};

const exportCSV = (rows, filename) => {
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ─── History tab ─────────────────────────────────────────────────────────── */

function HistoryTab({ darkMode, rawData, loading, error, onRefresh, onDelete }) {
  const [sortBy, setSortBy]     = useState('latest');
  const [filterBy, setFilterBy] = useState('all');

  const history = rawData.map(item => {
    const dt = formatDateTime(item.created_at);
    return {
      id:           item.id,
      text:         item.input_text.substring(0, 50) + (item.input_text.length > 50 ? '...' : ''),
      fullText:     item.input_text,
      toxicity:     item.toxicity_score,
      cyberbullying: item.cyberbullying_prob,
      sarcasm:      item.result_sarcasm,
      sentiment:    item.sentiment,
      date:         dt.date,
      time:         dt.time,
      fullDateTime: dt.full,
      timestamp:    new Date(item.created_at).getTime(),
      tweet_url:    item.tweet_url,
    };
  });

  let filtered = [...history];
  if (filterBy !== 'all') {
    filtered = filtered.filter(item => {
      if (filterBy === 'toxic')    return item.toxicity > 0.5 || item.cyberbullying > 0.5;
      if (filterBy === 'safe')     return item.toxicity <= 0.5 && item.cyberbullying <= 0.5;
      if (filterBy === 'positive') return item.sentiment === 'positive';
      if (filterBy === 'negative') return item.sentiment === 'negative';
      return true;
    });
  }
  filtered.sort((a, b) => {
    if (sortBy === 'latest')        return b.timestamp - a.timestamp;
    if (sortBy === 'oldest')        return a.timestamp - b.timestamp;
    if (sortBy === 'toxicity')      return b.toxicity - a.toxicity;
    if (sortBy === 'cyberbullying') return b.cyberbullying - a.cyberbullying;
    return 0;
  });

  const handleExport = () => {
    const headers = ['Date', 'Time', 'Text', 'Toxicity', 'Cyberbullying', 'Sentiment', 'Sarcasm'];
    const rows = filtered.map(item => [
      item.date, item.time,
      `"${item.fullText.replace(/"/g, '""')}"`,
      (item.toxicity * 100).toFixed(1) + '%',
      (item.cyberbullying * 100).toFixed(1) + '%',
      item.sentiment,
      item.sarcasm ? 'Yes' : 'No',
    ]);
    exportCSV(
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n'),
      `safetext-history-${new Date().toISOString().split('T')[0]}.csv`,
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow transition-all`}
          >
            <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Sort / Filter */}
      {history.length > 0 && !error && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-1.5`}>
                <SortDesc className="w-4 h-4" /> Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="toxicity">Highest Toxicity</option>
                <option value="cyberbullying">Highest Cyberbullying</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-1.5`}>
                <Filter className="w-4 h-4" /> Filter By
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              >
                <option value="all">All Results</option>
                <option value="toxic">Toxic Content (&gt;50%)</option>
                <option value="safe">Safe Content (≤50%)</option>
                <option value="positive">Positive Sentiment</option>
                <option value="negative">Negative Sentiment</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
        >
          <AlertCircle className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {error.includes('login') ? 'Login Required' : 'Error'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{error}</p>
          {error.includes('login') ? (
            <Link to="/login" className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
              Login Now
            </Link>
          ) : (
            <button onClick={onRefresh} className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
              Try Again
            </button>
          )}
        </motion.div>
      )}

      {/* Empty states */}
      {!error && history.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
        >
          <AlertCircle className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No History Yet</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Start analyzing text to see your results here</p>
          <Link to="/dashboard/twitter" className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
            Analyze Text
          </Link>
        </motion.div>
      )}

      {!error && filtered.length === 0 && history.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
        >
          <Filter className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Results Match Filter</h3>
          <button onClick={() => setFilterBy('all')} className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
            Clear Filters
          </button>
        </motion.div>
      )}

      {!error && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow overflow-hidden`}
        >
          <HistoryTable history={filtered} onDelete={onDelete} darkMode={darkMode} />
        </motion.div>
      )}
    </div>
  );
}

/* ─── Search tab ──────────────────────────────────────────────────────────── */

function SearchTab({ darkMode, rawData, loading: dataLoading }) {
  const [filters, setFilters] = useState({
    query: '', severity: 'all', dateRange: 'all', sentiment: 'all', type: 'all',
  });
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [running, setRunning]   = useState(false);

  const runSearch = () => {
    setRunning(true);
    setSearched(true);

    let data = [...rawData];

    const cutoff = getDateCutoff(filters.dateRange);
    if (cutoff) data = data.filter(item => new Date(item.created_at) >= cutoff);

    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      data = data.filter(item => item.input_text.toLowerCase().includes(q));
    }

    if (filters.sentiment !== 'all') {
      data = data.filter(item => item.sentiment === filters.sentiment);
    }

    let mapped = data.map(item => ({
      id:           item.id,
      text:         item.input_text,
      severity:     scoreSeverity(item.toxicity_score, item.cyberbullying_prob),
      date:         new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sentiment:    item.sentiment || 'neutral',
      toxicity:     Math.round((item.toxicity_score || 0) * 100),
      cyberbullying: Math.round((item.cyberbullying_prob || 0) * 100),
      sarcasm:      item.result_sarcasm,
      tweet_url:    item.tweet_url,
    }));

    if (filters.severity !== 'all') {
      mapped = mapped.filter(r => r.severity === filters.severity);
    }

    setResults(mapped);
    setRunning(false);
  };

  // Auto-search when data loads
  useEffect(() => {
    if (!dataLoading && rawData.length > 0 && !searched) runSearch();
  }, [dataLoading, rawData.length]);

  const handleExport = () => {
    if (!results.length) return;
    const headers = ['Text', 'Severity', 'Toxicity%', 'Cyberbullying%', 'Sentiment', 'Sarcasm', 'Date'];
    const rows = results.map(r => [
      `"${r.text.replace(/"/g, '""')}"`,
      r.severity, r.toxicity, r.cyberbullying, r.sentiment,
      r.sarcasm ? 'Yes' : 'No', r.date,
    ]);
    exportCSV(
      [headers, ...rows].map(row => row.join(',')).join('\n'),
      `search-results-${new Date().toISOString().split('T')[0]}.csv`,
    );
  };

  const getSeverityColor = (s) => {
    if (s === 'critical') return 'from-red-500 to-red-600';
    if (s === 'high')     return 'from-orange-500 to-orange-600';
    if (s === 'medium')   return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  const getSeverityBadge = (s) => {
    if (s === 'critical') return darkMode ? 'bg-red-500/20 text-red-300'    : 'bg-red-100 text-red-700';
    if (s === 'high')     return darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
    if (s === 'medium')   return darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
    return darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          {/* Query input */}
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
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
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

          {/* Filter grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Severity',     key: 'severity',  options: [['all','All Severities'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
              { label: 'Date Range',   key: 'dateRange', options: [['all','All Time'],['today','Today'],['week','Last 7 Days'],['month','Last 30 Days']] },
              { label: 'Sentiment',    key: 'sentiment', options: [['all','All Sentiments'],['positive','Positive'],['negative','Negative'],['neutral','Neutral']] },
              { label: 'Content Type', key: 'type',      options: [['all','All Types'],['cyberbullying','Cyberbullying'],['harassment','Harassment'],['hate','Hate Speech']] },
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
            onClick={runSearch}
            disabled={running || dataLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {(running || dataLoading) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <SearchIcon className="w-5 h-5" />
            )}
            {(running || dataLoading) ? 'Searching...' : 'Search'}
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
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No results found</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Try adjusting your filters or search query</p>
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

/* ─── Shell ───────────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'history', label: 'History',         Icon: Clock },
  { id: 'search',  label: 'Advanced Search', Icon: SearchIcon },
];

export default function History({ darkMode }) {
  const location   = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');

  const [activeTab, setActiveTab] = useState('history');
  const [rawData, setRawData]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      setError('Please login to view your analysis history');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await historyAPI.getByUserId(user.id);
      setRawData(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const handleDelete = async (id) => {
    try {
      await historyAPI.delete(id);
      setRawData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete failed:', err.response?.data?.error || err.message);
    }
  };

  const wrapperClass = inDashboard
    ? ''
    : `${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} min-h-screen pt-16`;

  return (
    <div className={wrapperClass}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${inDashboard ? 'max-w-5xl py-4' : 'max-w-7xl py-8'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis History
                </h1>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Browse past results or search with advanced filters
                </p>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className={`inline-flex rounded-xl p-1 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow'
                    : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'history' ? (
            <HistoryTab
              darkMode={darkMode}
              rawData={rawData}
              loading={loading}
              error={error}
              onRefresh={fetchData}
              onDelete={handleDelete}
            />
          ) : (
            <SearchTab
              darkMode={darkMode}
              rawData={rawData}
              loading={loading}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
