import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Save } from 'lucide-react';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';
import { analysisAPI } from '../api/api';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

export default function Analyze({ darkMode }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setSaved(false);
    setError('');

    try {
      const response = await analysisAPI.analyze(text);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    if (!user) {
      setError('Please login to save your analysis history');
      return;
    }
    try {
      const { error: insertError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          input_text: text,
          toxicity_score: result.toxicity_score,
          cyberbullying_prob: result.cyberbullying_prob,
          result_sarcasm: result.sarcasm,
          sentiment: result.sentiment,
          tweet_url: url || null,
          created_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;
      setError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analyze Text
          </h1>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter text to detect toxicity, cyberbullying, and sentiment
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-8`}>
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Text to Analyze *
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to analyze for toxicity and cyberbullying..."
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tweet URL (Optional)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Text'}</span>
              </button>
            </div>
          </div>

          {loading && <Spinner />}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ResultCard result={result} darkMode={darkMode} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={handleSave}
                  className={`px-8 py-4 ${
                    saved
                      ? 'bg-green-600'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
                >
                  <Save className="w-5 h-5" />
                  <span>{saved ? 'Saved to History!' : 'Save Result'}</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
