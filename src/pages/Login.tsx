import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });
      
      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        // Use React Router navigation instead of hard reload for better mobile support
        navigate('/', { replace: true });
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-end sm:justify-center bg-gray-50 dark:bg-black">
      <div className="w-full p-8 bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.05)] sm:shadow-xl border-t sm:border border-gray-100 dark:border-zinc-800 sm:max-w-md sm:mx-auto">
        <div className="flex flex-col items-center mb-8 pt-2">
          <div className="w-12 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mb-8 sm:hidden"></div>
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kahin Life Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">Enter your password to unlock your dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 pr-12 border border-gray-300 dark:border-zinc-700 rounded-xl dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-yellow-400 outline-none text-lg transition-all"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-lg shadow-sm flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Unlock'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
          <a 
            href="mailto:mohedhersi@gmail.com?subject=Password%20Recovery%20-%20Kahin%20Life"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            Forgot password? Connect via Gmail
          </a>
        </div>
      </div>
    </div>
  );
}
