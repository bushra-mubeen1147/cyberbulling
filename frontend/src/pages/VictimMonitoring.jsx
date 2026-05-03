import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { victimAPI, twitterAPI, historyAPI } from '../api/api.js';
import { useAuth } from '../context/AuthProvider.jsx';
import {
  Shield, Plus, Trash2, RefreshCw, ExternalLink, Twitter,
  AlertTriangle, CheckCircle, Clock, Smile, Frown, Meh,
  ChevronDown, ChevronUp, Search, X, Bell, Zap,
  ClipboardPaste, Brain,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SCORE_COLOR = (s) =>
  s >= 0.7 ? 'text-red-500' : s >= 0.4 ? 'text-yellow-500' : 'text-green-500';
const RISK_LABEL  = (s) =>
  s >= 0.7 ? 'High Risk' : s >= 0.4 ? 'Moderate' : 'Safe';
const RISK_BG = (s) =>
  s >= 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  : s >= 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
const SENTIMENT_ICON = (s) =>
  s === 'positive' ? <Smile className="w-3 h-3 text-green-500" />
  : s === 'negative' ? <Frown className="w-3 h-3 text-red-500" />
  : <Meh className="w-3 h-3 text-yellow-500" />;

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : null;
const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  : null;
const isRecent = (iso) => iso && Date.now() - new Date(iso).getTime() < 2 * 60 * 60 * 1000;

function parseTweetUrls(text) {
  const hits = text.match(/https?:\/\/(?:twitter\.com|x\.com)\/[^\s/]+\/status\/\d+/g);
  return hits ? [...new Set(hits)] : [];
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ id, message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(t);
  }, [id, onClose]);
  const colors = { success: 'bg-green-600', warning: 'bg-yellow-600', error: 'bg-red-600', info: 'bg-blue-600' };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm max-w-sm ${colors[type] || colors.info}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" />
       : type === 'error'  ? <AlertTriangle className="w-4 h-4 shrink-0" />
       : <Bell className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={() => onClose(id)} className="opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
    </div>
  );
}

// ── TweetRow ──────────────────────────────────────────────────────────────────

