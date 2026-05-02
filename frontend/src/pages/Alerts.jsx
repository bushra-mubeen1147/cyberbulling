import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Flag,
  Trash2,
  Eye,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { alertsAPI } from '../api/api.js';

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Alerts({ darkMode }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await alertsAPI.getByUserId(user.id);
      const data = res.data?.data || [];
      setAlerts(data.map((a, idx) => ({
        id: a.id,
        type: a.severity === 'critical' ? 'high' : a.severity === 'high' ? 'medium' : 'low',
        severity: a.severity === 'critical' ? 'Critical' : a.severity === 'high' ? 'High' : 'Low',
        title: a.alert_type === 'high_risk' ? 'High-Risk Content Detected' : 'Toxic Content Flagged',
        description: a.content,
        timestamp: getRelativeTime(a.created_at),
        source: 'AI Detection',
        read: a.is_read
      })));
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [user?.id]);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'critical') return a.type === 'high';
    return true;
  });

  const handleMarkAsRead = (id) => setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  const handleDelete = (id) => setAlerts(alerts.filter(a => a.id !== id));
  const unreadCount = alerts.filter(a => !a.read).length;

  const getIcon = (type) => type === 'high' ? AlertTriangle : type === 'medium' ? Flag : Bell;
  const getColor = (type) => type === 'high' ? 'from-red-500 to-red-600' : type === 'medium' ? 'from-orange-500 to-orange-600' : 'from-yellow-500 to-yellow-600';
  const getBadge = (type) => {
    if (type === 'high') return darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700';
    if (type === 'medium') return darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700';
    return darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alerts & Warnings</h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor detected threats and anomalies</p>
        </div>
        {unreadCount > 0 && (
          <div className={`px-4 py-2 rounded-lg font-semibold ${darkMode ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {unreadCount} Unread
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'All Alerts'], ['unread', `Unread (${unreadCount})`], ['critical', 'Critical']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === val ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? filteredAlerts.map(alert => {
            const Icon = getIcon(alert.type);
            return (
              <div key={alert.id}
                className={`p-4 rounded-xl border ${alert.read ? darkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200' : darkMode ? 'bg-gray-800/60 border-gray-600' : 'bg-white border-gray-300'} ${!alert.read ? 'ring-1 ring-blue-500/30' : ''} transition-all hover:shadow-md group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getColor(alert.type)} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {alert.title}
                        {!alert.read && <span className="ml-2 inline-block w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${getBadge(alert.type)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" />{alert.timestamp}
                      </span>
                      <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{alert.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.read && (
                      <button onClick={() => handleMarkAsRead(alert.id)}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(alert.id)}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
              <Shield className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>All clear!</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filter !== 'all' ? 'No alerts matching this filter.' : 'No alerts yet — alerts appear when toxic content is detected.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alert Preferences */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alert Preferences</h3>
        <div className="space-y-3">
          {['Get notified for critical threats', 'Email alerts for high-risk content', 'Weekly threat summary'].map((label, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded" />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
