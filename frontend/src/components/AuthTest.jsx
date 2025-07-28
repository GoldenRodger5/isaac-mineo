import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, login, register, logout, rateLimits } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = isRegistering 
        ? await register(username, email, password)
        : await login(username, password);

      if (result.success) {
        setMessage(`${isRegistering ? 'Registration' : 'Login'} successful!`);
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        setMessage(result.error || 'Authentication failed');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    }

    setLoading(false);
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Welcome!</h2>
        <div className="space-y-2 text-sm">
          <p><strong>User ID:</strong> {user?.user_id}</p>
          <p><strong>Username:</strong> {user?.username}</p>
          {user?.email && <p><strong>Email:</strong> {user.email}</p>}
        </div>
        
        {rateLimits.explanation_requests && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800">Rate Limits</h3>
            <p className="text-sm text-blue-600">
              Explanations: {rateLimits.explanation_requests.remaining}/{rateLimits.explanation_requests.limit} remaining
            </p>
          </div>
        )}
        
        <button
          onClick={logout}
          className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isRegistering ? 'Register' : 'Login'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
        </button>
      </form>
      
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="w-full mt-2 text-blue-500 hover:text-blue-700 text-sm"
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AuthTest;
