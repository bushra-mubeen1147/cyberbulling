import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Code,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { apiKeysAPI } from '../api/api.js';

export default function APIManagement({ darkMode }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [visibleKey, setVisibleKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('development');
  const [copiedKey, setCopiedKey] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const masked = (val) => {
    if (!val) return '••••••••••••••••';
    return val.slice(0, 8) + '••••••••••••••••';
  };

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await apiKeysAPI.getAll();
      setApiKeys(res.data?.data || []);
    } catch (err) {
      setError('Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await apiKeysAPI.create({ name: newKeyName.trim(), environment: newKeyEnv });
      const newKey = res.data?.data;
      if (newKey) setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName('');
      setShowNewKeyModal(false);
    } catch {
      setError('Failed to create API key.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = (keyVal, id) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = async (id) => {
    try {
      await apiKeysAPI.delete(id);
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch {
      setError('Failed to delete API key.');
    }
  };

  const handleRegenerateKey = async (id) => {
    try {
      const res = await apiKeysAPI.regenerate(id);
      const updated = res.data?.data;
      if (updated) setApiKeys(prev => prev.map(k => k.id === id ? updated : k));
    } catch {
      setError('Failed to regenerate key.');
    }
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

      {error && (
        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Keys</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {apiKeys.filter(k => k.status === 'active').length}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total API Calls</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {apiKeys.reduce((s, k) => s + (k.calls_count || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rate Limit</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,000/mo</p>
        </div>
      </div>

      {/* Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-300 bg-gray-50'}`}>
          <Key className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No API keys yet</p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Create your first key to start integrating</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all group`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${apiKey.environment === 'production' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'}`}>
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{apiKey.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        apiKey.environment === 'production'
                          ? darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                          : darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>{apiKey.environment}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        {apiKey.status}
                      </span>
                    </div>

                    {/* Key Display */}
                    <div className={`p-3 rounded-lg border mb-3 flex items-center justify-between gap-2 ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                      <code className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {visibleKey === apiKey.id ? apiKey.key_value : masked(apiKey.key_value)}
                      </code>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setVisibleKey(visibleKey === apiKey.id ? null : apiKey.id)}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                          {visibleKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleCopyKey(apiKey.key_value, apiKey.id)}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                          {copiedKey === apiKey.id
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Created</p>
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {apiKey.created_at ? new Date(apiKey.created_at).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Last Used</p>
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>API Calls</p>
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {(apiKey.calls_count || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleRegenerateKey(apiKey.id)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                    title="Regenerate"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Docs card */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
        <div className="flex items-start gap-4">
          <Code className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0 mt-1`} />
          <div>
            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
              API Integration
            </h3>
            <p className={`text-sm ${darkMode ? 'text-purple-200/70' : 'text-purple-700/70'}`}>
              Use your API key with{' '}
              <code className="font-mono bg-purple-100 dark:bg-purple-900/40 px-1 rounded">
                Authorization: Bearer YOUR_KEY
              </code>{' '}
              header to call <code className="font-mono bg-purple-100 dark:bg-purple-900/40 px-1 rounded">POST /analyze</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New API Key</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Mobile App"
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Environment</label>
                <select
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="development">Development</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={creating || !newKeyName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
