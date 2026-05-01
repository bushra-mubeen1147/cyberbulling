import { useState } from 'react';
import { 
  Download,
  FileJson,
  File,
  Database,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Copy
} from 'lucide-react';

export default function DataExport({ darkMode }) {
  const [exportJobs, setExportJobs] = useState([
    {
      id: 1,
      name: 'Monthly Analysis Report 2024',
      format: 'CSV',
      created: '2024-04-28',
      status: 'completed',
      size: '2.4 MB',
      records: 1247
    },
    {
      id: 2,
      name: 'Toxicity Trends April',
      format: 'JSON',
      created: '2024-04-27',
      status: 'completed',
      size: '1.8 MB',
      records: 890
    },
    {
      id: 3,
      name: 'User Analysis History',
      format: 'Excel',
      created: '2024-04-26',
      status: 'completed',
      size: '3.2 MB',
      records: 2156
    }
  ]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    name: '',
    format: 'csv',
    dataType: 'all',
    dateRange: 'all'
  });

  const handleCreateExport = () => {
    if (exportConfig.name.trim()) {
      const newExport = {
        id: exportJobs.length + 1,
        name: exportConfig.name,
        format: exportConfig.format.toUpperCase(),
        created: new Date().toISOString().split('T')[0],
        status: 'processing',
        size: '-',
        records: 0
      };
      setExportJobs([newExport, ...exportJobs]);
      setExportConfig({ name: '', format: 'csv', dataType: 'all', dateRange: 'all' });
      setShowExportModal(false);

      // Simulate completion
      setTimeout(() => {
        setExportJobs(prev => prev.map(job =>
          job.id === newExport.id
            ? { ...job, status: 'completed', size: '2.5 MB', records: Math.floor(Math.random() * 2000) }
            : job
        ));
      }, 3000);
    }
  };

  const getFormatIcon = (format) => {
    switch(format.toLowerCase()) {
      case 'json':
        return FileJson;
      case 'excel':
        return File;
      default:
        return Database;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'from-green-500 to-green-600';
      case 'processing':
        return 'from-blue-500 to-blue-600';
      case 'failed':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Data Export
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Export your analysis data in various formats
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Export Formats Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <Database className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>CSV Export</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Tabular format compatible with Excel and databases
          </p>
        </div>
        <div className={`p-5 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <FileJson className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>JSON Export</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Structured format for API integration and web apps
          </p>
        </div>
        <div className={`p-5 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <File className="w-6 h-6 text-green-600 mb-2" />
          <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Excel Export</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Spreadsheet format with charts and formatting
          </p>
        </div>
      </div>

      {/* Export Jobs */}
      <div>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Export History
        </h2>
        <div className="space-y-3">
          {exportJobs.map((job) => {
            const Icon = getFormatIcon(job.format);
            return (
              <div
                key={job.id}
                className={`p-5 rounded-xl border ${
                  darkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-all group`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getStatusColor(job.status)}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.name}
                        </h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          job.status === 'completed'
                            ? darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                            : job.status === 'processing'
                              ? darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                              : darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {job.status === 'completed' ? '✓ Completed' : job.status === 'processing' ? '⟳ Processing' : '✗ Failed'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Created</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{job.created}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Records</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {job.records.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Size</p>
                          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{job.size}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {job.status === 'completed' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                      }`}>
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}
                  {job.status === 'processing' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Clock className={`w-5 h-5 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Export Settings
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Include analysis metadata
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Include user information
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Anonymize sensitive data
            </span>
          </label>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Export Analysis Data
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Export Name
                </label>
                <input
                  type="text"
                  value={exportConfig.name}
                  onChange={(e) => setExportConfig({ ...exportConfig, name: e.target.value })}
                  placeholder="e.g., April Analysis Report"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Format
                </label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </label>
                <select
                  value={exportConfig.dateRange}
                  onChange={(e) => setExportConfig({ ...exportConfig, dateRange: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Time</option>
                  <option value="month">Last Month</option>
                  <option value="week">Last Week</option>
                  <option value="day">Today</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExport}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
