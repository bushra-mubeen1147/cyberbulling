import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { predictionAPI, victimAPI } from '../api/api.js';
import { useAuth } from '../context/AuthProvider.jsx';
import {
  Brain, TrendingUp, TrendingDown, Minus, RefreshCw,
  AlertTriangle, CheckCircle, ShieldAlert, Lightbulb,
  Activity, BarChart2, Target, Clock, ChevronLeft,
  ArrowUp, ArrowDown, Sparkles, Twitter, Eye, Info,
  ChevronRight, Zap,
} from 'lucide-react';

// ── Risk palette ──────────────────────────────────────────────────────────────

const PAL = {
  LOW:      { hex: '#22c55e', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  border: 'border-green-400' },
  MEDIUM:   { hex: '#eab308', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', border: 'border-yellow-400' },
  HIGH:     { hex: '#f97316', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', border: 'border-orange-400' },
  CRITICAL: { hex: '#ef4444', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',          border: 'border-red-400' },
};

const IMPACT = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const NEXT_MOVE_COLORS = {
  aggressive:   { bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-300 dark:border-red-800/50',     icon: 'text-red-500' },
  escalating:   { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-800/50', icon: 'text-orange-500' },
  sustained:    { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-800/50', icon: 'text-orange-400' },
  deteriorating:{ bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-800/50', icon: 'text-yellow-500' },
  uncertain:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-300 dark:border-blue-800/50',   icon: 'text-blue-400' },
  improving:    { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-300 dark:border-green-800/50', icon: 'text-green-500' },
  stable:       { bg: 'bg-gray-50 dark:bg-gray-800',       border: 'border-gray-200 dark:border-gray-700',      icon: 'text-gray-400' },
};

// ── SVG gauge ────────────────────────────────────────────────────────────────

function RiskGauge({ score, level, darkMode }) {
  const r = 68, cx = 100, cy = 96;
  const pal = PAL[level] || PAL.LOW;
  const angle = Math.PI * (1 - score);
  const nx = cx + 54 * Math.cos(angle);
  const ny = cy - 54 * Math.sin(angle);

  return (
    <div className="flex flex-col items-center select-none">
      <svg viewBox="0 0 200 104" className="w-48 h-24">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = Math.PI * (1 - t);
          return <line key={t} x1={cx + (r - 4) * Math.cos(a)} y1={cy - (r - 4) * Math.sin(a)} x2={cx + (r + 4) * Math.cos(a)} y2={cy - (r + 4) * Math.sin(a)} stroke={darkMode ? '#4b5563' : '#d1d5db'} strokeWidth="1.5" strokeLinecap="round" />;
        })}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`} fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="12" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`} fill="none" stroke={pal.hex} strokeWidth="12" strokeLinecap="round" pathLength="1" strokeDasharray={`${score} 1`} style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)' }} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={darkMode ? '#d1d5db' : '#374151'} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={pal.hex} />
        <circle cx={cx} cy={cy} r="2.5" fill={darkMode ? '#111827' : '#fff'} />
        <text x={cx - r - 2} y={cy + 13} textAnchor="middle" fontSize="8" fill={darkMode ? '#6b7280' : '#9ca3af'}>0</text>
        <text x={cx + r + 2} y={cy + 13} textAnchor="middle" fontSize="8" fill={darkMode ? '#6b7280' : '#9ca3af'}>100</text>
      </svg>
      <div className="text-center -mt-1">
        <span className="text-4xl font-black" style={{ color: pal.hex }}>{Math.round(score * 100)}</span>
        <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/100</span>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>risk score</p>
      </div>
    </div>
  );
}

// ── Victim selector card ──────────────────────────────────────────────────────

function VictimCard({ victim, onSelect, darkMode }) {
  const grad = victim.twitter_username.charCodeAt(0) % 3 === 0 ? 'from-blue-400 to-cyan-500'
    : victim.twitter_username.charCodeAt(0) % 3 === 1 ? 'from-purple-400 to-pink-500'
    : 'from-green-400 to-teal-500';

  return (
    <button
      onClick={() => onSelect(victim)}
      className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] ${
        darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-600/50' : 'bg-white border-gray-200 hover:border-purple-400'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {(victim.display_name || victim.twitter_username).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>@{victim.twitter_username}</p>
          {victim.display_name && victim.display_name !== victim.twitter_username && (
            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{victim.display_name}</p>
          )}
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{victim.tweet_count || 0} tweet{victim.tweet_count !== 1 ? 's' : ''} analyzed</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Brain className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          <ChevronRight className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>
    </button>
  );
}

// ── Mini stat card ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color, darkMode }) {
  return (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          {sub && <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ── Weekly bar chart ──────────────────────────────────────────────────────────

function WeeklyChart({ data, darkMode }) {
  if (!data?.length) return null;
  const last8 = data.slice(-8);
  const maxRisk = Math.max(...last8.map((d) => d.avg_risk), 0.01);
  const barColor = (r) => r >= 0.7 ? '#ef4444' : r >= 0.5 ? '#f97316' : r >= 0.3 ? '#eab308' : '#22c55e';
  const fmtWeek = (wk) => { const d = new Date(wk); return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`; };

  return (
    <>
      <div className="flex items-end gap-1.5 h-28 mb-1">
        {last8.map((w) => (
          <div key={w.week} className="flex-1 flex flex-col items-center gap-1" title={`${fmtWeek(w.week)}: avg risk ${Math.round(w.avg_risk * 100)}% (${w.count} posts)`}>
            <span style={{ fontSize: '9px' }} className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{Math.round(w.avg_risk * 100)}%</span>
            <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${Math.max((w.avg_risk / maxRisk) * 100, 4)}%`, backgroundColor: barColor(w.avg_risk) }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {last8.map((w) => (
          <div key={w.week} className="flex-1 text-center" style={{ fontSize: '8px' }}>
            <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>{fmtWeek(w.week)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Score comparison bar ──────────────────────────────────────────────────────

function CompBar({ label, value, prevValue, darkMode }) {
  const pct = Math.round(value * 100);
  const diff = prevValue !== undefined ? pct - Math.round(prevValue * 100) : null;
  const color = value >= 0.7 ? '#ef4444' : value >= 0.5 ? '#f97316' : value >= 0.3 ? '#eab308' : '#22c55e';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <div className="flex items-center gap-1.5">
          {diff !== null && diff !== 0 && (
            <span className={`text-xs flex items-center gap-0.5 ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{Math.abs(diff)}%
            </span>
          )}
          <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BehaviorPrediction({ darkMode }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [victims, setVictims]       = useState([]);
  const [loadingVictims, setLV]     = useState(true);
  const [selectedVictim, setSelected] = useState(null);
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Load victims list on mount
  useEffect(() => {
    if (!user) return;
    victimAPI.list()
      .then((r) => setVictims(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLV(false));
  }, [user]);

  // If victim_id in URL, auto-select
  useEffect(() => {
    const id = searchParams.get('victim_id');
    if (id && victims.length > 0 && !selectedVictim) {
      const v = victims.find((v) => String(v.id) === id);
      if (v) handleSelectVictim(v);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victims, searchParams]);

  const handleSelectVictim = useCallback(async (victim) => {
    setSelected(victim);
    setData(null);
    setError('');
    setLoading(true);
    setSearchParams({ victim_id: victim.id });
    try {
      const res = await predictionAPI.getForVictim(victim.id);
      setData(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prediction.');
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  const handleBack = () => {
    setSelected(null);
    setData(null);
    setError('');
    setSearchParams({});
  };

  const handleRefresh = () => handleSelectVictim(selectedVictim);

  if (!user) return (
    <div className={`p-10 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <Brain className={`w-12 h-12 mx-auto mb-3 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please log in to use behavior prediction.</p>
    </div>
  );

  const pal = data && !data.insufficient_data ? (PAL[data.risk_level] || PAL.LOW) : null;
  const TrendIcon = data?.trend_direction === 'increasing' ? TrendingUp : data?.trend_direction === 'decreasing' ? TrendingDown : Minus;
  const trendColor = data?.trend_direction === 'increasing' ? 'text-red-500' : data?.trend_direction === 'decreasing' ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500';
  const nmStyle = NEXT_MOVE_COLORS[data?.next_move_type] || NEXT_MOVE_COLORS.stable;

  // ── Victim selection screen ───────────────────────────────────────────────
  if (!selectedVictim) {
    return (
      <div className="space-y-6">
        <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-800/30' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Victim Behavior Prediction</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a monitored profile to generate an AI-powered prediction of their next move
              </p>
            </div>
          </div>
        </div>

        {loadingVictims ? (
          <div className="flex justify-center py-12">
            <RefreshCw className={`w-6 h-6 animate-spin ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        ) : victims.length === 0 ? (
          <div className={`p-10 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <ShieldAlert className={`w-12 h-12 mx-auto mb-3 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No monitored profiles yet</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add a victim profile in Victim Monitoring first, then check their tweets to build a behavioral dataset.
            </p>
            <button
              onClick={() => navigate('/dashboard/victims')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" /> Go to Victim Monitoring
            </button>
          </div>
        ) : (
          <div>
            <p className={`text-xs font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {victims.length} MONITORED PROFILE{victims.length !== 1 ? 'S' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {victims.map((v) => (
                <VictimCard key={v.id} victim={v} onSelect={handleSelectVictim} darkMode={darkMode} />
              ))}
            </div>
            <p className={`text-xs mt-4 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Profiles need analyzed tweets before a prediction can be generated.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Prediction results screen ─────────────────────────────────────────────
  const grad = selectedVictim.twitter_username.charCodeAt(0) % 3 === 0 ? 'from-blue-400 to-cyan-500'
    : selectedVictim.twitter_username.charCodeAt(0) % 3 === 1 ? 'from-purple-400 to-pink-500'
    : 'from-green-400 to-teal-500';

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-800/30' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white text-gray-500'}`}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
              {(selectedVictim.display_name || selectedVictim.twitter_username).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Behavior Prediction — <span className="font-black">@{selectedVictim.twitter_username}</span>
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI-powered analysis of posting patterns and next-move forecast</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`https://twitter.com/${selectedVictim.twitter_username}`} target="_blank" rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white text-gray-500'}`}>
              <Twitter className="w-4 h-4" />
            </a>
            <button onClick={handleRefresh} disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'}`}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'bg-red-900/20 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            <button onClick={handleRefresh} className="text-xs text-blue-500 underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className={`flex flex-col items-center justify-center py-16 gap-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative">
            <Brain className={`w-10 h-10 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
            <Sparkles className={`w-4 h-4 absolute -top-1 -right-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          </div>
          <div className="text-center">
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analyzing @{selectedVictim.twitter_username}…</p>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Running statistical model + Gemini AI analysis</p>
          </div>
        </div>
      )}

      {/* ── Insufficient data ── */}
      {!loading && !error && data?.insufficient_data && (
        <div className={`p-10 rounded-xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <BarChart2 className={`w-12 h-12 mx-auto mb-3 opacity-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Not enough tweet data yet</h3>
          <p className={`text-sm max-w-sm mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.message}</p>
          {data.data_points !== undefined && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '120px' }}>
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min((data.data_points / (data.min_required || 3)) * 100, 100)}%` }} />
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{data.data_points}/{data.min_required || 3} tweets needed</span>
            </div>
          )}
          <button onClick={() => navigate('/dashboard/victims')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Eye className="w-4 h-4" /> Fetch More Tweets
          </button>
        </div>
      )}

      {/* ── Full prediction ── */}
      {!loading && !error && data && !data.insufficient_data && (
        <>
          {/* ── Risk overview ── */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-1.5" style={{ backgroundColor: pal.hex }} />
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <RiskGauge score={data.risk_score} level={data.risk_level} darkMode={darkMode} />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className={`text-lg font-black px-4 py-1.5 rounded-xl border-2 ${pal.border} ${pal.badge}`}>{data.risk_level} RISK</span>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                      <TrendIcon className="w-4 h-4" />
                      {data.trend_direction.charAt(0).toUpperCase() + data.trend_direction.slice(1)} trend
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <div className="flex items-center gap-1.5">
                      <Target className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Model confidence: <strong className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{Math.round(data.confidence * 100)}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{data.data_points}</strong> tweets analyzed
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{data.analysis_window_days}</strong>-day window
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── NEXT MOVE PREDICTION (prominent) ── */}
          <div className={`rounded-xl border-2 p-5 ${nmStyle.bg} ${nmStyle.border}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm shrink-0`}>
                <Zap className={`w-5 h-5 ${nmStyle.icon}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Predicted Next Move
                </p>
                <p className={`font-semibold text-sm leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.next_move}
                </p>
              </div>
            </div>
          </div>

          {/* ── AI Insights (Gemini) ── */}
          {data.ai_insights && (
            <div className={`rounded-xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-indigo-800/40' : 'bg-white border-indigo-200'}`}>
              <div className={`px-5 py-3 border-b flex items-center gap-2 ${darkMode ? 'border-indigo-800/40 bg-indigo-900/20' : 'border-indigo-100 bg-indigo-50'}`}>
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className={`font-bold text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Gemini AI Analysis</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>AI-powered</span>
              </div>
              <div className="p-5 space-y-5">

                {/* Behavioral summary */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Behavioral Assessment</p>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.ai_insights.behavioral_summary}</p>
                </div>

                {/* AI next move */}
                <div className={`p-4 rounded-xl border-l-4 ${darkMode ? 'bg-indigo-900/10 border-indigo-500' : 'bg-indigo-50 border-indigo-400'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>AI Next-Move Prediction</p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.ai_insights.next_move_prediction}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Psychological indicators */}
                  {data.ai_insights.psychological_indicators?.length > 0 && (
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Psychological Signals</p>
                      <div className="space-y-1.5">
                        {data.ai_insights.psychological_indicators.map((ind, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Brain className={`w-3 h-3 shrink-0 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ind}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning signs */}
                  {data.ai_insights.warning_signs?.length > 0 && (
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Watch For</p>
                      <div className="space-y-1.5">
                        {data.ai_insights.warning_signs.map((ws, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ws}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Intervention strategy */}
                {data.ai_insights.intervention_strategy && (
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-900/10 border border-green-800/30' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Recommended Intervention</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.ai_insights.intervention_strategy}</p>
                  </div>
                )}

                {/* Confidence note */}
                {data.ai_insights.confidence_note && (
                  <div className="flex items-start gap-2">
                    <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{data.ai_insights.confidence_note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If AI unavailable, show fallback notice */}
          {!data.ai_insights && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <Info className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>AI insights unavailable — showing statistical prediction only.</p>
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Tweets Analyzed" value={data.stats.total_analyzed} sub="in history" icon={Activity} color={darkMode ? 'text-blue-400' : 'text-blue-600'} darkMode={darkMode} />
            <StatCard
              label="Toxic Tweets"
              value={`${Math.round(data.stats.toxic_rate * 100)}%`}
              sub={`${data.stats.toxic_count} flagged`}
              icon={ShieldAlert}
              color={data.stats.toxic_rate >= 0.5 ? 'text-red-500' : data.stats.toxic_rate >= 0.25 ? 'text-orange-500' : 'text-green-500'}
              darkMode={darkMode}
            />
            <StatCard
              label="High-Risk Posts"
              value={data.stats.high_risk_count}
              sub={`${Math.round(data.stats.high_risk_rate * 100)}% of total`}
              icon={AlertTriangle}
              color={data.stats.high_risk_count >= 3 ? 'text-red-500' : data.stats.high_risk_count >= 1 ? 'text-orange-500' : 'text-green-500'}
              darkMode={darkMode}
            />
            <StatCard
              label="7-Day Change"
              value={data.stats.last7_count > 0 ? `${data.stats.last7_avg > data.stats.prev7_avg ? '+' : ''}${Math.round((data.stats.last7_avg - data.stats.prev7_avg) * 100)}%` : 'N/A'}
              sub={data.stats.last7_count > 0 ? `vs prev week (${Math.round(data.stats.prev7_avg * 100)}%)` : 'no activity'}
              icon={data.stats.last7_avg > data.stats.prev7_avg ? TrendingUp : TrendingDown}
              color={data.stats.last7_avg > data.stats.prev7_avg ? 'text-red-500' : 'text-green-500'}
              darkMode={darkMode}
            />
          </div>

          {/* ── Two-column: trend + factors ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Weekly trend */}
            <div className={`rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <BarChart2 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Risk Trend</h2>
                </div>
              </div>
              <div className="p-4">
                <WeeklyChart data={data.weekly_trend} darkMode={darkMode} />
                <div className="space-y-3 mt-4 border-t pt-4" style={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SCORE COMPARISON</p>
                  <CompBar label="Recent average" value={data.stats.recent_avg} prevValue={data.stats.historical_avg} darkMode={darkMode} />
                  <CompBar label="Historical average" value={data.stats.historical_avg} darkMode={darkMode} />
                  {data.stats.last7_count > 0 && <CompBar label="Last 7 days" value={data.stats.last7_avg} prevValue={data.stats.prev7_avg} darkMode={darkMode} />}
                </div>
              </div>
            </div>

            {/* Risk factors */}
            <div className={`rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                  <h2 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detected Risk Factors</h2>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {data.risk_factors.map((f, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${
                    f.impact === 'positive' ? darkMode ? 'border-green-800/40 bg-green-900/10' : 'border-green-200 bg-green-50'
                    : f.impact === 'critical' || f.impact === 'high' ? darkMode ? 'border-red-800/30 bg-red-900/10' : 'border-red-100 bg-red-50/50'
                    : darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{f.factor}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${IMPACT[f.impact] || IMPACT.medium}`}>{f.impact}</span>
                    </div>
                    {f.description && <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Warnings ── */}
          {data.warnings?.length > 0 && (
            <div className={`rounded-xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-red-900/40' : 'bg-white border-red-200'}`}>
              <div className={`px-5 py-3 border-b flex items-center gap-2 ${darkMode ? 'border-red-900/40 bg-red-900/10' : 'border-red-100 bg-red-50'}`}>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className={`font-bold text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Behavioral Warnings ({data.warnings.length})</h2>
              </div>
              <div className="p-4 space-y-2">
                {data.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recommendations ── */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-3 border-b flex items-center gap-2 ${darkMode ? 'border-gray-700 bg-indigo-900/10' : 'border-gray-100 bg-indigo-50'}`}>
              <Lightbulb className="w-4 h-4 text-indigo-500" />
              <h2 className={`font-bold text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Monitoring Recommendations</h2>
            </div>
            <div className="p-4 space-y-2">
              {data.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{r}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex items-start gap-2 p-3 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
            <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Predictions combine statistical trend analysis with Gemini AI and are for monitoring awareness only. Confidence improves with more analyzed tweets.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
