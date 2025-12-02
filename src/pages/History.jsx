import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import HistoryTable from '../components/HistoryTable';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

export default function History({ darkMode }) {
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      setError('Please login to view your analysis history');
      return;
    }
    try {
      const { data, error: selectError } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectError) throw selectError;

      const historyData = (data || []).map(item => ({
        id: item.id,
        text: item.input_text.substring(0, 50) + (item.input_text.length > 50 ? '...' : ''),
        fullText: item.input_text,
        toxicity: item.toxicity_score,
        cyberbullying: item.cyberbullying_prob,
        sarcasm: item.result_sarcasm,
        sentiment: item.sentiment,
        date: new Date(item.created_at).toLocaleDateString()
      }));

      setHistory(historyData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  const handleDelete = async (id) => {
    try {
      await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const wrapperClass = inDashboard ? '' : `${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} min-h-screen pt-16`;
  const containerClass = inDashboard ? 'max-w-5xl py-4' : 'max-w-7xl py-8';

  return (
    <div className={wrapperClass}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${containerClass}`}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <Clock className={`${inDashboard ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600`} />
              <div>
                <h1 className={`${inDashboard ? 'text-2xl' : 'text-3xl'} font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis History
                </h1>
                <p className={`${inDashboard ? 'text-sm' : 'text-base'} mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View your past text analysis results
                </p>
              </div>
            </div>

            <button
              onClick={fetchHistory}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              } shadow transition-all`}
              aria-label="Refresh history"
            >
              <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Errors */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
            >
              <AlertCircle className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {error.includes('login') ? 'Login Required' : 'Error Loading History'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {error}
              </p>

              {error.includes('login') ? (
                <Link
                  to="/login"
                  className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:shadow-md transition-all text-sm"
                >
                  Login Now
                </Link>
              ) : (
                <button
                  onClick={fetchHistory}
                  className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:shadow-md transition-all text-sm"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!error && history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 text-center`}
            >
              <AlertCircle className={`w-12 h-12 mx-auto mb-2.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No History Yet
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Start analyzing text to see your results here
              </p>
              <Link
                to="/dashboard/analyze"
                className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:shadow-md transition-all text-sm"
              >
                Analyze Text
              </Link>
            </motion.div>
          ) : !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow overflow-hidden`}
            >
              <HistoryTable history={history} onDelete={handleDelete} darkMode={darkMode} />
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
