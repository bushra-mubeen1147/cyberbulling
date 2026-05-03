import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Share2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

const PATTERN_DEFS = [
  {
    name: 'Cyberbullying',
    category: 'Cyberbullying',
    keywords: ['hate', 'stupid', 'idiot', 'loser', 'ugly', 'dumb'],
    match: (t) => /hate|stupid|idiot|loser|ugly|dumb/i.test(t)
  },
  {
    name: 'Harassment',
    category: 'Harassment',
    keywords: ['annoying', 'shut up', 'go away', 'nobody likes', 'get lost'],
    match: (t) => /annoying|shut up|go away|nobody likes|get lost/i.test(t)
  },
  {
    name: 'Threats & Intimidation',
    category: 'Threats',
    keywords: ['die', 'kill', 'threat', 'hurt', 'destroy'],
    match: (t) => /\bdie\b|kill|threat|hurt|destroy/i.test(t)
  },
  {
    name: 'Hate Speech',
    category: 'Hate Speech',
    keywords: ['worst', 'terrible', 'pathetic', 'worthless', 'trash'],
    match: (t) => /worst|terrible|pathetic|worthless|trash/i.test(t)
  },
  {
    name: 'Exclusion & Isolation',
    category: 'Cyberbullying',
    keywords: ['alone', 'outcast', 'freak', 'nobody cares', 'no friends'],
    match: (t) => /alone|outcast|freak|nobody cares|no friends/i.test(t)
  }
];

const getCutoff = (range) => {
  if (range === 'all') return null;
  const d = new Date();
  if (range === 'day') d.setDate(d.getDate() - 1);
  else if (range === 'week') d.setDate(d.getDate() - 7);
  else if (range === 'month') d.setDate(d.getDate() - 30);
  return d;
};

const getSeverity = (count) => {
  if (count > 10) return 'critical';
  if (count > 5) return 'high';
  if (count > 2) return 'medium';
  return 'low';
};

export default function TrendingTopics({ darkMode }) {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [trendingPatterns, setTrendingPatterns] = useState([]);
  const { user } = useAuth();

  const fetchTrendingTopics = async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await historyAPI.getByUserId(user.id);
      const allData = res.data?.data || [];

      const cutoff = getCutoff(timeRange);
      const prevCutoff = timeRange !== 'all' ? getCutoff(timeRange) : null;

      // Current period
      const current = cutoff
        ? allData.filter(i => new Date(i.created_at) >= cutoff)
        : allData;

      // Previous period (same length before the current period) for trend
      let previous = [];
      if (cutoff && timeRange !== 'all') {
        const spanMs = new Date() - cutoff;
        const prevStart = new Date(cutoff - spanMs);
        previous = allData.filter(i => {
          const d = new Date(i.created_at);
          return d >= prevStart && d < cutoff;
        });
      }

      const maxDetections = Math.max(
        ...PATTERN_DEFS.map(p => current.filter(i => p.match(i.input_text || '')).length),
        1
      );

      const trends = PATTERN_DEFS.map((def, idx) => {
        const toxicCurrent = current.filter(i =>
          (i.toxicity_score > 0.3 || i.cyberbullying_prob > 0.3) && def.match(i.input_text || '')
        );
        const toxicPrev = previous.filter(i =>
          (i.toxicity_score > 0.3 || i.cyberbullying_prob > 0.3) && def.match(i.input_text || '')
        );

        const count = toxicCurrent.length;
        const prevCount = toxicPrev.length;
        let trendStr = '0%';
        if (prevCount === 0 && count > 0) trendStr = '+New';
        else if (prevCount > 0) {
          const pct = Math.round(((count - prevCount) / prevCount) * 100);
          trendStr = pct >= 0 ? `+${pct}%` : `${pct}%`;
        }

        return {
          id: idx + 1,
          pattern: def.name,
          category: def.category,
          detections: count,
          severity: getSeverity(count),
          trend: trendStr,
          trendUp: count >= prevCount,
          keywords: def.keywords,
          barWidth: Math.round((count / maxDetections) * 100)
        };
      }).sort((a, b) => b.detections - a.detections);

      setTrendingPatterns(trends);
    } catch (err) {
      console.error('Failed to fetch trending topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrendingTopics(); }, [user?.id, timeRange]);

  const severityGrad = (s) => {
    if (s === 'critical') return 'from-red-500 to-red-600';
    if (s === 'high') return 'from-orange-500 to-orange-600';
    if (s === 'medium') return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  const severityBadge = (s) => {
    if (s === 'critical') return darkMode ? 'bg-red-500/20 text-red-300 border-red-800' : 'bg-red-100 text-red-700 border-red-300';
    if (s === 'high') return darkMode ? 'bg-orange-500/20 text-orange-300 border-orange-800' : 'bg-orange-100 text-orange-700 border-orange-300';
    if (s === 'medium') return darkMode ? 'bg-yellow-500/20 text-yellow-300 border-yellow-800' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return darkMode ? 'bg-blue-500/20 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trending Topics</h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Most common harmful patterns detected in your analyses</p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 flex-wrap">
        {[['day','Last 24 Hours'],['week','Last 7 Days'],['month','Last 30 Days'],['all','All Time']].map(([val,lbl]) => (
          <button key={val} onClick={() => setTimeRange(val)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${timeRange === val ? 'bg-blue-600 text-white' : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {trendingPatterns.map((pattern, idx) => (
            <div key={pattern.id}
              className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all group`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${severityGrad(pattern.severity)} flex items-center justify-center font-bold text-white text-lg flex-shrink-0`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pattern.pattern}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm px-2.5 py-1 rounded-full border ${severityBadge(pattern.severity)}`}>
                          {pattern.severity.charAt(0).toUpperCase() + pattern.severity.slice(1)}
                        </span>
                        <span className={`text-sm px-2.5 py-1 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-800' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}>
                          {pattern.category}
                        </span>
                      </div>
                    </div>
                    <div className={`text-right flex-shrink-0 ${pattern.trendUp ? 'text-red-500' : 'text-green-500'}`}>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pattern.detections}</p>
                      <p className="text-sm font-semibold flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {pattern.trend}
                      </p>
                    </div>
                  </div>

                  {/* Real bar based on detection count */}
                  <div className={`h-2 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full bg-gradient-to-r ${severityGrad(pattern.severity)} transition-all duration-500`}
                      style={{ width: `${Math.max(pattern.barWidth, pattern.detections > 0 ? 5 : 0)}%` }}
                    />
                  </div>

                  <div>
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detected Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {pattern.keywords.map((kw, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {trendingPatterns.every(p => p.detections === 0) && (
            <div className={`p-8 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
              <AlertTriangle className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No harmful patterns detected</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                No toxic content found in the selected time range. Try analyzing more text.
              </p>
            </div>
          )}
        </div>
      )}

      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${darkMode ? 'text-blue-200/80' : 'text-blue-800'}`}>
            Trends compare the current period against the equivalent previous period. Counts reflect only analyses flagged as toxic or potentially harmful.
          </p>
        </div>
      </div>
    </div>
  );
}
