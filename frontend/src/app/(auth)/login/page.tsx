'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectTo);
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Top Header Section */}
      <div className="text-center space-y-2.5">
        <div className="w-14 h-14 rounded-2xl bg-[#1D68F2] text-white flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Log in to manage your business listings
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="w-full p-1 bg-slate-100 rounded-2xl flex items-center">
        <div className="flex-1 py-2 text-center text-xs sm:text-sm font-bold bg-white text-slate-900 rounded-xl shadow-xs transition-all select-none">
          Login
        </div>
        <Link
          href={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="flex-1 py-2 text-center text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl transition-all select-none"
        >
          Sign Up
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="login-email"
              className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="flex items-center gap-2 text-xs font-bold text-slate-700"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Password</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#1D68F2] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-sm pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="pt-2 text-center text-xs sm:text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-bold text-[#1D68F2] hover:underline"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1D68F2] mx-auto" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
