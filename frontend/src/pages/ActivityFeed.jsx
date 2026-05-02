import { useState, useEffect } from 'react';
import { 
  Activity,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

export default function ActivityFeed({ darkMode }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await historyAPI.getByUserId(user.id);
      const raw = (res.data?.data || []).slice(0, 20);

      const transformedActivities = raw.map((item, idx) => {
        const isToxic = item.toxicity_score > 0.5 || item.cyberbullying_prob > 0.5;
        const isHighRisk = item.toxicity_score > 0.7 || item.cyberbullying_prob > 0.7;
        
        let type = 'analysis';
        let title = 'Text Analysis Completed';
        let description = `Analyzed "${item.input_text.substring(0, 30)}${item.input_text.length > 30 ? '...' : ''}"`;
        let icon = MessageSquare;
        let color = 'from-blue-500 to-blue-600';

        if (isHighRisk) {
          type = 'alert';
          title = 'High Risk Content Detected';
          description = `Severe pattern detected - Toxicity: ${(item.toxicity_score * 100).toFixed(0)}%`;
          icon = AlertTriangle;
          color = 'from-red-500 to-red-600';
        } else if (isToxic) {
          type = 'alert';
          title = 'Toxic Content Found';
          description = `Content flagged - Toxicity: ${(item.toxicity_score * 100).toFixed(0)}%`;
          icon = AlertTriangle;
          color = 'from-orange-500 to-orange-600';
        } else {
          type = 'analysis';
          title = 'Safe Content Analyzed';
          description = `Content analyzed - Toxicity: ${(item.toxicity_score * 100).toFixed(0)}%`;
          icon = MessageSquare;
          color = 'from-green-500 to-green-600';
        }

        return {
          id: item.id,
          type,
          title,
          description,
          timestamp: getRelativeTime(item.created_at),
          icon,
          color,
          rawData: item
        };
      });

      setActivities(transformedActivities);

    } catch (err) {
      console.error('Failed to fetch activities:', err);
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
    fetchActivities();
  }, [user?.id]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Activity Feed
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Track all your recent activities and events
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
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
          All Activity
        </button>
        <button
          onClick={() => setFilter('analysis')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'analysis'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Analyses
        </button>
        <button
          onClick={() => setFilter('alert')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'alert'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setFilter('report')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'report'
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredActivities.map((activity, idx) => {
          const Icon = activity.icon;
          const isLast = idx === filteredActivities.length - 1;
          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${activity.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {!isLast && <div className={`w-1 h-12 mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>}
              </div>

              {/* Activity card */}
              <div className={`flex-1 p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors group`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activity.title}
                  </h3>
                  <button className={`p-2 rounded-lg ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors`}>
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.description}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Calendar className="w-3 h-3 inline-block mr-1" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
        darkMode
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
      }`}>
        Load More Activity
      </button>
    </div>
  );
}
