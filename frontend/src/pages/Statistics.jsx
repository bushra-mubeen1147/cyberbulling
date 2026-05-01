import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  Calendar,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

export default function Statistics({ darkMode }) {
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    toxicContent: 0,
    highRisk: 0,
    safePercentage: 0,
    changes: { analyses: 0, toxic: 0, risk: 0, safe: 0 }
  });
  const [detectionBreakdown, setDetectionBreakdown] = useState([]);
  const { user } = useAuth();

  const fetchStatistics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all history for the user
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const historyData = data || [];
      const total = historyData.length;
      
      // Calculate toxic content (score > 0.5)
      const toxic = historyData.filter(item => 
        item.toxicity_score > 0.5 || item.cyberbullying_prob > 0.5
      ).length;
      
      // High risk (score > 0.7)
      const highRisk = historyData.filter(item => 
        item.toxicity_score > 0.7 || item.cyberbullying_prob > 0.7
      ).length;
      
      // Safe content percentage
      const safe = total > 0 ? ((total - toxic) / total * 100).toFixed(1) : 0;

      // Calculate detection breakdown by sentiment
      const sentimentCounts = {};
      historyData.forEach(item => {
        const sent = item.sentiment || 'neutral';
        sentimentCounts[sent] = (sentimentCounts[sent] || 0) + 1;
      });

      const breakdown = Object.entries(sentimentCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      setStats({
        totalAnalyses: total,
        toxicContent: toxic,
        highRisk: highRisk,
        safePercentage: safe,
        changes: {
          analyses: total > 0 ? Math.round((total / 100) * 12) : 0,
          toxic: toxic > 0 ? -5 : 0,
          risk: highRisk > 0 ? 3 : 0,
          safe: parseFloat(safe) > 0 ? 8 : 0
        }
      });
      
      setDetectionBreakdown(breakdown.length > 0 ? breakdown : [
        { type: 'Neutral', count: 0, percentage: 0 },
        { type: 'Positive', count: 0, percentage: 0 },
        { type: 'Negative', count: 0, percentage: 0 }
      ]);

    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [user?.id]);

  const formatValue = (value) => {
    if (value >= 1000) {
      return value.toLocaleString();
    }
    return value.toString();
  };

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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-6 rounded-xl border animate-pulse ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="h-10 w-10 bg-gray-400 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-400 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-400 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${stats.changes.analyses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.changes.analyses >= 0 ? '+' : ''}{stats.changes.analyses}%
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Analyses</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatValue(stats.totalAnalyses)}
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${stats.changes.toxic <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.changes.toxic >= 0 ? '+' : ''}{stats.changes.toxic}%
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toxic Content Found</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatValue(stats.toxicContent)}
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${stats.changes.risk <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.changes.risk >= 0 ? '+' : ''}{stats.changes.risk}%
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Risk Detections</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatValue(stats.highRisk)}
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${stats.changes.safe >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.changes.safe >= 0 ? '+' : ''}{stats.changes.safe}%
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Safe Content %</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.safePercentage}%
            </p>
          </div>
        </div>
      )}

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
