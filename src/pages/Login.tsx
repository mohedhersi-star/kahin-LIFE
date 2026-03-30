import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/';
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kahin Life Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your password to access your dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-yellow-400 outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
