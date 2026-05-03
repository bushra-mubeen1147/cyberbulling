import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI, userAnalyticsAPI } from '../api/api.js';
import {
  LayoutDashboard, History, User,
  ChevronRight, Sparkles, Shield, BarChart3, LifeBuoy, Activity,
  TrendingUp, Eye, Download, Twitter, Brain, CheckCircle,
  AlertTriangle, Flag, Zap, Flame, Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar.jsx';

// ─── helpers ──────────────────────────────────────────────────────────────────
const relTime = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── custom hooks ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = parseFloat(target) || 0;
    if (t === 0) { setV(0); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * t));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return v;
}

// ─── Activity Heatmap (30 days) ───────────────────────────────────────────────
const Heatmap = ({ daily, dk }) => {
  const map = {};
  daily.forEach(d => { map[d.day] = d.total; });
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().split('T')[0];
  });
  const getColor = (n) => {
    if (!n) return dk ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
    if (n <= 2) return 'bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-300';
    if (n <= 5) return 'bg-blue-400 dark:bg-blue-700 hover:bg-blue-500';
    return 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700';
  };
  const weeks = [];
  for (let i = 0; i < 35; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div key={day} title={`${day}: ${map[day] || 0} analyses`}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm cursor-default transition-colors ${getColor(map[day])}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-[10px] ${dk ? 'text-gray-500' : 'text-gray-400'}`}>Less</span>
        {[dk ? 'bg-gray-800' : 'bg-gray-100', 'bg-blue-200 dark:bg-blue-900/60', 'bg-blue-400 dark:bg-blue-700', 'bg-blue-600'].map((c, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
        ))}
        <span className={`text-[10px] ${dk ? 'text-gray-500' : 'text-gray-400'}`}>More</span>
      </div>
    </div>
  );
};

// ─── Mini Bar Chart (7 days) ──────────────────────────────────────────────────
const MiniBarChart = ({ daily, dk }) => {
  const last7 = (() => {
    const map = {};
    daily.forEach(d => { map[d.day] = { total: d.total, flagged: d.flagged }; });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { label, ...(map[key] || { total: 0, flagged: 0 }) };
    });
  })();
  const max = Math.max(...last7.map(d => d.total), 1);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {last7.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-0.5" style={{ height: 70 }}>
            <div className="flex gap-0.5 items-end" style={{ height: 60 }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 4 : 0)}%` }}
                transition={{ duration: 0.7, delay: i * 0.05 }}
                className="flex-1 rounded-t-sm bg-blue-500 opacity-75" title={`Total: ${d.total}`}
              />
              {d.flagged > 0 && (
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.flagged / max) * 100, 4)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.1 }}
                  className="flex-1 rounded-t-sm bg-red-400 opacity-80" title={`Flagged: ${d.flagged}`}
                />
              )}
            </div>
            <p className={`text-center text-[9px] ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{d.label.slice(0, 2)}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 bg-blue-500 opacity-75 rounded-sm inline-block" />Total</span>
        <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 bg-red-400 opacity-80 rounded-sm inline-block" />Flagged</span>
      </div>
    </div>
  );
};

// ─── SVG Donut ────────────────────────────────────────────────────────────────
const Donut = ({ segments, size = 100 }) => {
  const r = 36, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  if (!total) return (
    <svg width={size} height={size}><circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={16} /></svg>
  );
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={16} />
      {segments.map((sg, i) => {
        const dash = (sg.value / total) * circ;
        const offset = -acc;
        acc += dash;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={sg.color} strokeWidth={16}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={24} className="fill-white dark:fill-gray-800" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight="bold" className="fill-gray-700 dark:fill-gray-200">{total}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={7} className="fill-gray-400">total</text>
    </svg>
  );
};

// ─── Analytics Home Page ──────────────────────────────────────────────────────
function AnalyticsHome({ darkMode: dk, user }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      userAnalyticsAPI.get(),
      historyAPI.getByUserId(user.id),
    ]).then(([aRes, hRes]) => {
      setAnalytics(aRes.data?.data || null);
      setHistory(hRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const card = `${dk ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border`;

  // derived
  const total     = analytics?.weekly?.total_all ?? 0;
  const thisWeek  = analytics?.weekly?.this_week ?? 0;
  const lastWeek  = analytics?.weekly?.last_week ?? 0;
  const streak    = analytics?.streak ?? 0;
  const tox       = analytics?.toxicity || {};
  const safe      = total > 0 ? Math.round(((total - (tox.high + tox.medium)) / total) * 100) : 0;
  const flaggedAll = history.filter(h => (h.toxicity_score || 0) > 0.5 || (h.cyberbullying_prob || 0) > 0.5).length;
  const weekDiff   = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const cTotal  = useCountUp(total);
  const cFlagged = useCountUp(flaggedAll);
  const cSafe   = useCountUp(safe);
  const cStreak = useCountUp(streak);

  const sentimentSegs = (analytics?.sentiment || []).map(s => ({
    label: s.sentiment,
    value: s.count,
    color: { positive: '#22c55e', negative: '#a855f7', neutral: '#94a3b8' }[s.sentiment] || '#3b82f6',
  }));

  const recentHistory = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`h-32 rounded-2xl animate-pulse ${dk ? 'bg-gray-800' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Welcome */}
      <div className={`p-5 rounded-2xl ${dk ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, <span className="text-blue-500">{user?.name || user?.email?.split('@')[0]}</span>!
            </h2>
            <p className={`text-sm mt-1 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>
              {total === 0 ? 'Start analyzing text to see your personal insights here.' : `You've analyzed ${total} piece${total !== 1 ? 's' : ''} of content. Keep going!`}
            </p>
          </div>
          <Sparkles className="w-10 h-10 text-blue-500 opacity-40 hidden sm:block flex-shrink-0" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Analyses',  value: cTotal,   icon: BarChart3,  color: '#3b82f6', bg: dk ? 'bg-blue-900/30' : 'bg-blue-50',   sub: weekDiff !== null ? `${weekDiff >= 0 ? '+' : ''}${weekDiff}% vs last week` : 'all time' },
          { label: 'Flagged Content', value: cFlagged, icon: Flag,       color: '#ef4444', bg: dk ? 'bg-red-900/30' : 'bg-red-50',     sub: total > 0 ? `${Math.round((flaggedAll / total) * 100)}% of total` : 'none yet' },
          { label: 'Safe Rate',       value: `${cSafe}%`, icon: CheckCircle, color: '#22c55e', bg: dk ? 'bg-green-900/30' : 'bg-green-50', sub: 'content cleared' },
          { label: 'Day Streak',      value: cStreak,  icon: Flame,      color: '#f97316', bg: dk ? 'bg-orange-900/30' : 'bg-orange-50', sub: streak > 0 ? 'consecutive days' : 'analyze daily!' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`${card} p-4`}
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className={`text-2xl font-bold tabular-nums ${dk ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{s.label}</p>
            <p className={`text-[10px] mt-0.5 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Heatmap + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 30-day heatmap */}
        <div className={`${card} p-5 lg:col-span-2`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Activity Heatmap — Last 35 Days</h3>
          </div>
          {!analytics?.daily?.length
            ? <p className={`text-sm py-6 text-center ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No activity yet. Start analyzing to see your heatmap.</p>
            : <Heatmap daily={analytics.daily} dk={dk} />
          }
        </div>

        {/* Sentiment donut */}
        <div className={`${card} p-5 flex flex-col`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Sentiment Split</h3>
          </div>
          {sentimentSegs.length === 0
            ? <p className={`text-sm text-center py-6 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No data yet.</p>
            : <div className="flex items-center gap-4">
              <Donut segments={sentimentSegs} size={100} />
              <div className="space-y-2 flex-1">
                {sentimentSegs.map(sg => (
                  <div key={sg.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className={`capitalize ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{sg.label}</span>
                      <span className="font-bold" style={{ color: sg.color }}>{sg.value}</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(sg.value / (sentimentSegs.reduce((s, g) => s + g.value, 0) || 1)) * 100}%` }}
                        transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: sg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        </div>
      </div>

      {/* 7-day bar chart + Toxicity breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 7-day chart */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Last 7 Days</h3>
            {weekDiff !== null && (
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${weekDiff >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                {weekDiff >= 0 ? '+' : ''}{weekDiff}% vs prev week
              </span>
            )}
          </div>
          <MiniBarChart daily={analytics?.daily || []} dk={dk} />
        </div>

        {/* Toxicity breakdown */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Toxicity Distribution</h3>
          </div>
          {tox.total === 0
            ? <p className={`text-sm text-center py-6 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No analyses yet.</p>
            : <div className="space-y-4">
              {[
                { label: 'Low (0–30%)',    value: tox.low,    color: 'bg-green-500', pct: Math.round(((tox.low || 0) / tox.total) * 100) },
                { label: 'Medium (30–60%)',value: tox.medium, color: 'bg-yellow-500', pct: Math.round(((tox.medium || 0) / tox.total) * 100) },
                { label: 'High (>60%)',    value: tox.high,   color: 'bg-red-500',   pct: Math.round(((tox.high || 0) / tox.total) * 100) },
              ].map(({ label, value, color, pct: p }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={dk ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                    <span className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{value} <span className={dk ? 'text-gray-500' : 'text-gray-400'}>({p}%)</span></span>
                  </div>
                  <div className={`h-2 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              ))}
              <div className={`mt-2 pt-3 border-t ${dk ? 'border-gray-700' : 'border-gray-100'} flex justify-between text-xs`}>
                <span className={dk ? 'text-gray-400' : 'text-gray-600'}>Average toxicity score</span>
                <span className="font-bold text-orange-500">{tox.avg_pct}%</span>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Recent analyses */}
      {recentHistory.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Recent Analyses</h3>
            </div>
            <Link to="/dashboard/history" className="text-xs text-blue-500 hover:underline">View all →</Link>
          </div>
          <div className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
            {recentHistory.map(item => {
              const tox = Math.round((item.toxicity_score || 0) * 100);
              const isBad = tox > 50;
              return (
                <div key={item.id} className={`flex items-start gap-3 px-5 py-3 ${dk ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${isBad ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {isBad ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{item.input_text || '—'}</p>
                    <p className={`text-xs mt-0.5 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className={`font-semibold ${isBad ? 'text-red-500' : 'text-green-500'}`}>{tox}% toxic</span>
                      {item.sentiment && <span> · {item.sentiment}</span>}
                      <span> · {relTime(item.created_at)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ darkMode }) {
  const location = useLocation();
  const { user } = useAuth();
  const dk = darkMode;

  const atRoot = location.pathname === '/dashboard';

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Analytics', description: 'Overview & charts' },
    { path: '/dashboard/twitter', icon: Twitter, label: 'Twitter Analysis', description: 'Analyze tweet history', requiresAuth: true },
    { path: '/dashboard/victims', icon: Shield, label: 'Victim Monitoring', description: 'Track profiles live', requiresAuth: true, badge: 'New' },
    { path: '/dashboard/predictions', icon: Brain, label: 'Behavior Prediction', description: 'AI risk forecast', requiresAuth: true, badge: 'AI' },
    { path: '/dashboard/history', icon: History, label: 'Analysis History', description: 'Past results', requiresAuth: true },
    { path: '/dashboard/statistics', icon: BarChart3, label: 'Statistics', description: 'View analytics', requiresAuth: true },
    { path: '/dashboard/activity', icon: Activity, label: 'Activity Feed', description: 'Recent events', requiresAuth: true },
    { path: '/dashboard/trending', icon: TrendingUp, label: 'Trending Topics', description: 'Top patterns', requiresAuth: true },
    { path: '/dashboard/review', icon: Eye, label: 'Content Review', description: 'Manual review', requiresAuth: true },
    { path: '/dashboard/export', icon: Download, label: 'Data Export', description: 'Export data', requiresAuth: true },
    { path: '/dashboard/profile', icon: User, label: 'Profile Settings', description: 'Manage account' },
    { path: '/dashboard/support', icon: LifeBuoy, label: 'Support', description: 'Get help' },
  ];

  return (
    <div className={`min-h-screen ${dk ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <DashboardSidebar darkMode={dk} user={user} menuItems={menuItems} activePath={location.pathname} />
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 space-y-5">
            {/* Breadcrumb */}
            {!atRoot && (
              <div className="flex items-center gap-2 text-sm">
                <Link to="/dashboard" className={`${dk ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className={`font-medium capitalize ${dk ? 'text-white' : 'text-gray-900'}`}>
                  {location.pathname.split('/').pop()}
                </span>
              </div>
            )}

            {/* Analytics home OR nested route */}
            {atRoot ? <AnalyticsHome darkMode={dk} user={user} /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
