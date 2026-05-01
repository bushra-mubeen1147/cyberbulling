import { useState } from 'react';
import { 
  Activity,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';

export default function ActivityFeed({ darkMode }) {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'analysis',
      title: 'Text Analysis Completed',
      description: 'Analyzed "Check this out" - Toxicity: 15%',
      timestamp: '5 mins ago',
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      type: 'alert',
      title: 'High Risk Content Detected',
      description: 'Severe cyberbullying pattern detected',
      timestamp: '2 hours ago',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 3,
      type: 'report',
      title: 'Weekly Report Generated',
      description: '1,247 analyses completed - 89 toxic detected',
      timestamp: '1 day ago',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 4,
      type: 'analysis',
      title: 'Batch Analysis Complete',
      description: '50 texts processed - 4 critical findings',
      timestamp: '2 days ago',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 5,
      type: 'settings',
      title: 'Settings Updated',
      description: 'Notification preferences changed',
      timestamp: '3 days ago',
      icon: Activity,
      color: 'from-yellow-500 to-yellow-600'
    }
  ]);

  const [filter, setFilter] = useState('all');

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
