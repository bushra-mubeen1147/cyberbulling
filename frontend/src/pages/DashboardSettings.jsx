import { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Moon,
  Zap,
  Lock,
  Bell as BellIcon,
  Sliders,
  Save,
  RotateCcw
} from 'lucide-react';

export default function DashboardSettings({ darkMode: initialDarkMode }) {
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    criticalAlerts: true,
    analysisAutoSave: true,
    privacyMode: false,
    dataCollection: true,
    apiRateLimit: 'standard',
    analysisThreshold: 'medium'
  });

  const [saveMessage, setSaveMessage] = useState('');

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: false,
      criticalAlerts: true,
      analysisAutoSave: true,
      privacyMode: false,
      dataCollection: true,
      apiRateLimit: 'standard',
      analysisThreshold: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Settings
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your experience and preferences
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className={`p-4 rounded-xl border ${
          darkMode
            ? 'bg-green-900/20 border-green-800 text-green-300'
            : 'bg-green-50 border-green-300 text-green-700'
        }`}>
          ✓ {saveMessage}
        </div>
      )}

      {/* Notification Settings */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <BellIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Email Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Receive analysis updates via email</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Push Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Get instant alerts on your device</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Weekly Reports</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Get weekly analysis summaries</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.weeklyReports}
              onChange={() => handleToggle('weeklyReports')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Critical Alerts Only</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Only notify for critical threats</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.criticalAlerts}
              onChange={() => handleToggle('criticalAlerts')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Analysis Settings */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analysis Settings
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Auto-Save Analysis</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Automatically save all analyses</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.analysisAutoSave}
              onChange={() => handleToggle('analysisAutoSave')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Sensitivity Threshold
            </label>
            <select 
              value={settings.analysisThreshold}
              onChange={(e) => handleSelect('analysisThreshold', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="low">Low (More sensitive)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Less sensitive)</option>
            </select>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Adjust how strict the toxicity detection should be
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              API Rate Limit
            </label>
            <select 
              value={settings.apiRateLimit}
              onChange={(e) => handleSelect('apiRateLimit', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="free">Free Tier (100/month)</option>
              <option value="standard">Standard (1000/month)</option>
              <option value="premium">Premium (Unlimited)</option>
            </select>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Control how many analyses you can run per month
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Privacy & Security
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Privacy Mode</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Hide sensitive content in UI</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.privacyMode}
              onChange={() => handleToggle('privacyMode')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Allow Data Collection</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Help improve our AI models</p>
            </span>
            <input 
              type="checkbox" 
              checked={settings.dataCollection}
              onChange={() => handleToggle('dataCollection')}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className={`mt-4 p-3 rounded-lg ${
          darkMode
            ? 'bg-yellow-900/20 border border-yellow-800/30'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
            🔒 Your data is encrypted end-to-end and never shared with third parties.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className={`flex items-center gap-2 flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset to Default
        </button>
      </div>
    </div>
  );
}
