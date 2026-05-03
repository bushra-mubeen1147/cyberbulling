import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Twitter, Search, AlertTriangle, CheckCircle, MessageCircle,
  BarChart3, Users, TrendingUp, Smile, Frown, Meh, Save,
  ExternalLink, ChevronDown, ChevronUp, RefreshCw,
  Send, Bell, Download, FileText,
} from 'lucide-react';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';
import Tooltip from '../components/Tooltip';
import { twitterAPI, analysisAPI, historyAPI } from '../api/api.js';
import { useAuth } from '../context/AuthProvider.jsx';

// ── Shared helpers ────────────────────────────────────────────────────────────

const SCORE_COLOR = (s) => s >= 0.7 ? 'text-red-500' : s >= 0.4 ? 'text-yellow-500' : 'text-green-500';
const SCORE_BG    = (s) => s >= 0.7 ? 'bg-red-500'   : s >= 0.4 ? 'bg-yellow-500'   : 'bg-green-500';
const SCORE_LABEL = (s) => s >= 0.7 ? 'High Risk'    : s >= 0.4 ? 'Moderate'        : 'Safe';
const SENTIMENT_ICON = (s) =>
  s === 'positive' ? <Smile className="w-4 h-4 text-green-500" /> :
  s === 'negative' ? <Frown className="w-4 h-4 text-red-500"  /> :
                     <Meh   className="w-4 h-4 text-yellow-500"/>;

