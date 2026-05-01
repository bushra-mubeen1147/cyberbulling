import { useState } from 'react';
import { 
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Calendar,
  ActivitySquare,
  Code,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function APIManagement({ darkMode }) {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      masked: 'sk_live_••••••••••••••••',
      created: '2024-01-15',
      lastUsed: '5 mins ago',
      calls: 15234,
      status: 'active',
      environment: 'production'
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_test_9876543210fedcba',
      masked: 'sk_test_••••••••••••••••',
      created: '2024-02-20',
      lastUsed: '2 days ago',
      calls: 3421,
      status: 'active',
      environment: 'development'
    }
  ]);

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [visibleKey, setVisibleKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('development');
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCreateKey = () => {
    if (newKeyName.trim()) {
      const newKey = {
        id: apiKeys.length + 1,
        name: newKeyName,
        key: `sk_${newKeyEnv === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 16)}`,
        masked: `sk_${newKeyEnv === 'production' ? 'live' : 'test'}_••••••••••••••••`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        calls: 0,
        status: 'active',
        environment: newKeyEnv
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setShowNewKeyModal(false);
    }
  };

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleRegenerateKey = (id) => {
    setApiKeys(apiKeys.map(k => {
      if (k.id === id) {
        const newKey = `sk_${k.environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 16)}`;
        return {
          ...k,
          key: newKey,
          masked: `sk_${k.environment === 'production' ? 'live' : 'test'}_••••••••••••••••`,
          created: new Date().toISOString().split('T')[0]
        };
      }
      return k;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            API Management
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage your API keys for integrations
          </p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Keys</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {apiKeys.filter(k => k.status === 'active').length}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total API Calls</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {apiKeys.reduce((sum, k) => sum + k.calls, 0).toLocaleString()}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rate Limit</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            1,000/mo
          </p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={`p-6 rounded-xl border ${
              darkMode
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all group`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${
                  apiKey.environment === 'production'
                    ? 'from-red-500 to-red-600'
                    : 'from-blue-500 to-blue-600'
                }`}>
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {apiKey.name}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      apiKey.environment === 'production'
                        ? darkMode
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-red-100 text-red-700'
                        : darkMode
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {apiKey.environment}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      darkMode
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>

                  {/* Key Display */}
                  <div className={`p-3 rounded-lg border mb-3 flex items-center justify-between gap-2 ${
                    darkMode
                      ? 'bg-gray-900 border-gray-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <code className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {visibleKey === apiKey.id ? apiKey.key : apiKey.masked}
                    </code>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setVisibleKey(visibleKey === apiKey.id ? null : apiKey.id)}
                        className={`p-1.5 rounded ${
                          darkMode
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                        } transition-colors`}
                      >
                        {visibleKey === apiKey.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                        className={`p-1.5 rounded ${
                          darkMode
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                        } transition-colors`}
                      >
                        <Copy className={`w-4 h-4 ${copiedKey === apiKey.id ? 'text-green-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Created</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {apiKey.created}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Last Used</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {apiKey.lastUsed}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>API Calls</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {apiKey.calls.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleRegenerateKey(apiKey.id)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  } transition-colors`}
                  title="Regenerate Key"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? 'hover:bg-red-900/20 text-red-400'
                      : 'hover:bg-red-50 text-red-600'
                  } transition-colors`}
                  title="Delete Key"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documentation Card */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-purple-900/20 border-purple-800'
          : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-start gap-4">
          <Code className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
              Need help integrating our API?
            </h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-purple-200/70' : 'text-purple-700/70'}`}>
              Check out our comprehensive API documentation with code examples and integration guides.
            </p>
            <a href="#" className={`inline-flex items-center gap-2 text-sm font-semibold ${
              darkMode
                ? 'text-purple-300 hover:text-purple-200'
                : 'text-purple-700 hover:text-purple-800'
            } transition-colors`}>
              View Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New API Key
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Mobile App"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Environment
                </label>
                <select
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="development">Development</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
