import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Shield,
  TrendingUp,
  Activity,
  Flag,
  Eye,
  Ban
} from 'lucide-react';

export default function Admin({ darkMode }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { label: 'Total Users', value: '12,847', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Flagged Content', value: '2,341', change: '+8%', icon: AlertTriangle, color: 'red' },
    { label: 'Total Analysis', value: '45,923', change: '+24%', icon: BarChart3, color: 'purple' },
    { label: 'Reports', value: '573', change: '+5%', icon: FileText, color: 'orange' },
  ];

  const flaggedContent = [
    { id: 1, user: 'user@example.com', text: 'This is extremely offensive content...', toxicity: 95, severity: 'High', date: '2025-12-02 10:30 AM' },
    { id: 2, user: 'another@example.com', text: 'Stop being so stupid and annoying...', toxicity: 87, severity: 'High', date: '2025-12-02 09:15 AM' },
    { id: 3, user: 'test@example.com', text: 'You are such a loser and nobody likes you...', toxicity: 92, severity: 'High', date: '2025-12-01 11:45 PM' },
    { id: 4, user: 'sample@example.com', text: 'This is inappropriate and harmful...', toxicity: 78, severity: 'Medium', date: '2025-12-01 08:20 PM' },
    { id: 5, user: 'demo@example.com', text: 'Rude and disrespectful behavior...', toxicity: 71, severity: 'Medium', date: '2025-12-01 06:30 PM' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', analyses: 45, joined: '2025-11-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', analyses: 32, joined: '2025-11-20', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', analyses: 18, joined: '2025-11-25', status: 'Active' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', analyses: 67, joined: '2025-10-30', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', analyses: 12, joined: '2025-11-28', status: 'Suspended' },
  ];

  const reports = [
    { id: 1, reporter: 'user1@example.com', type: 'Harassment', description: 'Repeated bullying behavior', date: '2025-12-02', status: 'Pending' },
    { id: 2, reporter: 'user2@example.com', type: 'Hate Speech', description: 'Offensive language targeting group', date: '2025-12-01', status: 'Under Review' },
    { id: 3, reporter: 'user3@example.com', type: 'Spam', description: 'Multiple unwanted messages', date: '2025-12-01', status: 'Resolved' },
    { id: 4, reporter: 'user4@example.com', type: 'Cyberbullying', description: 'Intimidating messages', date: '2025-11-30', status: 'Pending' },
  ];

  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (severity === 'Medium') return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (status === 'Suspended') return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    if (status === 'Under Review') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Admin Dashboard
              </h1>
            </div>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Monitor and manage platform activity, users, and content
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                </div>
                <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-300 dark:border-gray-700">
              {['overview', 'flagged', 'users', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold text-sm capitalize transition-all ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : darkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart Placeholder */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Activity Overview
                    </h2>
                  </div>
                  <div className={`h-64 flex items-center justify-center border-2 border-dashed rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <TrendingUp className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Chart visualization would go here
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Activity
                  </h2>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            New analysis completed
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            {i} minute{i > 1 ? 's' : ''} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flagged' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>User</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Content</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Toxicity</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Severity</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Date</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {flaggedContent.map((item) => (
                        <tr key={item.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{item.user}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xs truncate`}>{item.text}</td>
                          <td className={`px-6 py-4 text-sm font-semibold text-red-600`}>{item.toxicity}%</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(item.severity)}`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" title="View">
                                <Eye className="w-4 h-4 text-blue-600" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Ban">
                                <Ban className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Name</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Email</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Analyses</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Joined</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                          <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{user.analyses}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.joined}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" title="View">
                                <Eye className="w-4 h-4 text-blue-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Reporter</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Type</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Description</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Date</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {reports.map((report) => (
                        <tr key={report.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{report.reporter}</td>
                          <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{report.type}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.description}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{report.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" title="View">
                                <Eye className="w-4 h-4 text-blue-600" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" title="Flag">
                                <Flag className="w-4 h-4 text-green-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