function ScoreBar({ label, value, darkMode }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
        <span className={`text-xs font-bold ${SCORE_COLOR(value)}`}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className={`h-2 rounded-full transition-all duration-500 ${SCORE_BG(value)}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, darkMode }) {
  return (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4 text-white" /></div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  );
}

// ── Tweet card (Twitter tab) ──────────────────────────────────────────────────

function TweetCard({ tweet, darkMode, onSave, saving, saved }) {
  const [expanded, setExpanded] = useState(false);
  const { analysis } = tweet;
  const riskLevel   = SCORE_LABEL(analysis.toxicity_score);
  const borderColor = analysis.toxicity_score >= 0.7 ? 'border-l-red-500' :
                      analysis.toxicity_score >= 0.4 ? 'border-l-yellow-500' : 'border-l-green-500';

  return (
    <div className={`rounded-xl border border-l-4 ${borderColor} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tweet.text}</p>
            <div className={`flex items-center gap-3 mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {tweet.created_at && <span>{new Date(tweet.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              {tweet.metrics?.like_count     !== undefined && <span>♥ {tweet.metrics.like_count.toLocaleString()}</span>}
              {tweet.metrics?.retweet_count  !== undefined && <span>↺ {tweet.metrics.retweet_count.toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              riskLevel === 'High Risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              riskLevel === 'Moderate'  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>{riskLevel}</span>
            <button onClick={() => setExpanded(!expanded)} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">{SENTIMENT_ICON(analysis.sentiment)}<span className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analysis.sentiment}</span></div>
          <div className="flex items-center gap-1.5"><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tox</span><span className={`text-xs font-bold ${SCORE_COLOR(analysis.toxicity_score)}`}>{(analysis.toxicity_score * 100).toFixed(0)}%</span></div>
          <div className="flex items-center gap-1.5"><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bully</span><span className={`text-xs font-bold ${SCORE_COLOR(analysis.cyberbullying_prob)}`}>{(analysis.cyberbullying_prob * 100).toFixed(0)}%</span></div>
          {analysis.sarcasm && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium">Sarcasm</span>}
        </div>
      </div>

      {expanded && (
        <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 bg-gray-50'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ScoreBar label="Toxicity Score" value={analysis.toxicity_score} darkMode={darkMode} />
            <ScoreBar label="Cyberbullying Probability" value={analysis.cyberbullying_prob} darkMode={darkMode} />
          </div>
          {saved
            ? <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"><CheckCircle className="w-3.5 h-3.5" />Saved to History</span>
            : <button onClick={() => onSave(tweet)} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"><Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save to History'}</button>
          }
        </div>
      )}
    </div>
  );
}

// ── Tab: Analyze Text ─────────────────────────────────────────────────────────

function AnalyzeTextTab({ darkMode }) {
  const { user } = useAuth();
  const [text, setText]         = useState('');
  const [urlField, setUrlField] = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const maxChars = 1000;

  const sampleTexts = [
    'You are doing great work! Keep pushing forward, the world needs more positivity like yours.',
    'Stop spreading lies, nobody cares about your fake stories. This platform is better without that.',
    'I totally disagree with your point, but I appreciate how respectfully you presented it.',
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) { setError('Please enter some text to analyze'); return; }
    setLoading(true); setSaved(false); setError('');
    try {
      const res = await analysisAPI.analyze(text);
      setResult(res.data.data);
      const tox = res.data.data.toxicity_score * 100;
      const bul = res.data.data.cyberbullying_prob * 100;
      if (tox > 70 || bul > 70) { setShowAlert(true); setTimeout(() => setShowAlert(false), 8000); }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!user) { setError('Please log in to save history'); return; }
    try {
      await historyAPI.add({ text, toxicity_score: result.toxicity_score, cyberbullying_prob: result.cyberbullying_prob, sarcasm: result.sarcasm, sentiment: result.sentiment, tweet_url: urlField || null });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    }
  };

  const exportToPDF = () => {
    if (!result) return;
    const tox = (result.toxicity_score * 100).toFixed(1);
    const bul = (result.cyberbullying_prob * 100).toFixed(1);
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>SafeText AI Report</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}.header{border-bottom:3px solid #3b82f6;padding-bottom:20px;margin-bottom:30px}.section{margin:25px 0;padding:20px;background:#f9fafb;border-radius:8px}.metric{display:flex;justify-content:space-between;margin:10px 0}.high{color:#dc2626}.medium{color:#f59e0b}.low{color:#16a34a}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px}</style>
      </head><body>
      <div class="header"><h1>SafeText AI — Analysis Report</h1><p>Generated ${new Date().toLocaleString()}</p></div>
      <div class="section"><h2>Analyzed Text</h2><p>${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p></div>
      <div class="section"><h2>Results</h2>
        <div class="metric"><span>Toxicity Score</span><span class="${tox>70?'high':tox>40?'medium':'low'}">${tox}%</span></div>
        <div class="metric"><span>Cyberbullying Probability</span><span class="${bul>70?'high':bul>40?'medium':'low'}">${bul}%</span></div>
        <div class="metric"><span>Sentiment</span><span>${result.sentiment}</span></div>
        <div class="metric"><span>Sarcasm</span><span>${result.sarcasm?'Detected':'Not Detected'}</span></div>
      </div>
      <div class="footer"><p>SafeText AI — Making the internet safer.</p></div>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {showAlert && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <Bell className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">High Risk Content Detected</p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">This content shows high levels of toxicity or cyberbullying. Review carefully.</p>
          </div>
          <button onClick={() => setShowAlert(false)} className="text-orange-500 hover:text-orange-700 text-lg leading-none">×</button>
        </motion.div>
      )}

      {/* Input card */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm space-y-4`}>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Text to Analyze <span className="text-red-500">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Enter or paste text to check for toxicity, cyberbullying, sentiment..."
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5 text-xs">
            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Max {maxChars} characters</span>
            <span className={`font-medium ${text.length >= maxChars ? 'text-red-500' : text.length > 800 ? 'text-yellow-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{text.length}/{maxChars}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}>
              Sample Text
            </button>
            {text && (
              <button onClick={() => { setText(''); setResult(null); setSaved(false); setError(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tweet URL <span className={`font-normal text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(optional)</span></label>
          <input type="url" value={urlField} onChange={(e) => setUrlField(e.target.value)} placeholder="https://twitter.com/..." className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'}`} />
        </div>

        <button onClick={handleAnalyze} disabled={loading || !text.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {loading ? 'Analyzing…' : 'Analyze Text'}
        </button>
      </div>

      {loading && <Spinner />}

      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <ResultCard result={result} darkMode={darkMode} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-1 font-medium items-center">
                <span className="flex items-center gap-2">Toxicity Score<Tooltip content="Measures harmful, rude, or disrespectful content" darkMode={darkMode} /></span>
                <span>{(result.toxicity_score * 100).toFixed(1)}%</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-600" style={{ width: `${Math.min(result.toxicity_score * 100, 100)}%` }} />
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-1 font-medium items-center">
                <span className="flex items-center gap-2">Cyberbullying Probability<Tooltip content="Likelihood of bullying or harassment" darkMode={darkMode} /></span>
                <span>{(result.cyberbullying_prob * 100).toFixed(1)}%</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${Math.min(result.cyberbullying_prob * 100, 100)}%` }} />
              </div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} col-span-full`}>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-1.5`}>Sentiment: {result.sentiment}<Tooltip content="Overall emotional tone" darkMode={darkMode} /></span>
                <span className={`px-2 py-1 rounded-md font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center gap-1.5`}>Sarcasm: {result.sarcasm ? 'Detected' : 'None'}<Tooltip content="Sarcastic language may hide true meaning" darkMode={darkMode} /></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            {user && (
              <button onClick={handleSave} disabled={saved}
                className={`flex items-center justify-center gap-2 px-5 py-3 ${saved ? 'bg-green-600' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-60`}>
                <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Result'}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab: Twitter / X URL Analysis ────────────────────────────────────────────

function TwitterTab({ darkMode }) {
  const { user } = useAuth();
  const [url, setUrl]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [savingId, setSavingId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [sortBy, setSortBy]     = useState('toxicity');
  const [autoSave, setAutoSave] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const _saveOne = async (tweet, tweetUrl) => {
    if (!user) return false;
    try {
      await historyAPI.add({ text: tweet.text, toxicity_score: tweet.analysis.toxicity_score, cyberbullying_prob: tweet.analysis.cyberbullying_prob, sarcasm: tweet.analysis.sarcasm, sentiment: tweet.analysis.sentiment, tweet_url: tweetUrl || `https://twitter.com/i/web/status/${tweet.id}` });
      return true;
    } catch { return false; }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null); setSavedIds(new Set()); setSavedCount(0);
    try {
      const res = await twitterAPI.analyzeUrl(url.trim());
      const data = res.data?.data || null;
      setResult(data);
      if (autoSave && user && data?.featured_tweet) {
        const ok = await _saveOne(data.featured_tweet, data.url);
        if (ok) { setSavedIds(new Set([data.featured_tweet.id])); setSavedCount(1); }
      }
    } catch (err) {
      setError(!err.response ? 'Cannot connect to the backend server.' : err.response?.data?.error || `Request failed (${err.response?.status}).`);
    } finally { setLoading(false); }
  };

  const handleSave = async (tweet) => {
    if (!user) return;
    setSavingId(tweet.id);
    const ok = await _saveOne(tweet);
    if (ok) setSavedIds(prev => new Set([...prev, tweet.id]));
    setSavingId(null);
  };

  const handleSaveAll = async () => {
    if (!user || !result) return;
    setSavingAll(true);
    let count = savedIds.size;
    if (result.featured_tweet && !savedIds.has(result.featured_tweet.id)) {
      const ok = await _saveOne(result.featured_tweet, result.url);
      if (ok) { setSavedIds(prev => new Set([...prev, result.featured_tweet.id])); count++; }
    }
    for (const t of (result.tweets || [])) {
      if (!savedIds.has(t.id)) {
        const ok = await _saveOne(t);
        if (ok) { setSavedIds(prev => new Set([...prev, t.id])); count++; }
      }
    }
    setSavedCount(count);
    setSavingAll(false);
  };

  const sortedTweets = result?.tweets
    ? [...result.tweets].sort((a, b) => sortBy === 'toxicity' ? b.analysis.toxicity_score - a.analysis.toxicity_score : sortBy === 'cyberbullying' ? b.analysis.cyberbullying_prob - a.analysis.cyberbullying_prob : new Date(b.created_at || 0) - new Date(a.created_at || 0))
    : [];
  const agg = result?.aggregate;

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Twitter / X URL</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Twitter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://twitter.com/username/status/123  or  https://x.com/username"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`} />
          </div>
          <button onClick={handleAnalyze} disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-sm">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Supports tweet links and profile URLs on twitter.com and x.com</p>
          {user && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => setAutoSave(v => !v)} className={`relative w-9 h-5 rounded-full transition-colors ${autoSave ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSave ? 'translate-x-4' : ''}`} />
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Auto-save</span>
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <>
          {user && (
            <div className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex items-center gap-2">
                {savedCount > 0
                  ? <><CheckCircle className="w-4 h-4 text-green-500" /><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}><strong>{savedCount}</strong> tweet{savedCount !== 1 ? 's' : ''} saved to History</span></>
                  : <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Save results to History &amp; Statistics</span>
                }
              </div>
              <button onClick={handleSaveAll} disabled={savingAll} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                <Save className="w-3.5 h-3.5" />{savingAll ? 'Saving…' : 'Save All'}
              </button>
            </div>
          )}

          {result.note && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{result.note}</p>
            </div>
          )}

          {result.author && (
            <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {result.author.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.author.name}</h2>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{result.author.username}</span>
                    <a href={`https://twitter.com/${result.author.username}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600"><ExternalLink className="w-3.5 h-3.5" /></a>
                  </div>
                  {result.author.description && <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{result.author.description}</p>}
                  {result.author.metrics && (
                    <div className={`flex gap-4 mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {result.author.metrics.followers_count !== undefined && <span><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{result.author.metrics.followers_count?.toLocaleString()}</strong> Followers</span>}
                      {result.author.metrics.following_count !== undefined && <span><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{result.author.metrics.following_count?.toLocaleString()}</strong> Following</span>}
                      {result.author.metrics.tweet_count    !== undefined && <span><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{result.author.metrics.tweet_count?.toLocaleString()}</strong>    Tweets</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {result.featured_tweet && (
            <div className={`p-5 rounded-xl border-2 border-blue-500/40 ${darkMode ? 'bg-gray-800' : 'bg-blue-50/40'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-3"><Twitter className="w-4 h-4 text-blue-500" /><span className="text-xs font-semibold uppercase tracking-wide text-blue-500">Analyzed Tweet</span></div>
              <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{result.featured_tweet.text}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Toxicity', result.featured_tweet.analysis.toxicity_score], ['Cyberbullying', result.featured_tweet.analysis.cyberbullying_prob]].map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lbl}</p>
                    <p className={`text-lg font-bold ${SCORE_COLOR(val)}`}>{(val * 100).toFixed(0)}%</p>
                  </div>
                ))}
                <div className="text-center">
                  <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sarcasm</p>
                  <p className={`text-lg font-bold ${result.featured_tweet.analysis.sarcasm ? 'text-purple-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.featured_tweet.analysis.sarcasm ? 'Yes' : 'No'}</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment</p>
                  <div className="flex items-center justify-center gap-1">{SENTIMENT_ICON(result.featured_tweet.analysis.sentiment)}<p className={`text-sm font-semibold capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{result.featured_tweet.analysis.sentiment}</p></div>
                </div>
              </div>
            </div>
          )}

          {agg && agg.total_tweets > 0 && (
            <>
              <div>
                <h2 className={`text-base font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Summary — {agg.total_tweets} tweets analyzed</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={AlertTriangle} label="Avg Toxicity"   value={`${(agg.avg_toxicity * 100).toFixed(1)}%`}    sub={`${agg.toxic_tweet_count} flagged`}      color="bg-red-500"    darkMode={darkMode} />
                  <StatCard icon={Users}         label="Cyberbullying"  value={`${(agg.avg_cyberbullying * 100).toFixed(1)}%`} sub={`${agg.cyberbullying_tweet_count} detected`} color="bg-orange-500" darkMode={darkMode} />
                  <StatCard icon={MessageCircle} label="Sarcasm"        value={`${agg.sarcasm_count}`}                        sub={`${(agg.sarcasm_rate * 100).toFixed(0)}% of tweets`} color="bg-purple-500" darkMode={darkMode} />
                  <StatCard icon={TrendingUp}    label="Max Toxicity"   value={`${(agg.max_toxicity * 100).toFixed(0)}%`}     sub="Highest single tweet"                    color="bg-pink-600"   darkMode={darkMode} />
                </div>
              </div>

              <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Overall Risk Profile</h3>
                <div className="space-y-4">
                  <ScoreBar label="Average Toxicity" value={agg.avg_toxicity} darkMode={darkMode} />
                  <ScoreBar label="Average Cyberbullying Probability" value={agg.avg_cyberbullying} darkMode={darkMode} />
                  <ScoreBar label="Toxicity Rate (tweets > 50%)" value={agg.toxicity_rate} darkMode={darkMode} />
                  <ScoreBar label="Cyberbullying Rate (tweets > 50%)" value={agg.cyberbullying_rate} darkMode={darkMode} />
                  <ScoreBar label="Sarcasm Rate" value={agg.sarcasm_rate} darkMode={darkMode} />
                </div>
                {agg.sentiment_breakdown && Object.keys(agg.sentiment_breakdown).length > 0 && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment Breakdown</p>
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(agg.sentiment_breakdown).map(([s, count]) => (
                        <div key={s} className="flex items-center gap-1.5">{SENTIMENT_ICON(s)}<span className={`text-xs capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s}</span><span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({count})</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {agg.avg_toxicity >= 0.5 ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div><p className="text-sm font-semibold text-red-700 dark:text-red-400">High Cyberbullying Risk Detected</p><p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Average toxicity {(agg.avg_toxicity * 100).toFixed(0)}% — {agg.toxic_tweet_count}/{agg.total_tweets} tweets flagged.</p></div>
                </div>
              ) : agg.avg_toxicity >= 0.3 ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Moderate risk detected. Some tweets show signs of harassment or negative content.</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-400">Content appears mostly safe. Low toxicity levels detected.</p>
                </div>
              )}
            </>
          )}

          {sortedTweets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tweet History ({sortedTweets.length})</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{savedIds.size} saved</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}>
                    <option value="toxicity">Sort: Toxicity</option>
                    <option value="cyberbullying">Sort: Cyberbullying</option>
                    <option value="date">Sort: Date</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {sortedTweets.map((tweet, i) => (
                  <TweetCard key={tweet.id || i} tweet={tweet} darkMode={darkMode} onSave={handleSave} saving={savingId === tweet.id} saved={savedIds.has(tweet.id)} />
                ))}
              </div>
            </div>
          )}

          {result.tweets?.length === 0 && (
            <div className={`p-6 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No recent tweets found for this account.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Page shell with tabs ──────────────────────────────────────────────────────

export default function TwitterAnalysis({ darkMode }) {
  const [tab, setTab] = useState('text');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-800/30' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'}`}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Twitter className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analysis</h1>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Analyze free text or paste a Twitter / X URL to detect toxicity, cyberbullying, and sentiment.
        </p>
      </div>

      {/* Tab switcher */}
      <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} w-fit`}>
        <button
          onClick={() => setTab('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'text'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
              : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Analyze Text
        </button>
        <button
          onClick={() => setTab('twitter')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'twitter'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
              : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Twitter className="w-4 h-4" /> Twitter / X URL
        </button>
      </div>

      {/* Tab content */}
      {tab === 'text' ? <AnalyzeTextTab darkMode={darkMode} /> : <TwitterTab darkMode={darkMode} />}
    </div>
  );
}
