import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Save } from 'lucide-react';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';
import { analysisAPI } from '../api/api';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';
import { useLocation } from 'react-router-dom';

export default function Analyze({ darkMode }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');
  const maxChars = 1000;
  const sampleTexts = [
    'You are doing great work! Keep pushing forward, the world needs more positivity like yours.',
    'Stop spreading lies, nobody cares about your fake stories. This platform is better without that.',
    'I totally disagree with your point, but I appreciate how respectfully you presented it.',
  ];

  const applySample = () => {
    const next = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(next);
  };

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

  const wrapperClass = inDashboard
    ? ''
    : `${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} min-h-screen pt-16`;

  return (
    <div className={`${wrapperClass}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${inDashboard ? 'max-w-4xl py-6' : 'max-w-5xl py-12'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={`font-bold mb-2 ${inDashboard ? 'text-2xl' : 'text-4xl'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analyze Text
          </h1>
          <p className={`${inDashboard ? 'text-sm' : 'text-lg'} mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter text to detect toxicity, cyberbullying, and sentiment
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow ${inDashboard ? 'p-5' : 'p-8'} mb-6`}>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Text to Analyze *
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                  placeholder="Enter or paste the text you want to analyze for toxicity, cyberbullying, sentiment..."
                  rows={inDashboard ? 5 : 6}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max {maxChars} characters.</span>
                  <span className={`${text.length >= maxChars ? 'text-red-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{text.length}/{maxChars}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={applySample} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}>Sample Text</button>
                  {text && (
                    <button type="button" onClick={() => { setText(''); setResult(null); setSaved(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}>Clear</button>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                disabled={loading || !text.trim()}
                className={`w-full px-6 ${inDashboard ? 'py-3' : 'py-4'} bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform ${loading || !text.trim() ? '' : 'hover:scale-[1.02]'} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Text'}</span>
              </button>
            </div>
          </div>

          {loading && <Spinner />}

          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ResultCard result={result} darkMode={darkMode} />
              {/* Metrics Summary */}
              <div className={`mt-6 grid gap-4 ${inDashboard ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'} text-sm`}>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between mb-1 font-medium"><span>Toxicity Score</span><span>{(result.toxicity_score * 100).toFixed(1)}%</span></div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-600`} style={{ width: `${Math.min(result.toxicity_score * 100,100)}%` }}></div>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Higher means more potentially harmful content.</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between mb-1 font-medium"><span>Cyberbullying Probability</span><span>{(result.cyberbullying_prob * 100).toFixed(1)}%</span></div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600`} style={{ width: `${Math.min(result.cyberbullying_prob * 100,100)}%` }}></div>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Likelihood text contains bullying / harassment.</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} col-span-full`}>
                  <div className="flex flex-wrap gap-4 items-center text-xs">
                    <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Sentiment: {result.sentiment}</span>
                    <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Sarcasm: {result.sarcasm ? 'Detected' : 'None'}</span>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sentiment helps contextualize toxicity; sarcasm can mask intent.</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-center"
              >
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`px-6 ${inDashboard ? 'py-3' : 'py-4'} ${
                    saved
                      ? 'bg-green-600'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform ${saved ? '' : 'hover:scale-105'} transition-all duration-200 flex items-center space-x-2 disabled:opacity-60`}
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
