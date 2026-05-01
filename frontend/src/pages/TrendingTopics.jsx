import { useState } from 'react';
import { 
  TrendingUp,
  BarChart3,
  Flame,
  Target,
  AlertTriangle,
  Share2,
  Info
} from 'lucide-react';

export default function TrendingTopics({ darkMode }) {
  const [timeRange, setTimeRange] = useState('week');

  const trendingPatterns = [
    {
      id: 1,
      pattern: 'Name-calling & insults',
      detections: 234,
      severity: 'high',
      trend: '+12%',
      keywords: ['loser', 'stupid', 'idiot', 'dummy'],
      category: 'Cyberbullying'
    },
    {
      id: 2,
      pattern: 'Exclusion & isolation',
      detections: 189,
      severity: 'high',
      trend: '+8%',
      keywords: ['alone', 'nobody likes', 'outcast', 'freak'],
      category: 'Harassment'
    },
    {
      id: 3,
      pattern: 'Accusations & false rumors',
      detections: 156,
      severity: 'medium',
      trend: '+5%',
      keywords: ['liar', 'fake', 'rumor', 'spread'],
      category: 'Harassment'
    },
    {
      id: 4,
      pattern: 'Threats & intimidation',
      detections: 143,
      severity: 'critical',
      trend: '+3%',
      keywords: ['threat', 'watch', 'careful', 'danger'],
      category: 'Threats'
    },
    {
      id: 5,
      pattern: 'Sexual harassment content',
      detections: 98,
      severity: 'critical',
      trend: '-2%',
      keywords: ['inappropriate', 'harassment', 'unwanted'],
      category: 'Sexual Harassment'
    },
    {
      id: 6,
      pattern: 'Hate speech & discrimination',
      detections: 67,
      severity: 'critical',
      trend: '+1%',
      keywords: ['hate', 'prejudice', 'discriminate'],
      category: 'Hate Speech'
    }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case 'critical':
        return darkMode ? 'bg-red-500/20 text-red-300 border-red-800' : 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return darkMode ? 'bg-orange-500/20 text-orange-300 border-orange-800' : 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return darkMode ? 'bg-yellow-500/20 text-yellow-300 border-yellow-800' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return darkMode ? 'bg-blue-500/20 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Trending Topics
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Most common harmful patterns detected
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {['day', 'week', 'month', 'all'].map(range => (
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
            {range === 'day' && 'Last 24 Hours'}
            {range === 'week' && 'Last 7 Days'}
            {range === 'month' && 'Last 30 Days'}
            {range === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Trending Patterns */}
      <div className="space-y-4">
        {trendingPatterns.map((pattern, idx) => (
          <div
            key={pattern.id}
            className={`p-6 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all group`}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Rank and Icon */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getSeverityColor(pattern.severity)} flex items-center justify-center font-bold text-white text-lg`}>
                  #{idx + 1}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {pattern.pattern}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm px-2.5 py-1 rounded-full border ${getSeverityBg(pattern.severity)}`}>
                        {pattern.severity.charAt(0).toUpperCase() + pattern.severity.slice(1)}
                      </span>
                      <span className={`text-sm px-2.5 py-1 rounded-full ${
                        darkMode
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-800'
                          : 'bg-purple-100 text-purple-700 border border-purple-300'
                      }`}>
                        {pattern.category}
                      </span>
                    </div>
                  </div>
                  <div className={`text-right flex-shrink-0 ${pattern.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                    <p className="text-2xl font-bold">{pattern.detections}</p>
                    <p className="text-sm font-semibold flex items-center justify-end gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {pattern.trend}
                    </p>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className={`h-2 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full bg-gradient-to-r ${getSeverityColor(pattern.severity)}`}
                    style={{ width: `${(pattern.detections / 250) * 100}%` }}
                  ></div>
                </div>

                {/* Keywords */}
                <div>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Common Keywords:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          darkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        "{keyword}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button className={`p-2 rounded-lg ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                } transition-colors`} title="View Details">
                  <Info className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                } transition-colors`} title="Share">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-blue-900/20 border-blue-800'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0 mt-1`} />
          <div>
            <h4 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              Pro Tip
            </h4>
            <p className={`text-sm ${darkMode ? 'text-blue-200/70' : 'text-blue-700/70'}`}>
              Monitor these trending topics to stay ahead of emerging harassment patterns and better protect your community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
