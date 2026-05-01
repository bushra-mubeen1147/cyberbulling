import { useState } from 'react';
import { 
  ClipboardList,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Flag
} from 'lucide-react';

export default function ContentReview({ darkMode }) {
  const [queue, setQueue] = useState([
    {
      id: 1,
      text: 'You are so stupid and worthless',
      severity: 'critical',
      flaggedBy: 'System',
      timestamp: '5 mins ago',
      reason: 'Severe cyberbullying detected',
      confidence: 98,
      status: 'pending'
    },
    {
      id: 2,
      text: 'Nobody likes you, go away',
      severity: 'high',
      flaggedBy: 'System',
      timestamp: '15 mins ago',
      reason: 'Harassment and exclusion',
      confidence: 95,
      status: 'pending'
    },
    {
      id: 3,
      text: 'This is so annoying, fix your app',
      severity: 'low',
      flaggedBy: 'System',
      timestamp: '1 hour ago',
      reason: 'Potential false positive - mild complaint',
      confidence: 45,
      status: 'pending'
    },
    {
      id: 4,
      text: 'You make terrible decisions',
      severity: 'medium',
      flaggedBy: 'System',
      timestamp: '2 hours ago',
      reason: 'Harsh criticism',
      confidence: 72,
      status: 'pending'
    }
  ]);

  const [filter, setFilter] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleApprove = (id) => {
    setQueue(queue.map(item => 
      item.id === id ? { ...item, status: 'approved' } : item
    ));
    setSelectedItem(null);
  };

  const handleReject = (id) => {
    setQueue(queue.map(item => 
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
    setSelectedItem(null);
  };

  const filteredQueue = queue.filter(item => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'approved') return item.status === 'approved';
    if (filter === 'rejected') return item.status === 'rejected';
    return true;
  });

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
          Content Review Queue
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manually review flagged content and verify AI decisions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: queue.filter(q => q.status === 'pending').length, icon: Clock, color: 'from-blue-500 to-blue-600' },
          { label: 'Approved', count: queue.filter(q => q.status === 'approved').length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
          { label: 'Rejected', count: queue.filter(q => q.status === 'rejected').length, icon: XCircle, color: 'from-red-500 to-red-600' },
          { label: 'Accuracy Rate', count: '94%', icon: Flag, color: 'from-purple-500 to-purple-600' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {filteredQueue.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all cursor-pointer group ${
              item.status === 'pending' ? 'ring-1 ring-blue-500/30' : ''
            }`}
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getSeverityColor(item.severity)} flex-shrink-0`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <p className={`text-lg font-semibold break-words ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      "{item.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${getSeverityBg(item.severity)}`}>
                      {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.confidence > 80
                        ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                        : darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.confidence}% confidence
                    </span>
                    {item.status !== 'pending' && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.status === 'approved'
                          ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                          : darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {item.status === 'pending' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(item.id);
                    }}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? 'hover:bg-green-900/20 text-green-400'
                        : 'hover:bg-green-50 text-green-600'
                    } transition-colors`}
                    title="Approve"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(item.id);
                    }}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? 'hover:bg-red-900/20 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    } transition-colors`}
                    title="Reject"
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Reason</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.reason}</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Flagged By</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.flaggedBy}</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Time</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQueue.length === 0 && (
        <div className={`p-12 text-center rounded-xl border-2 border-dashed ${
          darkMode
            ? 'border-gray-700 bg-gray-800/20'
            : 'border-gray-300 bg-gray-50'
        }`}>
          <ClipboardList className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No items to review
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            All flagged content has been reviewed
          </p>
        </div>
      )}
    </div>
  );
}
