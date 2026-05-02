import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, RefreshCw, Download, Filter, SortDesc } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import HistoryTable from '../components/HistoryTable';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

export default function History({ darkMode }) {
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const { user } = useAuth();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      full: date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      setError('Please login to view your analysis history');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await historyAPI.getByUserId(user.id);
      const raw = res.data?.data || [];

      const historyData = raw.map(item => {
        const dt = formatDateTime(item.created_at);
        return {
          id: item.id,
          text: item.input_text.substring(0, 50) + (item.input_text.length > 50 ? '...' : ''),
          fullText: item.input_text,
          toxicity: item.toxicity_score,
          cyberbullying: item.cyberbullying_prob,
          sarcasm: item.result_sarcasm,
          sentiment: item.sentiment,
          date: dt.date,
          time: dt.time,
          fullDateTime: dt.full,
          timestamp: new Date(item.created_at).getTime(),
          tweet_url: item.tweet_url
        };
      });

      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [user?.id]);

  useEffect(() => {
    let result = [...history];
    if (filterBy !== 'all') {
      result = result.filter(item => {
        if (filterBy === 'toxic') return item.toxicity > 0.5 || item.cyberbullying > 0.5;
        if (filterBy === 'safe') return item.toxicity <= 0.5 && item.cyberbullying <= 0.5;
        if (filterBy === 'positive') return item.sentiment === 'positive';
        if (filterBy === 'negative') return item.sentiment === 'negative';
        return true;
      });
    }
    result.sort((a, b) => {
      if (sortBy === 'latest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'toxicity') return b.toxicity - a.toxicity;
      if (sortBy === 'cyberbullying') return b.cyberbullying - a.cyberbullying;
      return 0;
    });
    setFilteredHistory(result);
  }, [sortBy, filterBy, history]);

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Text', 'Toxicity', 'Cyberbullying', 'Sentiment', 'Sarcasm'];
    const rows = filteredHistory.map(item => [
      item.date,
      item.time,
      `"${item.fullText.replace(/"/g, '""')}"`,
      (item.toxicity * 100).toFixed(1) + '%',
      (item.cyberbullying * 100).toFixed(1) + '%',
      item.sentiment,
      item.sarcasm ? 'Yes' : 'No'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `safetext-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    try {
      await historyAPI.delete(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      setFilteredHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete failed:', err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const wrapperClass = inDashboard ? '' : `${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} min-h-screen pt-16`;

  return (
    <div className={wrapperClass}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${inDashboard ? 'max-w-5xl py-4' : 'max-w-7xl py-8'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className={`${inDashboard ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600`} />
              <div>
                <h1 className={`${inDashboard ? 'text-2xl' : 'text-3xl'} font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis History
                </h1>
                <p className={`${inDashboard ? 'text-sm' : 'text-base'} mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View your past text analysis results ({filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              )}
              <button
                onClick={fetchHistory}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow transition-all`}
              >
                <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {history.length > 0 && !error && (
            <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                <button onClick={fetchHistory} className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
                  Try Again
                </button>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!error && filteredHistory.length === 0 && history.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
            >
              <AlertCircle className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No History Yet</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Start analyzing text to see your results here</p>
              <Link to="/dashboard/analyze" className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow text-sm">
                Analyze Text
              </Link>
            </motion.div>
          )}

          {!error && filteredHistory.length === 0 && history.length > 0 && (
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

          {!error && filteredHistory.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow overflow-hidden`}
            >
              <HistoryTable history={filteredHistory} onDelete={handleDelete} darkMode={darkMode} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
