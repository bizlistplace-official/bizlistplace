'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  KeyRound,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
} from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  // If no token was provided in the URL
  if (!token) {
    return (
      <div className="text-center space-y-4 py-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Reset Token Missing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Password resets require a valid 1-click token or a 6-digit email verification code.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <span>Request Verification Code</span>
          </Link>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasMinLength) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUppercase) {
      setErrorMsg('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!hasNumber) {
      setErrorMsg('Password must contain at least one number (0-9).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entry.');
      return;
    }

    setLoading(true);
    const res = await fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.message || 'Password reset link is invalid or has expired.');
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">
            Password Successfully Updated
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Your credentials have been securely updated. You can now log in with your new password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1D68F2] hover:bg-[#1756cb] text-white text-sm font-bold shadow-sm transition-all"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="new-pwd"
          className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
        >
          <Lock className="w-4 h-4 text-slate-400" />
          <span>New Password</span>
        </label>
        <div className="relative">
          <input
            id="new-pwd"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-pwd"
          className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
        >
          <Lock className="w-4 h-4 text-slate-400" />
          <span>Confirm New Password</span>
        </label>
        <div className="relative">
          <input
            id="confirm-pwd"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all pr-11"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Strength indicator Checklist */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
        <p className="text-[11px] font-bold text-slate-600">Password requirements:</p>
        <div className="grid grid-cols-1 gap-1 text-[11px]">
          <div
            className={`flex items-center gap-1.5 ${
              hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Check
              className={`w-3.5 h-3.5 ${
                hasMinLength ? 'stroke-[2.8] text-emerald-600' : 'text-slate-300'
              }`}
            />
            <span>At least 8 characters long</span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              hasUppercase ? 'text-emerald-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Check
              className={`w-3.5 h-3.5 ${
                hasUppercase ? 'stroke-[2.8] text-emerald-600' : 'text-slate-300'
              }`}
            />
            <span>At least one uppercase letter (A-Z)</span>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Check
              className={`w-3.5 h-3.5 ${
                hasNumber ? 'stroke-[2.8] text-emerald-600' : 'text-slate-300'
              }`}
            />
            <span>At least one number (0-9)</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <span>Save New Password</span>
        )}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#1D68F2] text-white flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Choose a strong, secure password for your Biz List Place account.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-6">
          <Suspense
            fallback={
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1D68F2]" />
                <span>Loading form...</span>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
