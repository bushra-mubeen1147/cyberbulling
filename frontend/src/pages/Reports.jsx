import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Eye, Trash2, Plus, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { historyAPI } from '../api/api.js';

const downloadCSV = (rows, filename) => {
  const headers = ['Week Start', 'Total Analyses', 'Toxic Count', 'Safe Count', 'Detection Rate'];
  const csv = [headers, ...rows.map(r => [r.date, r.total, r.toxic, r.safe, r.rate])].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function Reports({ darkMode }) {
  const [reports, setReports] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const { user } = useAuth();

  const buildReports = (data, type) => {
    const map = {};
    data.forEach(item => {
      const date = new Date(item.created_at);
      let key, label, start;

      if (type === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else {
        const ws = new Date(date);
        ws.setDate(date.getDate() - date.getDay());
        key = ws.toISOString().split('T')[0];
        start = key;
        label = `Week of ${key}`;
      }

      if (!map[key]) {
        map[key] = { id: key, title: `${type === 'monthly' ? 'Monthly' : 'Weekly'} Safety Report — ${label}`, date: start, type: type === 'monthly' ? 'Monthly' : 'Weekly', total: 0, toxic: 0, color: 'from-blue-500 to-blue-600' };
      }
      map[key].total++;
      if (item.toxicity_score > 0.5 || item.cyberbullying_prob > 0.5) map[key].toxic++;
    });

    return Object.values(map).map(r => ({
      ...r,
      safe: r.total - r.toxic,
      rate: r.total > 0 ? `${Math.round((r.toxic / r.total) * 100)}%` : '0%',
      stats: `${r.total} analyses · ${r.toxic} toxic · ${Math.round(r.total > 0 ? ((r.total - r.toxic) / r.total * 100) : 0)}% safe`
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const fetchReports = async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await historyAPI.getByUserId(user.id);
      const data = res.data?.data || [];
      setAllHistory(data);
      setReports(buildReports(data, 'weekly'));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [user?.id]);

  const handleGenerate = () => {
    const built = buildReports(allHistory, reportType);
    setReports(built);
    setShowModal(false);
  };

  const handleDownload = (report) => {
    downloadCSV([report], `safetext-${report.type.toLowerCase()}-${report.date}.csv`);
  };

  const handleDownloadAll = () => {
    downloadCSV(reports, `safetext-all-reports-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDelete = (id) => setReports(reports.filter(r => r.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reports</h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Auto-generated weekly and monthly analysis summaries
          </p>
        </div>
        <div className="flex gap-2">
          {reports.length > 0 && (
            <button onClick={handleDownloadAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          )}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
          <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No reports yet</h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Analyze some text first, then generate a report.</p>
          <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Generate First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id}
              className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all group`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${report.color} flex-shrink-0`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                        report.type === 'Weekly'
                          ? darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                          : darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>{report.type}</span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {report.stats}
                    </p>
                    {/* Mini bar */}
                    <div className={`mt-3 h-1.5 rounded-full overflow-hidden w-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-red-500" style={{ width: report.rate }} />
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Detection rate: {report.rate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setSelectedReport(report)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    title="View Report"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDownload(report)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    title="Download CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(report.id)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReport.title}</h2>
              <button onClick={() => setSelectedReport(null)}>
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['Period', selectedReport.date],
                ['Total Analyses', selectedReport.total],
                ['Toxic Content', selectedReport.toxic],
                ['Safe Content', selectedReport.safe],
                ['Detection Rate', selectedReport.rate],
              ].map(([label, val]) => (
                <div key={label} className={`flex justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => handleDownload(selectedReport)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generate Report</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Report Type</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                </select>
                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Groups your {allHistory.length} saved analyses by {reportType === 'weekly' ? 'week' : 'month'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >Cancel</button>
                <button onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >Generate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
