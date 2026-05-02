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
import { historyAPI } from '../api/api.js';

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

  const [insights, setInsights] = useState([]);

  const getDateCutoff = (range) => {
    const now = new Date();
    if (range === '7days') { now.setDate(now.getDate() - 7); return now; }
    if (range === '30days') { now.setDate(now.getDate() - 30); return now; }
    if (range === '90days') { now.setDate(now.getDate() - 90); return now; }
    return null;
  };

  const fetchStatistics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all history for the user via backend API
      const res = await historyAPI.getByUserId(user.id);
      const allData = res.data?.data || [];

      // Apply time range filter
      const cutoff = getDateCutoff(timeRange);
      const historyData = cutoff
        ? allData.filter(item => new Date(item.created_at) >= cutoff)
        : allData;

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
      const safeCount = total - toxic;
      const safe = total > 0 ? ((safeCount / total) * 100).toFixed(1) : 0;

      // Detection breakdown by sentiment
      const sentimentCounts = {};
      historyData.forEach(item => {
        const sent = item.sentiment || 'neutral';
        sentimentCounts[sent] = (sentimentCounts[sent] || 0) + 1;
      });

      const breakdown = Object.entries(sentimentCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalAnalyses: total,
        toxicContent: toxic,
        highRisk,
        safePercentage: safe,
        changes: { analyses: 0, toxic: 0, risk: 0, safe: 0 }
      });

      setDetectionBreakdown(breakdown.length > 0 ? breakdown : [
        { type: 'Neutral', count: 0, percentage: 0 },
        { type: 'Positive', count: 0, percentage: 0 },
        { type: 'Negative', count: 0, percentage: 0 }
      ]);

      // Build dynamic insights
      const newInsights = [];
      if (total === 0) {
        newInsights.push({ emoji: '📊', title: 'No Data Yet', body: 'Analyze some text to see your stats here.', color: 'blue' });
      } else {
        const toxicPct = total > 0 ? ((toxic / total) * 100).toFixed(0) : 0;
        const safePct = parseFloat(safe);

        if (highRisk > 0) {
          newInsights.push({ emoji: '⚠️', title: 'High Risk Found', body: `${highRisk} high-risk item${highRisk > 1 ? 's' : ''} detected — review your alerts.`, color: 'red' });
        }
        if (safePct >= 70) {
          newInsights.push({ emoji: '✓', title: 'Mostly Safe', body: `${safePct}% of your analyzed content is safe.`, color: 'green' });
        }
        if (toxic > 0) {
          newInsights.push({ emoji: '📈', title: 'Toxic Rate', body: `${toxicPct}% of analyses flagged as toxic or harmful.`, color: 'orange' });
        }
        const negative = historyData.filter(i => i.sentiment === 'negative').length;
        if (negative > 0) {
          newInsights.push({ emoji: '😟', title: 'Negative Sentiment', body: `${negative} item${negative > 1 ? 's' : ''} had negative sentiment detected.`, color: 'purple' });
        }
      }
      setInsights(newInsights);

    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [user?.id, timeRange]);

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

        {/* Dynamic Insights */}
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
            {insights.length === 0 && !loading ? (
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No insights available yet.
              </p>
            ) : (
              insights.map((insight, idx) => {
                const palettes = {
                  blue:   { wrap: darkMode ? 'bg-blue-900/20 border-blue-800'   : 'bg-blue-50 border-blue-200',     title: darkMode ? 'text-blue-300'   : 'text-blue-900',   body: darkMode ? 'text-blue-200/70'   : 'text-blue-700/70'   },
                  green:  { wrap: darkMode ? 'bg-green-900/20 border-green-800'  : 'bg-green-50 border-green-200',   title: darkMode ? 'text-green-300'  : 'text-green-900',  body: darkMode ? 'text-green-200/70'  : 'text-green-700/70'  },
                  red:    { wrap: darkMode ? 'bg-red-900/20 border-red-800'      : 'bg-red-50 border-red-200',       title: darkMode ? 'text-red-300'    : 'text-red-900',    body: darkMode ? 'text-red-200/70'    : 'text-red-700/70'    },
                  orange: { wrap: darkMode ? 'bg-orange-900/20 border-orange-800': 'bg-orange-50 border-orange-200', title: darkMode ? 'text-orange-300' : 'text-orange-900', body: darkMode ? 'text-orange-200/70' : 'text-orange-700/70' },
                  purple: { wrap: darkMode ? 'bg-purple-900/20 border-purple-800': 'bg-purple-50 border-purple-200', title: darkMode ? 'text-purple-300' : 'text-purple-900', body: darkMode ? 'text-purple-200/70' : 'text-purple-700/70' },
                };
                const p = palettes[insight.color] || palettes.blue;
                return (
                  <div key={idx} className={`p-3 rounded-lg border ${p.wrap}`}>
                    <p className={`text-sm font-medium ${p.title}`}>{insight.emoji} {insight.title}</p>
                    <p className={`text-xs mt-1 ${p.body}`}>{insight.body}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