function TweetRow({ tweet, isNew, darkMode }) {
  const risk = Math.max(tweet.toxicity_score || 0, tweet.cyberbullying_prob || 0);
  return (
    <div className={`p-3 rounded-lg border-l-4 relative ${
      risk >= 0.7 ? 'border-l-red-500' : risk >= 0.4 ? 'border-l-yellow-500' : 'border-l-green-500'
    } ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
      {isNew && <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">NEW</span>}
      <p className={`text-xs leading-relaxed mb-2 line-clamp-3 ${isNew ? 'pr-12' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {tweet.input_text}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${RISK_BG(risk)}`}>{RISK_LABEL(risk)}</span>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Tox <span className={`font-semibold ${SCORE_COLOR(tweet.toxicity_score || 0)}`}>{((tweet.toxicity_score || 0) * 100).toFixed(0)}%</span>
        </span>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Bully <span className={`font-semibold ${SCORE_COLOR(tweet.cyberbullying_prob || 0)}`}>{((tweet.cyberbullying_prob || 0) * 100).toFixed(0)}%</span>
        </span>
        {tweet.result_sarcasm && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Sarcasm</span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {SENTIMENT_ICON(tweet.sentiment)}
          {tweet.created_at && <span className={`text-xs ml-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{fmtDate(tweet.created_at)}</span>}
          {tweet.tweet_url && (
            <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 ml-1" title="View original tweet">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VictimCard ────────────────────────────────────────────────────────────────

function VictimCard({ victim, darkMode, onRemove, addToast, refreshTrigger, onPredict }) {
  const [expanded, setExpanded]         = useState(false);
  const [tweets, setTweets]             = useState([]);
  const [tweetsLoaded, setTweetsLoaded] = useState(false);
  const [checking, setChecking]         = useState(false);
  const [newIds, setNewIds]             = useState(new Set());
  const [newCount, setNewCount]         = useState(0);
  const [tweetCount, setTweetCount]     = useState(victim.tweet_count || 0);
  const [lastChecked, setLastChecked]   = useState(victim.last_checked_at ? new Date(victim.last_checked_at) : null);
  const [checkNote, setCheckNote]       = useState(null);

  // Paste-and-bulk-analyze state
  const [showPaste, setShowPaste]       = useState(false);
  const [pasteText, setPasteText]       = useState('');
  const [analyzing, setAnalyzing]       = useState(false);
  const [progress, setProgress]         = useState({ done: 0, total: 0 });
  const [pasteError, setPasteError]     = useState('');

  const loadTweets = useCallback(async () => {
    try {
      const res = await victimAPI.getTweets(victim.id);
      const d = res.data?.data;
      if (d?.tweets) { setTweets(d.tweets); setTweetCount(d.tweets.length); }
    } catch {}
    setTweetsLoaded(true);
  }, [victim.id]);

  // Reload when parent's auto-check found new tweets for us
  useEffect(() => {
    if (!refreshTrigger) return;
    loadTweets();
    setNewCount((n) => n + refreshTrigger.count);
    setNewIds((prev) => new Set([...prev, ...(refreshTrigger.urls || [])]));
    setLastChecked(new Date());
    if (!expanded) setExpanded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleExpand = () => {
    if (!expanded && !tweetsLoaded) loadTweets();
    setExpanded((v) => !v);
  };

  const handleCheck = async () => {
    setChecking(true);
    setCheckNote(null);
    try {
      const res = await victimAPI.checkTweets(victim.id);
      const d = res.data?.data;
      setLastChecked(new Date());
      if (d?.note) setCheckNote(d.note);

      if (d?.new_tweets?.length > 0) {
        const freshUrls = new Set(d.new_tweets.map((t) => t.tweet_url));
        setNewIds((prev) => new Set([...prev, ...freshUrls]));
        setNewCount((n) => n + d.new_tweets.length);
        addToast(`${d.new_tweets.length} new tweet${d.new_tweets.length > 1 ? 's' : ''} from @${victim.twitter_username}`, 'success');
        await loadTweets();
        if (!expanded) setExpanded(true);
      } else if (!d?.note) {
        addToast(`No new tweets from @${victim.twitter_username}`, 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Check failed', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleBulkAnalyze = async () => {
    const urls = parseTweetUrls(pasteText);
    if (!urls.length) {
      setPasteError('No valid tweet URLs found. URLs must look like https://twitter.com/username/status/123');
      return;
    }
    setAnalyzing(true);
    setPasteError('');
    setProgress({ done: 0, total: urls.length });
    const freshUrls = new Set();
    let ok = 0;
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await twitterAPI.analyzeUrl(urls[i]);
        const ft = res.data?.data?.featured_tweet;
        if (ft) {
          await historyAPI.add({
            text: ft.text, toxicity_score: ft.analysis.toxicity_score,
            cyberbullying_prob: ft.analysis.cyberbullying_prob,
            sarcasm: ft.analysis.sarcasm, sentiment: ft.analysis.sentiment,
            tweet_url: urls[i],
          });
          freshUrls.add(urls[i]);
          ok++;
        }
      } catch {}
      setProgress({ done: i + 1, total: urls.length });
    }
    await loadTweets();
    setNewIds((prev) => new Set([...prev, ...freshUrls]));
    setNewCount((n) => n + ok);
    setPasteText(''); setShowPaste(false); setAnalyzing(false);
    setProgress({ done: 0, total: 0 });
    if (ok > 0) {
      addToast(`${ok} tweet${ok > 1 ? 's' : ''} analyzed for @${victim.twitter_username}`, 'success');
      if (!expanded) setExpanded(true);
    } else {
      setPasteError('None of the URLs could be fetched. They may be private, deleted, or invalid.');
    }
  };

  const avatarGradient =
    victim.twitter_username.charCodeAt(0) % 3 === 0 ? 'from-blue-400 to-cyan-500'
    : victim.twitter_username.charCodeAt(0) % 3 === 1 ? 'from-purple-400 to-pink-500'
    : 'from-green-400 to-teal-500';
  const initials = (victim.display_name || victim.twitter_username).slice(0, 2).toUpperCase();

  return (
    <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
      <div className="p-4">
        {/* ── Profile header ── */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-base shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>@{victim.twitter_username}</span>
              {victim.display_name && victim.display_name !== victim.twitter_username && (
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{victim.display_name}</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {tweetCount} tweet{tweetCount !== 1 ? 's' : ''}
              </span>
              {newCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">{newCount} NEW</span>
              )}
            </div>
            {lastChecked ? (
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Clock className="w-3 h-3 inline mr-1" />Last checked {fmtTime(lastChecked.toISOString())}
              </p>
            ) : (
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Not checked yet</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a href={`https://twitter.com/${victim.twitter_username}`} target="_blank" rel="noopener noreferrer"
              title="Open Twitter profile"
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-blue-900/30 text-gray-500 hover:text-blue-400' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500'}`}>
              <Twitter className="w-4 h-4" />
            </a>
            <button onClick={() => onRemove(victim.id)} title="Remove"
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900/30 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {/* Predict behavior */}
          <button onClick={() => onPredict(victim.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              darkMode ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-700/50'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200'
            }`}>
            <Brain className="w-3 h-3" />
            Predict
          </button>

          {/* PRIMARY: auto-fetch via Nitter RSS */}
          <button onClick={handleCheck} disabled={checking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
              darkMode ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-700/50'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
            }`}>
            {checking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {checking ? 'Checking...' : 'Check for New Tweets'}
          </button>

          {/* SECONDARY: paste bulk URLs */}
          <button onClick={() => { setShowPaste((v) => !v); setPasteError(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showPaste
                ? darkMode ? 'bg-purple-600/30 text-purple-400 border border-purple-700/50' : 'bg-purple-100 text-purple-600 border border-purple-200'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
            }`}>
            <ClipboardPaste className="w-3 h-3" />
            Paste URLs
          </button>

          <button onClick={handleExpand}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto ${
              darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide' : `${tweetCount > 0 ? tweetCount + ' ' : ''}Tweet${tweetCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Check note (e.g. profile unavailable) */}
        {checkNote && (
          <div className={`mt-2 flex items-start gap-2 p-2.5 rounded-lg text-xs ${
            darkMode ? 'bg-yellow-900/20 border border-yellow-800/40 text-yellow-400'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{checkNote}</span>
          </div>
        )}

        {/* ── Paste & bulk-analyze panel ── */}
        {showPaste && (
          <div className={`mt-3 p-4 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50/60 border-blue-200'}`}>
            <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Paste tweet URLs from @{victim.twitter_username} — one per line or all at once
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`https://twitter.com/${victim.twitter_username}/status/123...\nhttps://twitter.com/${victim.twitter_username}/status/456...`}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {pasteError && <p className="text-xs text-red-500 mt-1">{pasteError}</p>}
            <button onClick={handleBulkAnalyze} disabled={analyzing || !pasteText.trim()}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50 transition-colors">
              {analyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              {analyzing ? `Analyzing ${progress.done}/${progress.total}...` : `Analyze${parseTweetUrls(pasteText).length > 0 ? ` ${parseTweetUrls(pasteText).length} URL${parseTweetUrls(pasteText).length !== 1 ? 's' : ''}` : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Expanded tweet list ── */}
      {expanded && (
        <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50'} p-4`}>
          {!tweetsLoaded ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className={`w-5 h-5 animate-spin ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          ) : tweets.length === 0 ? (
            <div className="text-center py-6">
              <Twitter className={`w-8 h-8 mx-auto mb-2 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No tweets yet — click "Check for New Tweets" to fetch them automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tweets.map((t) => (
                <TweetRow key={t.id} tweet={t} isNew={newIds.has(t.tweet_url) || isRecent(t.created_at)} darkMode={darkMode} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function VictimMonitoring({ darkMode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [victims, setVictims]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addInput, setAddInput]     = useState('');
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState('');
  const [toasts, setToasts]         = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [nextCheckIn, setNextCheckIn] = useState(null); // seconds until next auto-check
  // refreshMap[victimId] = { count, urls } — incremented when auto-check finds new tweets for that card
  const [refreshMap, setRefreshMap] = useState({});

  const victimsRef  = useRef(victims);
  const pollingRef  = useRef(null);
  const countdownRef = useRef(null);
  const toastIdRef  = useRef(0);

  useEffect(() => { victimsRef.current = victims; }, [victims]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const loadVictims = useCallback(async () => {
    try {
      const res = await victimAPI.list();
      setVictims(res.data?.data || []);
    } catch { setVictims([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadVictims(); }, [loadVictims]);

  // Auto-check all victims on interval
  const runAutoCheck = useCallback(async () => {
    const list = victimsRef.current;
    if (!list.length) return;
    for (const v of list) {
      try {
        const res = await victimAPI.checkTweets(v.id);
        const d = res.data?.data;
        if (d?.new_tweets?.length > 0) {
          addToast(`${d.new_tweets.length} new tweet${d.new_tweets.length > 1 ? 's' : ''} from @${v.twitter_username}`, 'success');
          setRefreshMap((prev) => ({
            ...prev,
            [v.id]: { count: d.new_tweets.length, urls: d.new_tweets.map((t) => t.tweet_url) },
          }));
        }
      } catch {}
    }
    // Refresh tweet counts in sidebar
    loadVictims();
  }, [addToast, loadVictims]);

  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(pollingRef.current);
      clearInterval(countdownRef.current);
      setNextCheckIn(null);
      return;
    }

    let secondsLeft = POLL_INTERVAL / 1000;
    setNextCheckIn(secondsLeft);

    pollingRef.current  = setInterval(() => {
      runAutoCheck();
      secondsLeft = POLL_INTERVAL / 1000;
    }, POLL_INTERVAL);

    countdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      setNextCheckIn(secondsLeft > 0 ? secondsLeft : POLL_INTERVAL / 1000);
    }, 1000);

    return () => {
      clearInterval(pollingRef.current);
      clearInterval(countdownRef.current);
    };
  }, [autoRefresh, runAutoCheck]);

  const handleAdd = async () => {
    const trimmed = addInput.trim();
    if (!trimmed) return;
    setAdding(true); setAddError('');
    try {
      await victimAPI.add({ username: trimmed });
      setAddInput('');
      await loadVictims();
      addToast('Profile added to monitoring', 'success');
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add profile');
    } finally { setAdding(false); }
  };

  const handleRemove = async (id) => {
    try {
      await victimAPI.remove(id);
      setVictims((prev) => prev.filter((v) => v.id !== id));
      addToast('Profile removed from monitoring', 'info');
    } catch {}
  };

  if (!user) return (
    <div className={`p-10 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <Shield className={`w-12 h-12 mx-auto mb-3 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please log in to use victim monitoring.</p>
    </div>
  );

  const fmtCountdown = (s) => {
    if (!s) return '';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="space-y-6">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={removeToast} />)}
      </div>

      {/* ── Header ── */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-800/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Victim Monitoring</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Add a profile — tweets are fetched automatically, no API key needed
              </p>
            </div>
          </div>

          {/* Auto-check toggle + countdown */}
          <div className="flex items-center gap-3">
            {autoRefresh && nextCheckIn && (
              <span className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Next check in {fmtCountdown(nextCheckIn)}
              </span>
            )}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setAutoRefresh((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-green-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-4' : ''}`} />
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Auto-check every 5 min</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Add victim form ── */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Add a Profile to Monitor
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Twitter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text" value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="@username  or  https://twitter.com/username"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              }`}
            />
          </div>
          <button onClick={handleAdd} disabled={adding || !addInput.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-sm">
            {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? 'Adding...' : 'Add Victim'}
          </button>
        </div>
        {addError && <p className="text-xs text-red-500 mt-2">{addError}</p>}
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Free — uses public Nitter RSS. Tweets are auto-fetched every 5 minutes with no manual copy-paste needed.
        </p>
      </div>

      {/* ── Victims list ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className={`w-6 h-6 animate-spin ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      ) : victims.length === 0 ? (
        <div className={`p-10 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Shield className={`w-12 h-12 mx-auto mb-3 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No profiles monitored yet</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Add a Twitter username above — new tweets will be detected and analyzed automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {victims.length} profile{victims.length !== 1 ? 's' : ''} monitored
          </p>
          {victims.map((v) => (
            <VictimCard
              key={v.id}
              victim={v}
              darkMode={darkMode}
              onRemove={handleRemove}
              addToast={addToast}
              refreshTrigger={refreshMap[v.id] || null}
              onPredict={(id) => navigate(`/dashboard/predictions?victim_id=${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
