import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, AlertTriangle, RefreshCw, ExternalLink, Twitter, MapPin, Clock, Flame, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI, trendsAPI } from '../api/api.js';

// ── Live Twitter Trends ───────────────────────────────────────────────────────

const LOCATIONS = [
  { value: 'worldwide',      label: '🌍 Worldwide' },
  { value: 'united-states',  label: '🇺🇸 United States' },
  { value: 'united-kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'pakistan',       label: '🇵🇰 Pakistan' },
  { value: 'india',          label: '🇮🇳 India' },
  { value: 'australia',      label: '🇦🇺 Australia' },
  { value: 'canada',         label: '🇨🇦 Canada' },
  { value: 'germany',        label: '🇩🇪 Germany' },
  { value: 'france',         label: '🇫🇷 France' },
  { value: 'japan',          label: '🇯🇵 Japan' },
  { value: 'brazil',         label: '🇧🇷 Brazil' },
  { value: 'south-africa',   label: '🇿🇦 South Africa' },
  { value: 'nigeria',        label: '🇳🇬 Nigeria' },
];

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

function fmtAge(seconds) {
  if (!seconds) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function fmtCountdown(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60), rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

function LiveTrends({ darkMode }) {
  const [location, setLocation]   = useState('worldwide');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const load = useCallback(async (loc) => {
    setLoading(true);
    setError('');
    try {
      const res = await trendsAPI.getLive(loc);
      setData(res.data?.data || null);
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trends. Try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(location);
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);

    intervalRef.current  = setInterval(() => load(location), REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => setCountdown((c) => Math.max(0, c - 1000)), 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [location, load]);

  const rankBg = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-700';
    if (rank <= 10) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`p-5 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-blue-900/30 to-cyan-900/20' : 'border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Trending on Twitter / X
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live trends · auto-refreshes every 15 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Location selector */}
            <div className="flex items-center gap-1.5">
              <MapPin className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                {LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Countdown + refresh */}
            <div className="flex items-center gap-2">
              {!loading && data && (
                <span className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Clock className="w-3 h-3" />
                  {fmtAge(data.cache_age_seconds)} · next in {fmtCountdown(countdown)}
                </span>
              )}
              <button
                onClick={() => load(location)}
                disabled={loading}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-50`}
                title="Refresh trends"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <RefreshCw className={`w-6 h-6 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fetching live trends…</p>
          </div>
        ) : error ? (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'bg-red-900/20 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
              <button onClick={() => load(location)} className="text-xs text-blue-500 underline mt-1">Retry</button>
            </div>
          </div>
        ) : data?.trends?.length > 0 ? (
          <>
            {/* Trend grid — 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.trends.map((trend) => (
                <a
                  key={trend.rank}
                  href={trend.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-blue-600/50'
                      : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rankBg(trend.rank)} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                    {trend.rank <= 3 ? <Flame className="w-3.5 h-3.5" /> : `${trend.rank}`}
                  </div>

                  {/* Trend info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate group-hover:text-blue-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {trend.name}
                    </p>
                    {trend.tweet_count && (
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {trend.tweet_count} Tweets
                      </p>
                    )}
                  </div>

                  <ExternalLink className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </a>
              ))}
            </div>

            <p className={`text-xs mt-4 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Source: trends24.in — click any trend to search it on Twitter/X
            </p>
          </>
        ) : (
          <p className={`text-center text-sm py-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No trends available for this location right now.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Your Analysis Patterns ────────────────────────────────────────────────────

const PATTERN_DEFS = [
  { name: 'Cyberbullying',        category: 'Cyberbullying', keywords: ['hate', 'stupid', 'idiot', 'loser', 'ugly', 'dumb'],        match: (t) => /hate|stupid|idiot|loser|ugly|dumb/i.test(t) },
  { name: 'Harassment',           category: 'Harassment',    keywords: ['annoying', 'shut up', 'go away', 'nobody likes', 'get lost'], match: (t) => /annoying|shut up|go away|nobody likes|get lost/i.test(t) },
  { name: 'Threats & Intimidation', category: 'Threats',    keywords: ['die', 'kill', 'threat', 'hurt', 'destroy'],                 match: (t) => /\bdie\b|kill|threat|hurt|destroy/i.test(t) },
  { name: 'Hate Speech',          category: 'Hate Speech',   keywords: ['worst', 'terrible', 'pathetic', 'worthless', 'trash'],     match: (t) => /worst|terrible|pathetic|worthless|trash/i.test(t) },
  { name: 'Exclusion & Isolation', category: 'Cyberbullying', keywords: ['alone', 'outcast', 'freak', 'nobody cares', 'no friends'], match: (t) => /alone|outcast|freak|nobody cares|no friends/i.test(t) },
];

const getCutoff = (range) => {
  if (range === 'all') return null;
  const d = new Date();
  if (range === 'day')   d.setDate(d.getDate() - 1);
  if (range === 'week')  d.setDate(d.getDate() - 7);
  if (range === 'month') d.setDate(d.getDate() - 30);
  return d;
};

const getSeverity = (n) => n > 10 ? 'critical' : n > 5 ? 'high' : n > 2 ? 'medium' : 'low';

const severityGrad  = (s) => ({ critical: 'from-red-500 to-red-600', high: 'from-orange-500 to-orange-600', medium: 'from-yellow-500 to-yellow-600', low: 'from-blue-500 to-blue-600' }[s]);
const severityBadge = (s, dark) => ({
  critical: dark ? 'bg-red-500/20 text-red-300 border-red-800'     : 'bg-red-100 text-red-700 border-red-300',
  high:     dark ? 'bg-orange-500/20 text-orange-300 border-orange-800' : 'bg-orange-100 text-orange-700 border-orange-300',
  medium:   dark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-800' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low:      dark ? 'bg-blue-500/20 text-blue-300 border-blue-800'   : 'bg-blue-100 text-blue-700 border-blue-300',
}[s]);

function AnalysisPatterns({ darkMode }) {
  const { user } = useAuth();
  const [timeRange, setTimeRange]       = useState('week');
  const [loading, setLoading]           = useState(true);
  const [trendingPatterns, setPatterns] = useState([]);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await historyAPI.getByUserId(user.id);
      const all = res.data?.data || [];
      const cutoff = getCutoff(timeRange);
      const current = cutoff ? all.filter((i) => new Date(i.created_at) >= cutoff) : all;

      let previous = [];
      if (cutoff && timeRange !== 'all') {
        const span = Date.now() - cutoff.getTime();
        const prevStart = new Date(cutoff.getTime() - span);
        previous = all.filter((i) => { const d = new Date(i.created_at); return d >= prevStart && d < cutoff; });
      }

      const maxDet = Math.max(...PATTERN_DEFS.map((p) => current.filter((i) => p.match(i.input_text || '')).length), 1);

      const trends = PATTERN_DEFS.map((def, idx) => {
        const curr = current.filter((i) => (i.toxicity_score > 0.3 || i.cyberbullying_prob > 0.3) && def.match(i.input_text || ''));
        const prev = previous.filter((i) => (i.toxicity_score > 0.3 || i.cyberbullying_prob > 0.3) && def.match(i.input_text || ''));
        const count = curr.length, prevCount = prev.length;
        let trendStr = '0%';
        if (prevCount === 0 && count > 0) trendStr = '+New';
        else if (prevCount > 0) { const pct = Math.round(((count - prevCount) / prevCount) * 100); trendStr = pct >= 0 ? `+${pct}%` : `${pct}%`; }
        return { id: idx + 1, pattern: def.name, category: def.category, detections: count, severity: getSeverity(count), trend: trendStr, trendUp: count >= prevCount, keywords: def.keywords, barWidth: Math.round((count / maxDet) * 100) };
      }).sort((a, b) => b.detections - a.detections);

      setPatterns(trends);
    } catch { }
    finally { setLoading(false); }
  }, [user?.id, timeRange]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
      <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Harmful Pattern Analysis</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detected in your analyzed content</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[['day','24h'],['week','7d'],['month','30d'],['all','All']].map(([val, lbl]) => (
              <button key={val} onClick={() => setTimeRange(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === val ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className={`w-6 h-6 animate-spin ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        ) : !user ? (
          <p className={`text-center text-sm py-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Log in to see your pattern analysis.</p>
        ) : (
          <div className="space-y-3">
            {trendingPatterns.map((p, idx) => (
              <div key={p.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${severityGrad(p.severity)} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.pattern}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${severityBadge(p.severity, darkMode)}`}>{p.severity.charAt(0).toUpperCase() + p.severity.slice(1)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-800' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}>{p.category}</span>
                        </div>
                      </div>
                      <div className={`text-right shrink-0 ${p.trendUp ? 'text-red-500' : 'text-green-500'}`}>
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.detections}</p>
                        <p className="text-xs font-semibold flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3" />{p.trend}
                        </p>
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-full bg-gradient-to-r ${severityGrad(p.severity)} transition-all duration-500`} style={{ width: `${Math.max(p.barWidth, p.detections > 0 ? 5 : 0)}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.keywords.map((kw, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>"{kw}"</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {trendingPatterns.every((p) => p.detections === 0) && (
              <div className={`p-8 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No harmful patterns detected in this period.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrendingTopics({ darkMode }) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trending Topics</h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Live Twitter trends worldwide + harmful pattern detection in your analyses
        </p>
      </div>

      {/* Live Twitter Trends (top, prominent) */}
      <LiveTrends darkMode={darkMode} />

      {/* Your Analysis Patterns (below) */}
      <AnalysisPatterns darkMode={darkMode} />
    </div>
  );
}
