import { useAuth } from '../context/AuthProvider.jsx';

export default function Profile({ darkMode }) {
  const { user } = useAuth();
  return (
    <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}> 
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        {user ? (
          <div className={`p-6 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
            <p className="mb-2"><span className="font-semibold">User ID:</span> {user.id}</p>
          </div>
        ) : (
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Not signed in.</p>
        )}
      </div>
    </div>
  );
}
