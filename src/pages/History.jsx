import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import HistoryTable from '../components/HistoryTable';
import { historyAPI } from '../api/api';

export default function History({ darkMode, user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setLoading(false);
      setError('Please login to view your analysis history');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      const response = await historyAPI.getByUserId(userData.id);
      const historyData = response.data.data.map(item => ({
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
      if (err.response?.status === 401) {
        setError('Please login to view your analysis history');
      } else {
        setError('Failed to load history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis History
                </h1>
                <p className={`text-lg mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View your past text analysis results
                </p>
              </div>
            </div>
            <button
              onClick={fetchHistory}
              className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-lg transition-all`}
            >
              <RefreshCw className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}
            >
              <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {error.includes('login') ? 'Login Required' : 'Error Loading History'}
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {error}
              </p>
              {error.includes('login') ? (
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Login Now
                </Link>
              ) : (
                <button
                  onClick={fetchHistory}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          )}

          {!error && history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}
            >
              <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No History Yet
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Start analyzing text to see your results here
              </p>
              <Link
                to="/analyze"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Analyze Text
              </Link>
            </motion.div>
          ) : !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}
            >
              <HistoryTable history={history} onDelete={handleDelete} darkMode={darkMode} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
