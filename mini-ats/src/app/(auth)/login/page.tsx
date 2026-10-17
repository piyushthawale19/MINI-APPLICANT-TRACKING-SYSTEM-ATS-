'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-blue-600 flex-col justify-between p-10 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-none">EarlyJobs</span>
              <span className="text-xs font-medium text-blue-200 tracking-widest uppercase">ATS Platform</span>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Streamline your<br />hiring process
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Manage candidates, track hiring stages, and make data-driven recruitment decisions — all in one place.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A', 'B', 'C'].map((l, i) => (
              <div
                key={l}
                className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-600"
                style={{ background: ['#EFF6FF', '#DBEAFE', '#BFDBFE'][i] }}
              >
                {l}
              </div>
            ))}
          </div>
          <p className="text-blue-200 text-xs">Join recruiters managing 1,000+ candidates</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">EarlyJobs ATS</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-7">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo account helper */}
          <div className="mt-6 p-3.5 bg-blue-50/80 border border-blue-100 rounded-lg flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-blue-900 font-semibold">Demo Recruiter Account</p>
              <p className="text-xs text-blue-600 font-mono mt-0.5">demo@earljobs.ai • demo123456</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm({ email: 'demo@earljobs.ai', password: 'demo123456' });
                setError('');
              }}
              className="text-xs font-semibold px-2.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shadow-xs"
            >
              Fill Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
