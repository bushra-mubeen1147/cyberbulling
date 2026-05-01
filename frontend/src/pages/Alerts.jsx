import { useState, useEffect } from 'react';
import { 
  Bell,
  AlertTriangle,
  Flag,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

export default function Alerts({ darkMode }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('unread');
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch history from Supabase
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform history into alerts based on toxicity scores
      const transformedAlerts = (data || []).map((item, idx) => {
        const toxicity = item.toxicity_score || 0;
        const cyberbullying = item.cyberbullying_prob || 0;
        const maxScore = Math.max(toxicity, cyberbullying);
        
        let type = 'low';
        let severity = 'Low';
        let title = 'Content Analyzed';
        let description = `Text analyzed - Toxicity: ${(toxicity * 100).toFixed(0)}%`;
        
        if (maxScore > 0.7) {
          type = 'high';
          severity = 'Critical';
          title = 'Critical Threat Detected';
          description = `Severe cyberbullying content detected - Toxicity: ${(toxicity * 100).toFixed(0)}%`;
        } else if (maxScore > 0.5) {
          type = 'medium';
          severity = 'High';
          title = 'Potential Harmful Content';
          description = `Content flagged - Toxicity: ${(toxicity * 100).toFixed(0)}%`;
        } else if (item.sentiment === 'negative') {
          type = 'low';
          severity = 'Low';
          title = 'Negative Sentiment Detected';
          description = `Content with negative sentiment - may require review`;
        }

        return {
          id: item.id,
          type,
          title,
          description,
          timestamp: getRelativeTime(item.created_at),
          source: 'User Input',
          read: idx > 2, // Mark older ones as read
          severity,
          rawData: item
        };
      }).filter(a => a.type !== 'low' || a.severity === 'Low'); // Show all but filter low by default

      setAlerts(transformedAlerts);

    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchAlerts();
  }, [user?.id]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'critical') return alert.type === 'high';
    if (filter === 'archived') return false;
    return true;
  });

  const handleMarkAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDelete = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const getIcon = (type) => {
    switch(type) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Flag;
      default:
        return Bell;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'high':
        return 'from-red-500 to-red-600';
      case 'medium':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-yellow-500 to-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Alerts & Warnings
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor detected threats and anomalies
          </p>
        </div>
        {unreadCount > 0 && (
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            darkMode
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {unreadCount} Unread
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'critical'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Alerts
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${
                  alert.read
                    ? darkMode
                      ? 'bg-gray-800/30 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                    : darkMode
                      ? 'bg-gray-800/60 border-gray-600'
                      : 'bg-white border-gray-300'
                } ${!alert.read ? 'ring-1 ring-blue-500/30' : ''} transition-all hover:shadow-md group`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getColor(alert.type)} flex-shrink-0 ${!alert.read ? 'shadow-lg' : ''}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ${!alert.read ? 'text-lg' : 'text-base'}`}>
                        {alert.title}
                        {!alert.read && <span className="ml-2 inline-block w-2.5 h-2.5 bg-blue-600 rounded-full"></span>}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        alert.type === 'high'
                          ? darkMode
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-red-100 text-red-700'
                          : alert.type === 'medium'
                            ? darkMode
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-orange-100 text-orange-700'
                            : darkMode
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                      <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {alert.source}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.read && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className={`p-2 rounded-lg ${
                          darkMode
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors`}
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? 'hover:bg-red-900/20 text-red-400'
                          : 'hover:bg-red-50 text-red-600'
                      } transition-colors`}
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`p-12 text-center rounded-xl border-2 border-dashed ${
            darkMode
              ? 'border-gray-700 bg-gray-800/20'
              : 'border-gray-300 bg-gray-50'
          }`}>
            <Shield className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              All clear!
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No alerts to display
            </p>
          </div>
        )}
      </div>

      {/* Alert Settings */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Alert Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Get notified for critical threats
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email alerts for high-risk content
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Weekly threat summary
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
