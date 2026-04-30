import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Save, AlertTriangle, CheckCircle, TrendingUp, MessageSquare, BarChart3, Bell, Download, Info } from 'lucide-react';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';
import Tooltip from '../components/Tooltip';
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
  const [showAlert, setShowAlert] = useState(false);
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
      
      // Show alert for high toxicity/cyberbullying
      const toxicityScore = response.data.data.toxicity_score * 100;
      const cyberbullyingScore = response.data.data.cyberbullying_prob * 100;
      if (toxicityScore > 70 || cyberbullyingScore > 70) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 8000); // Auto dismiss after 8 seconds
      }
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

  const exportToPDF = () => {
    if (!result) return;
    
    // Create a simple HTML representation for printing
    const printWindow = window.open('', '_blank');
    const toxicityScore = (result.toxicity_score * 100).toFixed(1);
    const cyberbullyingScore = (result.cyberbullying_prob * 100).toFixed(1);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SafeText AI - Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1f2937; margin: 0; }
            .header p { color: #6b7280; margin: 5px 0 0 0; }
            .section { margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .section h2 { color: #374151; margin: 0 0 15px 0; font-size: 18px; }
            .metric { display: flex; justify-between; margin: 10px 0; }
            .metric-label { font-weight: 600; color: #4b5563; }
            .metric-value { font-weight: 700; }
            .high { color: #dc2626; }
            .medium { color: #f59e0b; }
            .low { color: #16a34a; }
            .text-box { background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛡️ SafeText AI - Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h2>📝 Analyzed Text</h2>
            <div class="text-box">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          
          <div class="section">
            <h2>📊 Analysis Results</h2>
            <div class="metric">
              <span class="metric-label">Toxicity Score:</span>
              <span class="metric-value ${toxicityScore > 70 ? 'high' : toxicityScore > 40 ? 'medium' : 'low'}">${toxicityScore}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Cyberbullying Probability:</span>
              <span class="metric-value ${cyberbullyingScore > 70 ? 'high' : cyberbullyingScore > 40 ? 'medium' : 'low'}">${cyberbullyingScore}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Sentiment:</span>
              <span class="metric-value">${result.sentiment || 'Neutral'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Sarcasm:</span>
              <span class="metric-value">${result.sarcasm ? 'Detected' : 'Not Detected'}</span>
            </div>
          </div>
          
          <div class="section">
            <h2>ℹ️ Interpretation</h2>
            <p>${result.cyberbullying_detected 
              ? '⚠️ <strong>Warning:</strong> This content shows signs of potentially harmful or cyberbullying behavior.' 
              : '✅ <strong>Safe:</strong> No significant issues were detected in this content.'
            }</p>
          </div>
          
          <div class="footer">
            <p>This report was generated by SafeText AI - Making the internet safer, one text at a time.</p>
            <p>© ${new Date().getFullYear()} SafeText AI. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const wrapperClass = inDashboard
    ? ''
    : `${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} min-h-screen pt-16`;

  return (
    <div className={`${wrapperClass}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${inDashboard ? 'max-w-full py-6' : 'max-w-7xl py-12'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className={`font-bold mb-2 ${inDashboard ? 'text-2xl' : 'text-4xl'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analyze Text
            </h1>
            <p className={`${inDashboard ? 'text-sm' : 'text-lg'} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter text to detect toxicity, cyberbullying, and sentiment
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* High Score Alert */}
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-sm flex items-start gap-3"
            >
              <Bell className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold mb-1">⚠️ High Risk Content Detected</p>
                <p className="text-xs">This content shows high levels of toxicity or cyberbullying. Please review carefully and consider reporting if necessary.</p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-200"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* Main Content */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-xl shadow-lg ${inDashboard ? 'p-6' : 'p-8'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Text to Analyze <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                  placeholder="Enter or paste the text you want to analyze for toxicity, cyberbullying, sentiment..."
                  rows={inDashboard ? 6 : 7}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none transition-all resize-none`}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max {maxChars} characters.</span>
                  <span className={`font-medium ${text.length >= maxChars ? 'text-red-500' : text.length > 800 ? 'text-yellow-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {text.length}/{maxChars}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button 
                    type="button" 
                    onClick={applySample} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } transition-all`}
                  >
                    Sample Text
                  </button>
                  {text && (
                    <button 
                      type="button" 
                      onClick={() => { setText(''); setResult(null); setSaved(false); setError(''); }} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } transition-all`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tweet URL */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Tweet URL (Optional)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none transition-all`}
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className={`w-full px-6 ${inDashboard ? 'py-3.5' : 'py-4'} bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform ${
                  loading || !text.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
                } transition-all duration-200 flex items-center justify-center gap-2`}
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
                  <div className="flex justify-between mb-1 font-medium items-center">
                    <span className="flex items-center gap-2">
                      Toxicity Score
                      <Tooltip content="Measures harmful, rude, or disrespectful content" darkMode={darkMode} />
                    </span>
                    <span>{(result.toxicity_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-600`} style={{ width: `${Math.min(result.toxicity_score * 100,100)}%` }}></div>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Higher means more potentially harmful content.</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between mb-1 font-medium items-center">
                    <span className="flex items-center gap-2">
                      Cyberbullying Probability
                      <Tooltip content="Likelihood of bullying, harassment, or intimidation" darkMode={darkMode} />
                    </span>
                    <span>{(result.cyberbullying_prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600`} style={{ width: `${Math.min(result.cyberbullying_prob * 100,100)}%` }}></div>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Likelihood text contains bullying / harassment.</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} col-span-full`}>
                  <div className="flex flex-wrap gap-4 items-center text-xs">
                    <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-1.5`}>
                      Sentiment: {result.sentiment}
                      <Tooltip content="Overall emotional tone (positive, negative, or neutral)" darkMode={darkMode} />
                    </span>
                    <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-1.5`}>
                      Sarcasm: {result.sarcasm ? 'Detected' : 'None'}
                      <Tooltip content="Sarcastic language may hide true meaning or severity" darkMode={darkMode} />
                    </span>
                  </div>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sentiment helps contextualize toxicity; sarcasm can mask intent.</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex flex-col sm:flex-row justify-center gap-3"
              >
                <button
                  onClick={exportToPDF}
                  className={`px-6 ${inDashboard ? 'py-3' : 'py-4'} ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
                >
                  <Download className="w-5 h-5" />
                  <span>Export as PDF</span>
                </button>
                
                {user && (
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`px-6 ${inDashboard ? 'py-3' : 'py-4'} ${
                      saved
                        ? 'bg-green-600'
                        : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform ${saved ? '' : 'hover:scale-105'} transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60`}
                  >
                    <Save className="w-5 h-5" />
                    <span>{saved ? 'Saved to History!' : 'Save Result'}</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
