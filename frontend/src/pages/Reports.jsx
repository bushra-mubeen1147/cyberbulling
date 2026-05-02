import { useState, useEffect } from 'react';
import { 
  FileText,
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

export default function Reports({ darkMode }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const fetchReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const res = await historyAPI.getByUserId(user.id);
      const data = res.data?.data || [];

      const reportsMap = {};
      data.forEach(item => {
        const date = new Date(item.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!reportsMap[weekKey]) {
          reportsMap[weekKey] = {
            id: weekKey,
            title: `Weekly Safety Report`,
            date: weekKey,
            type: 'Weekly',
            status: 'Generated',
            stats: { total: 0, toxic: 0 },
            color: 'from-blue-500 to-blue-600'
          };
        }
        
        reportsMap[weekKey].stats.total++;
        if (item.toxicity_score > 0.5 || item.cyberbullying_prob > 0.5) {
          reportsMap[weekKey].stats.toxic++;
        }
      });

      // Convert to array and format
      const formattedReports = Object.values(reportsMap).map(r => ({
        ...r,
        stats: `${r.stats.total} analyses, ${r.stats.toxic} toxic`
      })).sort((a, b) => new Date(b.date) - new Date(a.date));

      setReports(formattedReports.length > 0 ? formattedReports : [{
        id: 1,
        title: 'No Reports Yet',
        date: new Date().toISOString().split('T')[0],
        type: 'Weekly',
        status: 'No Data',
        stats: '0 analyses, 0 toxic',
        color: 'from-gray-500 to-gray-600'
      }]);

    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const handleDelete = (id) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reports
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your analysis reports
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          darkMode
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}>
          <Filter className="w-4 h-4" />
          <span>All Types</span>
        </button>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          darkMode
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}>
          <Calendar className="w-4 h-4" />
          <span>This Month</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`p-6 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all group`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${report.color}`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {report.title}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      report.type === 'Weekly'
                        ? darkMode
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                        : report.type === 'Monthly'
                          ? darkMode
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-purple-100 text-purple-700'
                          : darkMode
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-700'
                    }`}>
                      {report.type}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Generated {report.date} • {report.stats}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelectedReport(report)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors`}
                  title="View Report"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                } transition-colors`}
                  title="Download Report"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'hover:bg-red-900/20 text-red-400'
                      : 'hover:bg-red-50 text-red-600'
                  } transition-colors`}
                  title="Delete Report"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className={`p-12 text-center rounded-xl border-2 border-dashed ${
          darkMode
            ? 'border-gray-700 bg-gray-800/20'
            : 'border-gray-300 bg-gray-50'
        }`}>
          <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No reports yet
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate your first report to get started
          </p>
        </div>
      )}

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Report
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Report Type
                </label>
                <select className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option>Weekly Report</option>
                  <option>Monthly Report</option>
                  <option>Custom Date Range</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    // Add new report logic here
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
