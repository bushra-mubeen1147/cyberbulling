import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Lock, 
  Trash2, 
  Save, 
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Settings,
  Globe,
  Smartphone,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { supabase } from '../lib/supabase.js';

export default function Profile({ darkMode }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({ totalAnalyses: 0, flaggedContent: 0, lastActive: null });

  // Account Settings State
  const [accountData, setAccountData] = useState({
    fullName: '',
    email: user?.email || '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  // Security Settings State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    highRiskAlerts: true,
    weeklyReports: false,
    productUpdates: true,
    securityAlerts: true,
    analysisComplete: true
  });

  // Privacy Settings State
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    shareAnalytics: false,
    dataRetention: '90days'
  });

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('analysis_history')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          const flagged = data.filter(item => 
            item.toxicity_score > 0.7 || item.cyberbullying_prob > 0.7
          ).length;

          setStats({
            totalAnalyses: data.length,
            flaggedContent: flagged,
            lastActive: data.length > 0 ? data[0].created_at : null
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call (replace with actual Supabase update)
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'Profile updated successfully!');
    } catch (err) {
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      showMessage('error', 'New passwords do not match!');
      return;
    }

    if (securityData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      });

      if (error) throw error;

      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securityData.twoFactorEnabled
      });
      showMessage('success', 'Password changed successfully!');
    } catch (err) {
      showMessage('error', err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      showMessage('success', 'Notification preferences updated!');
    } catch (err) {
      showMessage('error', 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showMessage('success', 'Privacy settings updated!');
    } catch (err) {
      showMessage('error', 'Failed to update privacy settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    showMessage('success', 'Data export started. You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      showMessage('error', 'Account deletion is disabled in demo mode.');
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Please Sign In
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You need to be signed in to access profile settings.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Profile Settings
              </h1>
            </div>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Analyses
                </span>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalAnalyses}
              </p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Flagged Content
                </span>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.flaggedContent}
              </p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last Active
                </span>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {/* Tabs and Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Account Information
                    </h2>

                    <form onSubmit={handleAccountUpdate} className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center gap-6">
                        <div className={`relative w-24 h-24 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                          <User className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <button
                            type="button"
                            className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Profile Picture
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            JPG, PNG or GIF. Max size 2MB
                          </p>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={accountData.fullName}
                          onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                          placeholder="John Doe"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type="email"
                            value={accountData.email}
                            onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-gray-50 border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            readOnly
                          />
                        </div>
                        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>

                      {/* Username */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={accountData.username}
                          onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                          placeholder="johndoe123"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Bio
                        </label>
                        <textarea
                          value={accountData.bio}
                          onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        />
                      </div>

                      {/* Location & Website */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Location
                          </label>
                          <div className="relative">
                            <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                              type="text"
                              value={accountData.location}
                              onChange={(e) => setAccountData({ ...accountData, location: e.target.value })}
                              placeholder="New York, USA"
                              className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                                darkMode
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Website
                          </label>
                          <input
                            type="url"
                            value={accountData.website}
                            onChange={(e) => setAccountData({ ...accountData, website: e.target.value })}
                            placeholder="https://example.com"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Security Settings
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Minimum 8 characters, include uppercase, lowercase, and numbers
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className={`w-full pl-11 pr-12 py-3 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div>
                              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Two-Factor Authentication
                              </h3>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Add an extra layer of security
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecurityData({ ...securityData, twoFactorEnabled: !securityData.twoFactorEnabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              securityData.twoFactorEnabled ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Change Password Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Lock className="w-5 h-5" />
                        <span>{loading ? 'Changing...' : 'Change Password'}</span>
                      </button>
                    </form>

                    {/* Sessions */}
                    <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700">
                      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Active Sessions
                      </h3>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Current Device
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Windows · Chrome · Last active now
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notification Preferences
                    </h2>

                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your account' },
                        { key: 'highRiskAlerts', label: 'High-Risk Content Alerts', desc: 'Get notified when high-risk content is detected' },
                        { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly summaries of your analysis activity' },
                        { key: 'productUpdates', label: 'Product Updates', desc: 'Stay informed about new features and improvements' },
                        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important notifications about account security' },
                        { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Notifications when your analysis is ready' }
                      ].map((item) => (
                        <div
                          key={item.key}
                          className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item.label}
                              </h3>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.desc}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                                notifications[item.key] ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Privacy & Data
                    </h2>

                    <div className="space-y-6">
                      {/* Profile Visibility */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Profile Visibility
                        </label>
                        <select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-gray-50 border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="public">Public - Visible to everyone</option>
                          <option value="private">Private - Only you can see</option>
                          <option value="friends">Friends Only</option>
                        </select>
                      </div>

                      {/* Share Analytics */}
                      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Share Analytics Data
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Help us improve by sharing anonymous usage data
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPrivacy({ ...privacy, shareAnalytics: !privacy.shareAnalytics })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.shareAnalytics ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.shareAnalytics ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Data Retention */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Data Retention Period
                        </label>
                        <select
                          value={privacy.dataRetention}
                          onChange={(e) => setPrivacy({ ...privacy, dataRetention: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-gray-50 border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="30days">30 Days</option>
                          <option value="90days">90 Days (Recommended)</option>
                          <option value="1year">1 Year</option>
                          <option value="forever">Forever</option>
                        </select>
                        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          How long to keep your analysis history
                        </p>
                      </div>

                      {/* Data Export */}
                      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                              Export Your Data
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Download all your personal data and analysis history
                            </p>
                          </div>
                          <button
                            onClick={handleExportData}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ml-4"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                        </div>
                      </div>

                      {/* Delete Account */}
                      <div className={`p-4 rounded-lg border border-red-300 dark:border-red-800 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">
                              Delete Account
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Permanently delete your account and all associated data
                            </p>
                          </div>
                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePrivacyUpdate}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
