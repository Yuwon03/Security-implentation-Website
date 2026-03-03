'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import crypto from 'crypto';
import { loadIdentity } from '@/lib/identity';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a Password')
      return;
    }

    const preHashPassword = crypto.createHash('sha256').update(password).digest('hex');

    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: preHashPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Username / Password is incorrect');
      }
      
      await loadIdentity(username);
      localStorage.setItem('username', username);
      router.push('/home');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md p-6 border border-gray-200">
        <div className="text-center">
          <h2 className="mb-6 text-xl font-medium text-gray-800">Enter Chat</h2>
        </div>
        
        {error && (
          <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border-l-2 border-red-500">
            {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm text-gray-600 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {loading ? 'Joining...' : 'Join Chat'}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:underline"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 