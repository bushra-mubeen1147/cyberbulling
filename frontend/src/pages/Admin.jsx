import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, AlertTriangle, BarChart3, Shield, TrendingUp, Activity,
  Flag, Trash2, RefreshCw, Bell, Send, CheckCircle, XCircle,
  MessageSquare, Search, Star, Clock, Zap, UserCheck, Info,
  MailOpen, TicketCheck, Download, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Eye, Database, Cpu, Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { adminAPI } from '../api/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relTime = (d) => {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const pct = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0;

function exportCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: filename });
  a.click(); URL.revokeObjectURL(a.href);
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1100) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const tgt = parseFloat(target) || 0;
    if (tgt === 0) { setCount(0); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * tgt));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// ─── SVG Ring ─────────────────────────────────────────────────────────────────
const Ring = ({ value = 0, size = 52, stroke = 5, color = '#3b82f6' }) => {
  const r = (size - stroke * 2) / 2, c = 2 * Math.PI * r, cx = size / 2;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200 dark:text-gray-700" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(value, 100) / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x={cx} y={cx + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill={color}>{Math.round(value)}%</text>
    </svg>
  );
};

// ─── Toast System ─────────────────────────────────────────────────────────────
const TICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const TCOLORS = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-yellow-500' };

const Toasts = ({ list, remove }) => (
  <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {list.map(t => { const I = TICONS[t.type] || Info; return (
        <motion.div key={t.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl bg-gray-900 text-white min-w-[280px] max-w-sm border border-gray-700"
        >
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${TCOLORS[t.type]}`}><I className="w-3.5 h-3.5 text-white" /></div>
          <span className="text-sm flex-1 leading-snug">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>
        </motion.div>
      );})}
    </AnimatePresence>
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDlg = ({ dlg, close, dk }) => dlg && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
      className={`${dk ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
        <p className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Confirm Action</p>
      </div>
      <p className={`text-sm mb-6 leading-relaxed ${dk ? 'text-gray-300' : 'text-gray-600'}`}>{dlg.msg}</p>
      <div className="flex gap-3">
        <button onClick={close} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${dk ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
        <button onClick={() => { dlg.fn(); close(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Confirm</button>
      </div>
    </motion.div>
  </div>
);

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const BarChart = ({ data, dk }) => {
  if (!data?.length) return <p className={`text-sm text-center py-8 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No data available.</p>;
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-0.5" title={`${d.label}: ${d.total} total, ${d.flagged} flagged`} style={{ height: 110 }}>
            <div className="flex gap-0.5 items-end" style={{ height: 96 }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.total / max) * 100, 2)}%` }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                className="flex-1 rounded-t-sm bg-blue-500 opacity-75"
              />
              <motion.div initial={{ height: 0 }} animate={{ height: d.flagged > 0 ? `${Math.max((d.flagged / max) * 100, 2)}%` : 0 }}
                transition={{ duration: 0.8, delay: i * 0.04 + 0.1, ease: 'easeOut' }}
                className="flex-1 rounded-t-sm bg-red-400 opacity-80"
              />
            </div>
            <p className={`text-center text-[9px] truncate ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{d.label?.split(' ')[0]}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-75 inline-block" />Analyses</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 opacity-80 inline-block" />Flagged</span>
      </div>
    </div>
  );
};

// ─── User Detail Panel (slide-over) ──────────────────────────────────────────
const UserPanel = ({ u, details, loading, onClose, onNotify, onRoleChange, onDelete, dk }) => {
  if (!u) return null;
  const initials = (u.name || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col shadow-2xl overflow-hidden ${dk ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-100'}`}
        >
          {/* Header */}
          <div className={`p-5 border-b flex-shrink-0 ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-semibold uppercase tracking-wider ${dk ? 'text-gray-400' : 'text-gray-500'}`}>User Profile</span>
              <button onClick={onClose} className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-lg truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{u.name}</p>
                <p className={`text-xs truncate ${dk ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>{u.role}</span>
                  <span className={`text-xs ${dk ? 'text-gray-600' : 'text-gray-400'}`}>· Joined {fmtDate(u.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
            ) : details && (
              <>
                {/* Stats grid */}
                <div className={`grid grid-cols-2 gap-3 p-5 border-b ${dk ? 'border-gray-700/60' : 'border-gray-100'}`}>
                  {[
                    { l: 'Total Analyses', v: details.stats.total, c: 'text-blue-500' },
                    { l: 'Flagged', v: details.stats.flagged, c: 'text-red-500' },
                    { l: 'Avg Toxicity', v: `${details.stats.avg_toxicity}%`, c: 'text-orange-500' },
                    { l: 'Positive', v: details.stats.positive, c: 'text-green-500' },
                  ].map(({ l, v, c }) => (
                    <div key={l} className={`p-3 rounded-xl ${dk ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-xl font-bold ${c}`}>{v}</p>
                      <p className={`text-xs mt-0.5 ${dk ? 'text-gray-400' : 'text-gray-500'}`}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Toxicity bar */}
                <div className={`px-5 py-4 border-b ${dk ? 'border-gray-700/60' : 'border-gray-100'}`}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={dk ? 'text-gray-400' : 'text-gray-600'}>Average Toxicity</span>
                    <span className="font-bold text-orange-500">{details.stats.avg_toxicity}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${details.stats.avg_toxicity}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-red-500"
                    />
                  </div>
                  {details.stats.last_active && (
                    <p className={`text-xs mt-2 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>Last active: {relTime(details.stats.last_active)}</p>
                  )}
                </div>

                {/* Activity mini chart */}
                {details.activity?.length > 0 && (
                  <div className={`px-5 py-4 border-b ${dk ? 'border-gray-700/60' : 'border-gray-100'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>14-Day Activity</p>
                    <div className="flex items-end gap-1" style={{ height: 40 }}>
                      {(() => {
                        const maxC = Math.max(...details.activity.map(a => a.count), 1);
                        return details.activity.map((a, i) => (
                          <div key={i} className="flex-1" style={{ height: 36 }}>
                            <div className="flex items-end h-full">
                              <div className="w-full rounded-t-sm bg-blue-500 opacity-60"
                                style={{ height: `${Math.max((a.count / maxC) * 100, 5)}%` }}
                                title={`${a.day}: ${a.count}`}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Recent analyses */}
                <div className="px-5 py-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>Recent Analyses</p>
                  {details.recent.length === 0
                    ? <p className={`text-sm ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No analyses yet.</p>
                    : <div className="space-y-2">
                      {details.recent.map(r => (
                        <div key={r.id} className={`p-3 rounded-xl ${dk ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className={`text-xs truncate mb-1.5 ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{r.input_text || '—'}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-red-500">{Math.round(r.toxicity_score * 100)}%</span>
                            <span className={dk ? 'text-gray-700' : 'text-gray-300'}>·</span>
                            <span className={`capitalize ${dk ? 'text-gray-500' : 'text-gray-400'}`}>{r.sentiment || 'neutral'}</span>
                            <span className={`ml-auto ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{relTime(r.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className={`p-5 border-t flex-shrink-0 space-y-2 ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
            <button onClick={onNotify} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${dk ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>
              <Bell className="w-4 h-4" /> Send Notification
            </button>
            <button onClick={() => onRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${dk ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'}`}>
              <UserCheck className="w-4 h-4" /> {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
            </button>
            <button onClick={onDelete} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${dk ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}>
              <Trash2 className="w-4 h-4" /> Delete User
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, size, onChange, dk }) => {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t ${dk ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
      <span className="text-xs">{((page - 1) * size) + 1}–{Math.min(page * size, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className={`p-1.5 rounded-lg disabled:opacity-30 ${dk ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = pages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
          if (p > pages) return null;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : dk ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {p}
            </button>
          );
        })}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}
          className={`p-1.5 rounded-lg disabled:opacity-30 ${dk ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',      label: 'Overview',      icon: BarChart3 },
  { key: 'users',         label: 'Users',          icon: Users },
  { key: 'notifications', label: 'Notifications',  icon: Bell },
  { key: 'flagged',       label: 'Flagged',        icon: Flag },
  { key: 'analytics',     label: 'Analytics',      icon: TrendingUp },
  { key: 'reports',       label: 'Reports',        icon: MessageSquare },
];
const PAGE_SIZE = 10;
const TICKET_S = ['open', 'in_progress', 'resolved', 'closed'];
const S_COLOR  = { open: 'blue', in_progress: 'yellow', resolved: 'green', closed: 'gray' };
const TYPE_OPTS = [
  { v: 'info', l: 'Info', c: 'blue' },
  { v: 'warning', l: 'Warning', c: 'yellow' },
  { v: 'success', l: 'Success', c: 'green' },
  { v: 'alert', l: 'Alert', c: 'red' },
];

export default function Admin({ darkMode: dk }) {
  const { user } = useAuth();

  // ── data
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [history, setHistory]     = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyDays, setAnalyDays] = useState(7);
  const [notifs, setNotifs]       = useState([]);
  const [reports, setReports]     = useState(null);

  // ── ui
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [toasts, setToasts]       = useState([]);
  const [dlg, setDlg]             = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // ── user panel
  const [panelUser, setPanelUser]       = useState(null);
  const [panelDetails, setPanelDetails] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  // ── users tab
  const [uSearch, setUSearch]   = useState('');
  const [uRole, setURole]       = useState('all');
  const [uSort, setUSort]       = useState({ col: 'created_at', dir: 'desc' });
  const [uPage, setUPage]       = useState(1);
  const [selected, setSelected] = useState(new Set());

  // ── notifications compose
  const [nForm, setNForm]   = useState({ title: '', message: '', type: 'info', recipient_id: '' });
  const [nSending, setNSending] = useState(false);

  // ── flagged tab
  const [fSearch, setFSearch] = useState('');
  const [fPage, setFPage]     = useState(1);
  const [expanded, setExpanded] = useState(null);

  // ── toast helpers
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  const confirm = useCallback((msg, fn) => setDlg({ msg, fn }), []);

  // ── fetch
  const fetchCore = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const [sR, uR, hR, nR] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getHistory(), adminAPI.getNotifications()
      ]);
      setStats(sR.data?.data || null);
      setUsers(uR.data?.data || []);
      setHistory(hR.data?.data || []);
      setNotifs(nR.data?.data || []);
    } catch (e) { setError(e.response?.data?.error || 'Admin access denied.'); }
    finally { setLoading(false); }
  }, [user]);

  const fetchAnalytics = useCallback(async (days) => {
    try {
      const r = await adminAPI.getAnalytics(days);
      setAnalytics(r.data?.data || null);
    } catch {}
  }, []);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    try { const r = await adminAPI.getReports(); setReports(r.data?.data || null); } catch {}
  }, [user]);

  useEffect(() => { fetchCore(); }, [fetchCore]);
  useEffect(() => { if (activeTab === 'analytics' && !analytics) fetchAnalytics(analyDays); }, [activeTab]);
  useEffect(() => { if (activeTab === 'reports' && !reports) fetchReports(); }, [activeTab, reports]);

  // ── auto-refresh
  useEffect(() => {
    if (!autoRefresh) { setCountdown(30); return; }
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchCore(); if (activeTab === 'analytics') fetchAnalytics(analyDays); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [autoRefresh, fetchCore, fetchAnalytics, analyDays, activeTab]);

  // ── analytics days change
  useEffect(() => { fetchAnalytics(analyDays); }, [analyDays]);

  // ── computed
  const flagged = useMemo(() => history.filter(h => (h.toxicity_score || 0) > 0.5 || (h.cyberbullying_prob || 0) > 0.5).sort((a, b) => (b.toxicity_score || 0) - (a.toxicity_score || 0)), [history]);

  const enriched = useMemo(() => users.map(u => ({
    ...u,
    analyses: history.filter(h => h.user_id === u.id).length,
    flaggedC: history.filter(h => h.user_id === u.id && ((h.toxicity_score || 0) > 0.5 || (h.cyberbullying_prob || 0) > 0.5)).length,
  })), [users, history]);

  const filteredUsers = useMemo(() => {
    const q = uSearch.toLowerCase();
    let list = enriched.filter(u => {
      const mQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const mR = uRole === 'all' || u.role === uRole;
      return mQ && mR;
    });
    return [...list].sort((a, b) => {
      const av = a[uSort.col], bv = b[uSort.col];
      if (av == null) return 1; if (bv == null) return -1;
      const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return uSort.dir === 'asc' ? c : -c;
    });
  }, [enriched, uSearch, uRole, uSort]);

  const pagedUsers = filteredUsers.slice((uPage - 1) * PAGE_SIZE, uPage * PAGE_SIZE);

  const filteredFlagged = useMemo(() => {
    const q = fSearch.toLowerCase();
    return !q ? flagged : flagged.filter(h => (h.input_text || '').toLowerCase().includes(q) || (h.user_email || '').toLowerCase().includes(q));
  }, [flagged, fSearch]);
  const pagedFlagged = filteredFlagged.slice((fPage - 1) * PAGE_SIZE, fPage * PAGE_SIZE);

  const topOffenders = useMemo(() => [...enriched].sort((a, b) => b.flaggedC - a.flaggedC).filter(u => u.flaggedC > 0).slice(0, 5), [enriched]);

  // ── actions
  const openPanel = async (u) => {
    setPanelUser(u); setPanelDetails(null); setPanelLoading(true);
    try { const r = await adminAPI.getUserDetails(u.id); setPanelDetails(r.data?.data || null); } catch {}
    finally { setPanelLoading(false); }
  };

  const handleDeleteUser = (userId) => confirm('This will permanently delete the user and all their data. Continue?', async () => {
    try {
      await adminAPI.deleteUser(userId);
      setUsers(p => p.filter(u => u.id !== userId));
      setHistory(p => p.filter(h => h.user_id !== userId));
      if (panelUser?.id === userId) setPanelUser(null);
      toast('User deleted successfully.');
    } catch (e) { toast(e.response?.data?.error || 'Failed to delete.', 'error'); }
  });

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.changeUserRole(userId, { role });
      setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u));
      if (panelUser?.id === userId) setPanelUser(p => ({ ...p, role }));
      toast(`Role changed to ${role}.`);
    } catch (e) { toast(e.response?.data?.error || 'Failed.', 'error'); }
  };

  const handleBulkDelete = () => confirm(`Delete ${selected.size} selected user(s) permanently?`, async () => {
    let done = 0;
    for (const id of selected) {
      try { await adminAPI.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)); done++; } catch {}
    }
    setSelected(new Set());
    toast(`Deleted ${done} user(s).`);
  });

  const handleBulkNotify = async () => {
    if (!nForm.title || !nForm.message) { setActiveTab('notifications'); toast('Fill in the notification form first.', 'info'); return; }
    let sent = 0;
    for (const id of selected) {
      try { await adminAPI.sendNotification({ ...nForm, recipient_id: id }); sent++; } catch {}
    }
    const r = await adminAPI.getNotifications();
    setNotifs(r.data?.data || []);
    setSelected(new Set());
    toast(`Sent notification to ${sent} user(s).`);
  };

  const handleSendNotif = async (e) => {
    e.preventDefault(); setNSending(true);
    try {
      await adminAPI.sendNotification({ ...nForm, recipient_id: nForm.recipient_id ? parseInt(nForm.recipient_id) : null });
      const r = await adminAPI.getNotifications(); setNotifs(r.data?.data || []);
      toast(nForm.recipient_id ? 'Notification sent to user.' : 'Broadcast sent to all users.');
      setNForm({ title: '', message: '', type: 'info', recipient_id: '' });
    } catch (e) { toast(e.response?.data?.error || 'Failed.', 'error'); }
    finally { setNSending(false); }
  };

  const handleDeleteNotif = async (id) => {
    try { await adminAPI.deleteNotification(id); setNotifs(p => p.filter(n => n.id !== id)); toast('Notification deleted.'); }
    catch { toast('Failed to delete.', 'error'); }
  };

  const handleDeleteFlagged = (id) => confirm('Delete this analysis record permanently?', async () => {
    try { await adminAPI.deleteHistoryItem(id); setHistory(p => p.filter(h => h.id !== id)); toast('Record deleted.'); }
    catch (e) { toast(e.response?.data?.error || 'Failed.', 'error'); }
  });

  const handleTicketStatus = async (ticketId, status) => {
    try {
      await adminAPI.updateTicketStatus(ticketId, { status });
      setReports(p => p ? { ...p, tickets: p.tickets.map(t => t.id === ticketId ? { ...t, status } : t) } : null);
      toast('Ticket status updated.');
    } catch { toast('Failed.', 'error'); }
  };

  const toggleSort = (col) => setUSort(p => ({ col, dir: p.col === col && p.dir === 'asc' ? 'desc' : 'asc' }));
  const SortIcon = ({ col }) => uSort.col === col ? (uSort.dir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />) : null;
  const prefillNotify = (u) => { setNForm(f => ({ ...f, recipient_id: String(u.id) })); setActiveTab('notifications'); setPanelUser(null); };

  const toggleSelect = (id) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll   = () => setSelected(p => p.size === pagedUsers.length ? new Set() : new Set(pagedUsers.map(u => u.id)));

  // ─ guard
  if (error) return (
    <div className={`min-h-screen ${dk ? 'bg-gray-900' : 'bg-gray-50'} pt-16 flex items-center justify-center`}>
      <div className="text-center p-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className={`text-2xl font-bold mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>Access Denied</h2>
        <p className={dk ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
      </div>
    </div>
  );

  // ─ shortcuts
  const card = `${dk ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border`;
  const th   = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dk ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'}`;
  const td   = `px-4 py-3 text-sm ${dk ? 'text-gray-300' : 'text-gray-700'}`;
  const inp  = `w-full px-3 py-2 rounded-xl border text-sm ${dk ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'} outline-none transition-colors`;

  // Animated counters
  const cUsers    = useCountUp(stats?.users?.total);
  const cAnalyses = useCountUp(stats?.analyses?.total);
  const cFlagged  = useCountUp(stats?.flagged?.total);
  const cRate     = useCountUp(stats?.detection_rate);
  const cTickets  = useCountUp(stats?.open_tickets);
  const cNotifs   = useCountUp(notifs.length);

  const statCards = [
    { l: 'Total Users',     v: cUsers,    sub: `+${stats?.users?.today ?? 0} today`,     icon: Users,       color: '#3b82f6',  bg: dk ? 'bg-blue-900/30' : 'bg-blue-50' },
    { l: 'Analyses',        v: cAnalyses, sub: `+${stats?.analyses?.today ?? 0} today`,   icon: BarChart3,   color: '#22c55e',  bg: dk ? 'bg-green-900/30' : 'bg-green-50' },
    { l: 'Flagged',         v: cFlagged,  sub: `+${stats?.flagged?.today ?? 0} today`,    icon: Flag,        color: '#ef4444',  bg: dk ? 'bg-red-900/30' : 'bg-red-50' },
    { l: 'Detection Rate',  v: null,      sub: 'of all analyses',                          icon: null,        color: '#a855f7',  ring: true, ringVal: cRate },
    { l: 'Open Tickets',    v: cTickets,  sub: 'support queue',                            icon: TicketCheck, color: '#f59e0b',  bg: dk ? 'bg-yellow-900/30' : 'bg-yellow-50' },
    { l: 'Notifications',   v: cNotifs,   sub: `${stats?.notifications_today ?? 0} today`, icon: Bell,        color: '#6366f1',  bg: dk ? 'bg-indigo-900/30' : 'bg-indigo-50' },
  ];

  return (
    <>
      <Toasts list={toasts} remove={removeToast} />
      <ConfirmDlg dlg={dlg} close={() => setDlg(null)} dk={dk} />
      {panelUser && (
        <UserPanel u={panelUser} details={panelDetails} loading={panelLoading}
          onClose={() => setPanelUser(null)}
          onNotify={() => prefillNotify(panelUser)}
          onRoleChange={handleRoleChange}
          onDelete={() => handleDeleteUser(panelUser.id)}
          dk={dk}
        />
      )}

      <div className={`min-h-screen ${dk ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
                  <p className={`text-xs ${dk ? 'text-gray-400' : 'text-gray-500'}`}>
                    Signed in as <span className="text-blue-500 font-medium">{user?.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-refresh toggle */}
                <button onClick={() => setAutoRefresh(p => !p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    autoRefresh
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : dk ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                  {autoRefresh ? `${countdown}s` : 'Auto'}
                </button>

                <button onClick={() => { fetchCore(); if (activeTab === 'analytics') fetchAnalytics(analyDays); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${dk ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {statCards.map((s, i) => (
                <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`${card} p-4`}
                >
                  {s.ring ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Ring value={loading ? 0 : cRate} color={s.color} size={44} />
                      <div>
                        <p className={`text-xs font-medium ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{s.l}</p>
                        <p className={`text-[10px] ${dk ? 'text-gray-500' : 'text-gray-400'}`}>{s.sub}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <p className={`text-2xl font-bold tabular-nums ${dk ? 'text-white' : 'text-gray-900'}`}>{loading ? '—' : s.v}</p>
                      <p className={`text-xs font-medium mt-0.5 ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{s.l}</p>
                      <p className={`text-[10px] mt-0.5 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{s.sub}</p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div className={`flex border-b ${dk ? 'border-gray-700' : 'border-gray-200'} mb-6 overflow-x-auto`}>
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : `border-transparent ${dk ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`
                  }`}
                >
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

                  {/* ══════════════ OVERVIEW ══════════════ */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                      {/* Content Breakdown */}
                      <div className={`${card} p-5`}>
                        <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-blue-500" /><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Content Breakdown</h3></div>
                        {history.length === 0
                          ? <p className={`text-sm text-center py-6 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No data.</p>
                          : <div className="space-y-3">
                            {[
                              { l: 'Safe Content',      n: history.length - flagged.length, color: 'bg-green-500' },
                              { l: 'Flagged (>50%)',    n: flagged.length,                   color: 'bg-red-500' },
                              { l: 'High Risk (>70%)',  n: history.filter(h => (h.toxicity_score || 0) > 0.7).length, color: 'bg-orange-500' },
                              { l: 'Positive',          n: history.filter(h => h.sentiment === 'positive').length,    color: 'bg-blue-500' },
                              { l: 'Negative',          n: history.filter(h => h.sentiment === 'negative').length,    color: 'bg-purple-500' },
                            ].map(({ l, n, color }) => (
                              <div key={l}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className={dk ? 'text-gray-300' : 'text-gray-600'}>{l}</span>
                                  <span className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{n}</span>
                                </div>
                                <div className={`h-1.5 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct(n, history.length)}%` }} transition={{ duration: 0.8 }}
                                    className={`h-full rounded-full ${color}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        }
                      </div>

                      {/* Recent Activity */}
                      <div className={`${card} p-5`}>
                        <div className="flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-blue-500" /><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3></div>
                        {history.length === 0
                          ? <p className={`text-sm text-center py-6 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No activity.</p>
                          : <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {[...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10).map(item => {
                              const bad = (item.toxicity_score || 0) > 0.5;
                              return (
                                <div key={item.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${dk ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
                                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${bad ? dk ? 'bg-red-900/40' : 'bg-red-100' : dk ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                                    {bad ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <Activity className="w-3 h-3 text-blue-500" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${dk ? 'text-gray-200' : 'text-gray-800'}`}>{bad ? 'Toxic content' : 'Analysis done'}</p>
                                    <p className={`text-xs truncate ${dk ? 'text-gray-500' : 'text-gray-400'}`}>{(item.input_text || '').substring(0, 36)}…</p>
                                    <p className={`text-[10px] ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{relTime(item.created_at)} · {item.user_email || `#${item.user_id}`}</p>
                                  </div>
                                  <span className={`text-xs font-bold flex-shrink-0 ${bad ? 'text-red-500' : 'text-green-500'}`}>{Math.round((item.toxicity_score || 0) * 100)}%</span>
                                </div>
                              );
                            })}
                          </div>
                        }
                      </div>

                      {/* Right column: top offenders + platform health */}
                      <div className="flex flex-col gap-5">

                        {/* Top Offenders */}
                        <div className={`${card} p-5`}>
                          <div className="flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-yellow-500" /><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Top Flagged Users</h3></div>
                          {topOffenders.length === 0
                            ? <p className={`text-xs text-center py-4 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No flagged users.</p>
                            : <div className="space-y-2">
                              {topOffenders.map((u, i) => (
                                <button key={u.id} onClick={() => openPanel(u)}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${dk ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                >
                                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : dk ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {i + 1}
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className={`text-xs font-semibold truncate ${dk ? 'text-gray-200' : 'text-gray-800'}`}>{u.name}</p>
                                    <p className={`text-[10px] truncate ${dk ? 'text-gray-500' : 'text-gray-400'}`}>{u.email}</p>
                                  </div>
                                  <span className="text-xs font-bold text-red-500 flex-shrink-0">{u.flaggedC} flagged</span>
                                </button>
                              ))}
                            </div>
                          }
                        </div>

                        {/* Platform Health */}
                        <div className={`${card} p-5`}>
                          <div className="flex items-center gap-2 mb-4"><Server className="w-4 h-4 text-green-500" /><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Platform Health</h3></div>
                          <div className="space-y-3">
                            {[
                              { l: 'Database',     v: 'Connected',            dot: 'bg-green-500' },
                              { l: 'Total Records',v: history.length,          dot: 'bg-blue-500' },
                              { l: 'Avg Toxicity', v: history.length > 0 ? `${Math.round(history.reduce((s, h) => s + (h.toxicity_score || 0), 0) / history.length * 100)}%` : '0%', dot: 'bg-orange-500' },
                              { l: 'Users Online', v: `${users.length} registered`, dot: 'bg-purple-500' },
                            ].map(({ l, v, dot }) => (
                              <div key={l} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                                  <span className={`text-xs ${dk ? 'text-gray-400' : 'text-gray-600'}`}>{l}</span>
                                </div>
                                <span className={`text-xs font-semibold ${dk ? 'text-gray-200' : 'text-gray-800'}`}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══════════════ USERS ══════════════ */}
                  {activeTab === 'users' && (
                    <div className={card}>
                      {/* Toolbar */}
                      <div className={`flex flex-wrap gap-2 p-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="relative flex-1 min-w-[180px]">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dk ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input value={uSearch} onChange={e => { setUSearch(e.target.value); setUPage(1); }} placeholder="Search users…" className={`${inp} pl-9`} />
                        </div>
                        <select value={uRole} onChange={e => { setURole(e.target.value); setUPage(1); }} className={`${inp} w-auto`}>
                          <option value="all">All Roles</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => exportCSV(filteredUsers.map(u => ({ name: u.name, email: u.email, role: u.role, analyses: u.analyses, flagged: u.flaggedC, joined: fmtDate(u.created_at) })), 'users.csv')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${dk ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                      </div>

                      {/* Bulk action bar */}
                      <AnimatePresence>
                        {selected.size > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className={`flex items-center gap-3 px-4 py-3 border-b ${dk ? 'border-gray-700 bg-blue-900/20' : 'border-gray-100 bg-blue-50'}`}
                          >
                            <span className="text-xs font-semibold text-blue-600">{selected.size} selected</span>
                            <button onClick={handleBulkNotify} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"><Bell className="w-3 h-3" /> Notify</button>
                            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                            <button onClick={() => setSelected(new Set())} className={`ml-auto text-xs ${dk ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>Clear</button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {filteredUsers.length === 0
                        ? <div className="py-16 text-center"><Users className={`w-10 h-10 mx-auto mb-3 ${dk ? 'text-gray-600' : 'text-gray-300'}`} /><p className={`text-sm ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No users match your filter.</p></div>
                        : <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className={`${th} w-8`}><input type="checkbox" onChange={toggleAll} checked={pagedUsers.length > 0 && pagedUsers.every(u => selected.has(u.id))} className="rounded" /></th>
                                  {[['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['analyses', 'Analyses'], ['flaggedC', 'Flagged'], ['created_at', 'Joined']].map(([col, label]) => (
                                    <th key={col} className={`${th} cursor-pointer select-none`} onClick={() => toggleSort(col)}>
                                      {label}<SortIcon col={col} />
                                    </th>
                                  ))}
                                  <th className={th}>Actions</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                {pagedUsers.map(u => (
                                  <tr key={u.id} className={`${dk ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'} transition-colors ${selected.has(u.id) ? dk ? 'bg-blue-900/15' : 'bg-blue-50/60' : ''}`}>
                                    <td className={td}><input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} className="rounded" /></td>
                                    <td className={`${td} font-medium`}>
                                      <button onClick={() => openPanel(u)} className="flex items-center gap-2 hover:text-blue-500 transition-colors text-left">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                                          {(u.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                                        </div>
                                        {u.name}
                                      </button>
                                    </td>
                                    <td className={`${td} text-xs`}>{u.email}</td>
                                    <td className={td}>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>{u.role}</span>
                                    </td>
                                    <td className={td}>{u.analyses}</td>
                                    <td className={`${td} font-bold ${u.flaggedC > 0 ? 'text-red-500' : dk ? 'text-gray-600' : 'text-gray-300'}`}>{u.flaggedC}</td>
                                    <td className={`${td} text-xs`}>{fmtDate(u.created_at)}</td>
                                    <td className={td}>
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => openPanel(u)} title="View details" className={`p-1.5 rounded-lg ${dk ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Eye className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => prefillNotify(u)} title="Notify" className={`p-1.5 rounded-lg ${dk ? 'hover:bg-blue-900/40 text-blue-400' : 'hover:bg-blue-100 text-blue-500'}`}><Bell className="w-3.5 h-3.5" /></button>
                                        {u.id !== user?.id && (<>
                                          <button onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')} title={u.role === 'admin' ? 'Demote' : 'Promote'} className={`p-1.5 rounded-lg ${dk ? 'hover:bg-purple-900/40 text-purple-400' : 'hover:bg-purple-100 text-purple-500'}`}><UserCheck className="w-3.5 h-3.5" /></button>
                                          <button onClick={() => handleDeleteUser(u.id)} title="Delete" className={`p-1.5 rounded-lg ${dk ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>)}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Pagination page={uPage} total={filteredUsers.length} size={PAGE_SIZE} onChange={setUPage} dk={dk} />
                        </>
                      }
                    </div>
                  )}

                  {/* ══════════════ NOTIFICATIONS ══════════════ */}
                  {activeTab === 'notifications' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                      {/* Compose */}
                      <div className={`${card} p-5 lg:col-span-2`}>
                        <div className="flex items-center gap-2 mb-5"><Send className="w-4 h-4 text-blue-500" /><h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Compose</h3></div>
                        <form onSubmit={handleSendNotif} className="space-y-4">
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>Recipient</label>
                            <select value={nForm.recipient_id} onChange={e => setNForm(f => ({ ...f, recipient_id: e.target.value }))} className={inp}>
                              <option value="">📢 All Users (broadcast)</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>Type</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {TYPE_OPTS.map(o => (
                                <button key={o.v} type="button" onClick={() => setNForm(f => ({ ...f, type: o.v }))}
                                  className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${nForm.type === o.v ? 'border-blue-500 bg-blue-500 text-white' : dk ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >{o.l}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>Title *</label>
                            <input value={nForm.title} onChange={e => setNForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title…" required className={inp} />
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>Message *</label>
                            <textarea value={nForm.message} onChange={e => setNForm(f => ({ ...f, message: e.target.value }))} rows={4} required placeholder="Write your message…" className={`${inp} resize-none`} />
                          </div>
                          {/* Preview */}
                          {(nForm.title || nForm.message) && (
                            <div className={`p-3 rounded-xl border-l-4 text-xs ${
                              nForm.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                              nForm.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                              nForm.type === 'alert'   ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                              'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                            }`}>
                              <p className="font-bold mb-0.5">{nForm.title || 'Preview'}</p>
                              <p className={dk ? 'text-gray-400' : 'text-gray-600'}>{nForm.message || '—'}</p>
                            </div>
                          )}
                          <button type="submit" disabled={nSending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                          >
                            {nSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {nForm.recipient_id ? 'Send to User' : 'Broadcast to All'}
                          </button>
                        </form>
                      </div>

                      {/* History */}
                      <div className={`${card} lg:col-span-3 flex flex-col overflow-hidden`}>
                        <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Sent History</h3></div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${dk ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{notifs.length}</span>
                        </div>
                        {notifs.length === 0
                          ? <div className="py-16 text-center"><Bell className={`w-10 h-10 mx-auto mb-3 ${dk ? 'text-gray-700' : 'text-gray-200'}`} /><p className={`text-sm ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No notifications sent yet.</p></div>
                          : <div className="overflow-y-auto flex-1">
                            {notifs.map(n => {
                              const tc = { info: 'text-blue-500', warning: 'text-yellow-500', success: 'text-green-500', alert: 'text-red-500' }[n.type] || 'text-gray-500';
                              const NI = { info: Info, warning: AlertTriangle, success: CheckCircle, alert: Flag }[n.type] || Info;
                              return (
                                <div key={n.id} className={`flex items-start gap-3 px-5 py-4 border-b ${dk ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-50 hover:bg-gray-50'}`}>
                                  <div className={`p-1.5 rounded-xl flex-shrink-0 ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}><NI className={`w-4 h-4 ${tc}`} /></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                      <p className={`text-sm font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${tc} ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>{n.type}</span>
                                    </div>
                                    <p className={`text-xs line-clamp-2 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                                    <p className={`text-[10px] mt-1 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>
                                      {n.recipient_name ? `→ ${n.recipient_name}` : 'Broadcast'} · {relTime(n.created_at)}
                                    </p>
                                  </div>
                                  <button onClick={() => handleDeleteNotif(n.id)} className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${dk ? 'text-gray-600 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              );
                            })}
                          </div>
                        }
                      </div>
                    </div>
                  )}

                  {/* ══════════════ FLAGGED ══════════════ */}
                  {activeTab === 'flagged' && (
                    <div className={card}>
                      <div className={`flex flex-wrap items-center gap-3 p-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="relative flex-1 min-w-[160px]">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dk ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input value={fSearch} onChange={e => { setFSearch(e.target.value); setFPage(1); }} placeholder="Search flagged content…" className={`${inp} pl-9`} />
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${dk ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>{filteredFlagged.length} flagged</span>
                        <button onClick={() => exportCSV(filteredFlagged.map(h => ({ user: h.user_email || h.user_id, text: h.input_text, toxicity: `${Math.round((h.toxicity_score || 0) * 100)}%`, cyberbullying: `${Math.round((h.cyberbullying_prob || 0) * 100)}%`, date: fmtDate(h.created_at) })), 'flagged.csv')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${dk ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        ><Download className="w-3.5 h-3.5" /> Export</button>
                      </div>

                      {filteredFlagged.length === 0
                        ? <div className="py-16 text-center"><Shield className={`w-10 h-10 mx-auto mb-3 ${dk ? 'text-gray-600' : 'text-gray-300'}`} /><p className={`text-sm ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No flagged content.</p></div>
                        : <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr>{['User', 'Content', 'Toxicity', 'Cyberbullying', 'Severity', 'Date', 'Action'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                              </thead>
                              <tbody className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                {pagedFlagged.map(item => {
                                  const tox = Math.round((item.toxicity_score || 0) * 100);
                                  const cyb = Math.round((item.cyberbullying_prob || 0) * 100);
                                  const high = tox > 70 || cyb > 70;
                                  const exp = expanded === item.id;
                                  return (
                                    <tr key={item.id} className={`${dk ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}>
                                      <td className={`${td} text-xs`}>{item.user_email || `#${item.user_id}`}</td>
                                      <td className={`${td} max-w-xs`}>
                                        <p className={`text-xs ${dk ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {exp ? item.input_text : (item.input_text || '').substring(0, 55) + ((item.input_text || '').length > 55 ? '…' : '')}
                                        </p>
                                        {(item.input_text || '').length > 55 && (
                                          <button onClick={() => setExpanded(exp ? null : item.id)} className="text-[10px] text-blue-500 hover:underline mt-0.5">{exp ? 'Less' : 'More'}</button>
                                        )}
                                      </td>
                                      <td className={td}>
                                        <div className="flex items-center gap-1.5">
                                          <div className={`h-1.5 w-12 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}><div className="h-full rounded-full bg-red-500" style={{ width: `${tox}%` }} /></div>
                                          <span className="text-xs font-bold text-red-500">{tox}%</span>
                                        </div>
                                      </td>
                                      <td className={td}><span className="text-xs font-bold text-orange-500">{cyb}%</span></td>
                                      <td className={td}>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${high ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>{high ? 'High' : 'Medium'}</span>
                                      </td>
                                      <td className={`${td} text-xs`}>{fmtDate(item.created_at)}</td>
                                      <td className={td}>
                                        <button onClick={() => handleDeleteFlagged(item.id)} className={`p-1.5 rounded-lg transition-colors ${dk ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <Pagination page={fPage} total={filteredFlagged.length} size={PAGE_SIZE} onChange={setFPage} dk={dk} />
                        </>
                      }
                    </div>
                  )}

                  {/* ══════════════ ANALYTICS ══════════════ */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-5">
                      {/* Date range selector */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${dk ? 'text-gray-400' : 'text-gray-600'}`}>Range:</span>
                        {[7, 14, 30, 90].map(d => (
                          <button key={d} onClick={() => setAnalyDays(d)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${analyDays === d ? 'bg-blue-600 text-white shadow' : dk ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                          >{d}D</button>
                        ))}
                        <button onClick={() => fetchAnalytics(analyDays)} className={`ml-auto p-1.5 rounded-xl ${dk ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><RefreshCw className="w-4 h-4" /></button>
                      </div>

                      {/* Bar chart */}
                      <div className={`${card} p-5`}>
                        <div className="flex items-center gap-2 mb-5"><TrendingUp className="w-4 h-4 text-blue-500" /><h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Analyses vs Flagged — Last {analyDays} Days</h3></div>
                        <BarChart data={analytics?.daily || []} dk={dk} />
                      </div>

                      {/* Table + sentiment side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className={`${card} lg:col-span-2 overflow-hidden`}>
                          <div className={`px-5 py-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Daily Breakdown</h3></div>
                          {!analytics?.daily?.length
                            ? <p className={`text-sm text-center py-10 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No data.</p>
                            : <div className="overflow-x-auto max-h-72 overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead className="sticky top-0">
                                  <tr>{['Date', 'Total', 'Flagged', 'Positive', 'Negative', 'Neutral', 'New Users'].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                                </thead>
                                <tbody className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                  {analytics.daily.map(d => (
                                    <tr key={d.day} className={dk ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                                      <td className={td}>{d.label}</td>
                                      <td className={`${td} font-bold`}>{d.total}</td>
                                      <td className={`${td} text-red-500 font-bold`}>{d.flagged}</td>
                                      <td className={`${td} text-green-500`}>{d.positive}</td>
                                      <td className={`${td} text-purple-500`}>{d.negative}</td>
                                      <td className={`${td} text-gray-400`}>{d.neutral}</td>
                                      <td className={`${td} text-blue-500`}>{d.new_users}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          }
                        </div>

                        {/* Sentiment dist */}
                        <div className={`${card} p-5`}>
                          <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-yellow-500" /><h3 className={`font-bold text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>Sentiment Distribution</h3></div>
                          {!analytics?.sentiment_dist?.length
                            ? <p className={`text-sm text-center py-6 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No data.</p>
                            : (() => {
                              const total = analytics.sentiment_dist.reduce((s, r) => s + r.count, 0);
                              const colors = { positive: 'bg-green-500', negative: 'bg-purple-500', neutral: 'bg-gray-400' };
                              return <div className="space-y-3">
                                {analytics.sentiment_dist.map(r => (
                                  <div key={r.sentiment}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={`capitalize ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{r.sentiment || 'unknown'}</span>
                                      <span className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{r.count} ({pct(r.count, total)}%)</span>
                                    </div>
                                    <div className={`h-2 rounded-full ${dk ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct(r.count, total)}%` }} transition={{ duration: 0.8 }}
                                        className={`h-full rounded-full ${colors[r.sentiment] || 'bg-blue-500'}`} />
                                    </div>
                                  </div>
                                ))}
                              </div>;
                            })()
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══════════════ REPORTS ══════════════ */}
                  {activeTab === 'reports' && (
                    <div className="space-y-5">
                      {/* Support Tickets */}
                      <div className={card}>
                        <div className={`flex items-center gap-2 px-5 py-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
                          <TicketCheck className="w-4 h-4 text-blue-500" />
                          <h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Support Tickets</h3>
                          {reports && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${dk ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{reports.tickets.length}</span>}
                        </div>
                        {!reports ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                          : reports.tickets.length === 0
                            ? <p className={`text-sm text-center py-10 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No tickets.</p>
                            : <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead><tr>{['User', 'Title', 'Priority', 'Status', 'Date', 'Update'].map(h => <th key={h} className={th}>{h}</th>)}</tr></thead>
                                <tbody className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                  {reports.tickets.map(t => (
                                    <tr key={t.id} className={dk ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                                      <td className={`${td} text-xs`}>{t.user_name || 'Anonymous'}</td>
                                      <td className={`${td} max-w-xs`}>
                                        <p className="font-medium text-xs truncate">{t.title}</p>
                                        <p className={`text-[10px] truncate ${dk ? 'text-gray-500' : 'text-gray-400'}`}>{(t.description || '').substring(0, 50)}…</p>
                                      </td>
                                      <td className={td}>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${{ high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' }[t.priority] || 'bg-gray-100 text-gray-700'}`}>{t.priority}</span>
                                      </td>
                                      <td className={td}>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${{ open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', resolved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }[t.status] || 'bg-gray-100 text-gray-700'}`}>{t.status?.replace('_', ' ')}</span>
                                      </td>
                                      <td className={`${td} text-xs`}>{fmtDate(t.created_at)}</td>
                                      <td className={td}>
                                        <select value={t.status} onChange={e => handleTicketStatus(t.id, e.target.value)}
                                          className={`text-xs rounded-lg px-2 py-1 border ${dk ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
                                        >
                                          {TICKET_S.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                        </select>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                        }
                      </div>

                      {/* Contact Messages */}
                      <div className={card}>
                        <div className={`flex items-center gap-2 px-5 py-4 border-b ${dk ? 'border-gray-700' : 'border-gray-100'}`}>
                          <MailOpen className="w-4 h-4 text-blue-500" />
                          <h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Contact Messages</h3>
                          {reports && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${dk ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{reports.contacts.length}</span>}
                        </div>
                        {!reports ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                          : reports.contacts.length === 0
                            ? <p className={`text-sm text-center py-10 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>No messages.</p>
                            : <div className={`divide-y ${dk ? 'divide-gray-700' : 'divide-gray-50'}`}>
                              {reports.contacts.map(c => (
                                <div key={c.id} className={`px-5 py-4 ${dk ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className={`text-sm font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                                        <span className={`text-xs ${dk ? 'text-gray-400' : 'text-gray-500'}`}>{c.email}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${dk ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{c.category}</span>
                                      </div>
                                      {c.subject && <p className={`text-xs font-medium mb-1 ${dk ? 'text-gray-300' : 'text-gray-700'}`}>{c.subject}</p>}
                                      <p className={`text-xs leading-relaxed ${dk ? 'text-gray-400' : 'text-gray-600'}`}>{c.message}</p>
                                    </div>
                                    <span className={`text-[10px] flex-shrink-0 ${dk ? 'text-gray-600' : 'text-gray-400'}`}>{relTime(c.created_at)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                        }
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
