import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, BarChart3, Shield,
  TrendingUp, Activity, Flag, Eye, Ban, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { adminAPI } from '../api/api.js';

const relTime = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function Admin({ darkMode }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchAdminData = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [usersRes, historyRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getHistory()
      ]);
      setUsers(usersRes.data?.data || []);
      setHistory(historyRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data. Make sure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, [user?.id]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setHistory(history.filter(h => h.user_id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  // Computed stats from real data
  const totalUsers = users.length;
  const totalAnalyses = history.length;
  const flaggedCount = history.filter(h => h.toxicity_score > 0.5 || h.cyberbullying_prob > 0.5).length;
  const detectionRate = totalAnalyses > 0 ? Math.round((flaggedCount / totalAnalyses) * 100) : 0;

  const flaggedContent = history
    .filter(h => h.toxicity_score > 0.5 || h.cyberbullying_prob > 0.5)
    .sort((a, b) => (b.toxicity_score || 0) - (a.toxicity_score || 0))
    .slice(0, 20)
    .map(h => ({
      id: h.id,
      user: h.user_email || h.user_name || `User #${h.user_id}`,
      text: (h.input_text || '').substring(0, 60) + (h.input_text?.length > 60 ? '…' : ''),
      toxicity: Math.round((h.toxicity_score || 0) * 100),
      cyberbullying: Math.round((h.cyberbullying_prob || 0) * 100),
      severity: (h.toxicity_score || 0) > 0.7 ? 'High' : 'Medium',
      date: new Date(h.created_at).toLocaleString()
    }));

  // Recent 5 analyses for activity feed
  const recentActivity = history
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Users enriched with analysis count
  const enrichedUsers = users.map(u => ({
    ...u,
    analyses: history.filter(h => h.user_id === u.id).length,
    flagged: history.filter(h => h.user_id === u.id && (h.toxicity_score > 0.5 || h.cyberbullying_prob > 0.5)).length,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'
  }));

  const statsCards = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'blue' },
    { label: 'Total Analyses', value: totalAnalyses, icon: BarChart3, color: 'green' },
    { label: 'Flagged Content', value: flaggedCount, icon: Flag, color: 'red' },
    { label: 'Detection Rate', value: `${detectionRate}%`, icon: TrendingUp, color: 'purple' }
  ];

  const colorMap = {
    blue: { bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-100', icon: 'text-blue-600', text: darkMode ? 'text-blue-400' : 'text-blue-700' },
    green: { bg: darkMode ? 'bg-green-900/30' : 'bg-green-100', icon: 'text-green-600', text: darkMode ? 'text-green-400' : 'text-green-700' },
    red: { bg: darkMode ? 'bg-red-900/30' : 'bg-red-100', icon: 'text-red-600', text: darkMode ? 'text-red-400' : 'text-red-700' },
    purple: { bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-100', icon: 'text-purple-600', text: darkMode ? 'text-purple-400' : 'text-purple-700' }
  };

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16 flex items-center justify-center`}>
        <div className="text-center p-8">
          <Shield className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-500' : 'text-red-600'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Access Denied</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor platform activity, users, and flagged content</p>
              </div>
            </div>
            <button onClick={fetchAdminData}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow`}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, i) => {
              const c = colorMap[stat.color];
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-5 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-lg ${c.bg}`}>
                      <stat.icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{loading ? '—' : stat.value}</p>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-300 dark:border-gray-700 mb-6">
            {['overview', 'flagged', 'users'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 font-semibold text-sm capitalize transition-all ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >{tab}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Analysis by sentiment */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-5">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Content Breakdown</h2>
                    </div>
                    {totalAnalyses === 0 ? (
                      <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No analyses yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {[
                          { label: 'Safe Content', count: totalAnalyses - flaggedCount, color: 'bg-green-500' },
                          { label: 'Toxic / Flagged', count: flaggedCount, color: 'bg-red-500' },
                          { label: 'High Risk (>70%)', count: history.filter(h => (h.toxicity_score || 0) > 0.7 || (h.cyberbullying_prob || 0) > 0.7).length, color: 'bg-orange-500' },
                          { label: 'Positive Sentiment', count: history.filter(h => h.sentiment === 'positive').length, color: 'bg-blue-500' },
                          { label: 'Negative Sentiment', count: history.filter(h => h.sentiment === 'negative').length, color: 'bg-purple-500' },
                        ].map(({ label, count, color }) => (
                          <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{label}</span>
                              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                            </div>
                            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className={`h-full rounded-full ${color}`}
                                style={{ width: `${totalAnalyses > 0 ? Math.round((count / totalAnalyses) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity — real data */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-5">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
                    </div>
                    {recentActivity.length === 0 ? (
                      <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No activity yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map(item => {
                          const isToxic = (item.toxicity_score || 0) > 0.5;
                          return (
                            <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className={`p-2 rounded-lg flex-shrink-0 ${isToxic ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                {isToxic
                                  ? <AlertTriangle className="w-4 h-4 text-red-600" />
                                  : <Activity className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {isToxic ? '⚠ Toxic content analyzed' : 'Text analysis completed'}
                                </p>
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {(item.input_text || '').substring(0, 40)}…
                                </p>
                                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {relTime(item.created_at)} · {item.user_email || `User #${item.user_id}`}
                                </p>
                              </div>
                              <span className={`text-xs font-bold flex-shrink-0 ${isToxic ? 'text-red-500' : 'text-green-500'}`}>
                                {Math.round((item.toxicity_score || 0) * 100)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FLAGGED CONTENT */}
              {activeTab === 'flagged' && (
                flaggedContent.length === 0 ? (
                  <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
                    <Shield className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No flagged content</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Content with toxicity &gt;50% appears here.</p>
                  </div>
                ) : (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                          <tr>
                            {['User', 'Content', 'Toxicity', 'Cyberbullying', 'Severity', 'Date'].map(h => (
                              <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {flaggedContent.map(item => (
                            <tr key={item.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.user}</td>
                              <td className={`px-5 py-4 text-sm max-w-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} title={item.text}>{item.text}</td>
                              <td className="px-5 py-4 text-sm font-bold text-red-500">{item.toxicity}%</td>
                              <td className="px-5 py-4 text-sm font-bold text-orange-500">{item.cyberbullying}%</td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  item.severity === 'High'
                                    ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                    : darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                                }`}>{item.severity}</span>
                              </td>
                              <td className={`px-5 py-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{item.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                enrichedUsers.length === 0 ? (
                  <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
                    <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No users found</p>
                  </div>
                ) : (
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                          <tr>
                            {['Name', 'Email', 'Role', 'Analyses', 'Flagged', 'Joined', 'Actions'].map(h => (
                              <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {enrichedUsers.map(u => (
                            <tr key={u.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                              <td className={`px-5 py-4 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.name}</td>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{u.email}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  u.role === 'admin'
                                    ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                                    : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                }`}>{u.role}</span>
                              </td>
                              <td className={`px-5 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{u.analyses}</td>
                              <td className={`px-5 py-4 text-sm font-medium ${u.flagged > 0 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.flagged}</td>
                              <td className={`px-5 py-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{u.joined}</td>
                              <td className="px-5 py-4">
                                {u.id !== user?.id && (
                                  <button onClick={() => handleDeleteUser(u.id)}
                                    className={`p-1.5 rounded-lg ${darkMode ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'} transition-colors`}
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}

            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
