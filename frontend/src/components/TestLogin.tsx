import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const TestLogin: React.FC = () => {
  const [username, setUsername] = useState('testuser123');
  const [password, setPassword] = useState('testpass123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, user, isAuthenticated, tokens } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await login(username, password);
      setMessage('Login successful!');
    } catch (error) {
      setMessage(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiCall = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/events/', {
        headers: {
          'Authorization': `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`API call successful! Retrieved ${Array.isArray(data) ? data.length : 'unknown'} events`);
      } else {
        setMessage(`API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setMessage(`API call error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test Login</h2>
      
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded-md">
            <h3 className="font-medium text-green-800">Logged in as:</h3>
            <p className="text-green-700">{user?.username} ({user?.email})</p>
            <p className="text-sm text-green-600">User Type: {user?.user_type}</p>
          </div>
          
          <button
            onClick={testApiCall}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Test API Call
          </button>
          
          <div className="text-xs text-gray-500">
            <p>Access Token: {tokens?.access ? `${tokens.access.substring(0, 20)}...` : 'None'}</p>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestLogin;