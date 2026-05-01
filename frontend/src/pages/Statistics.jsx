import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  Calendar,
  Download
} from 'lucide-react';

export default function Statistics({ darkMode }) {
  const [timeRange, setTimeRange] = useState('7days');

  const stats = [
    {
      label: 'Total Analyses',
      value: '1,247',
      change: '+12%',
      positive: true,
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Toxic Content Found',
      value: '89',
      change: '-5%',
      positive: false,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'High Risk Detections',
      value: '12',
      change: '+3%',
      positive: false,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Safe Content %',
      value: '92.8%',
      change: '+8%',
      positive: true,
      icon: BarChart3,
      color: 'from-green-500 to-green-600'
    }
  ];

  const detectionBreakdown = [
    { type: 'Cyberbullying', count: 34, percentage: 38 },
    { type: 'Harassment', count: 28, percentage: 31 },
    { type: 'Hate Speech', count: 15, percentage: 17 },
    { type: 'Spam', count: 12, percentage: 14 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Statistics & Analytics
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your analysis metrics and trends
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {['7days', '30days', '90days', 'all'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range === '7days' && 'Last 7 Days'}
            {range === '30days' && 'Last 30 Days'}
            {range === '90days' && 'Last 90 Days'}
            {range === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-xl border ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Breakdown */}
        <div
          className={`lg:col-span-2 p-6 rounded-xl border ${
            darkMode
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Detection Breakdown
          </h3>
          <div className="space-y-4">
            {detectionBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.type}
                  </span>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all ${
                      idx === 0
                        ? 'bg-red-500'
                        : idx === 1
                          ? 'bg-orange-500'
                          : idx === 2
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Insights */}
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Insights
          </h3>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                📈 Trend Up
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-blue-200/70' : 'text-blue-700/70'}`}>
                Toxic content up 5% this week
              </p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                ✓ Safe Majority
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-green-200/70' : 'text-green-700/70'}`}>
                92.8% of content is safe
              </p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                🎯 Peak Time
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-purple-200/70' : 'text-purple-700/70'}`}>
                Most analyses at 6PM-8PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
