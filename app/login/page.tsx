'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Cookies from 'js-cookie';

const demoAccounts = [
  { role: 'Admin', email: 'admin@hrms.com', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { role: 'Senior Manager', email: 'manager@hrms.com', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { role: 'HR Recruiter', email: 'hr@hrms.com', color: 'bg-green-100 text-green-700 border-green-200' },
  { role: 'Employee', email: 'john@hrms.com', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { role: 'Applicant', email: 'applicant@hrms.com', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === 'applicant' ? '/jobs' : '/dashboard');
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const userData = JSON.parse(Cookies.get('user') || '{}');
      router.push(userData.role === 'applicant' ? '/jobs' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-white">HRMS</h1>
          <p className="text-blue-300 mt-1">FWC IT Services · AI-Powered HR</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-3 text-center">Quick login — demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc.email)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium transition-opacity hover:opacity-80 ${acc.color}`}
                >
                  {acc.role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Click a role, then Sign In</p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              New applicant?{' '}
              <a href="/register" className="text-blue-600 hover:underline font-medium">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}