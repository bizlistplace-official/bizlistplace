'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps:
  // 1: Enter email -> Request 6-digit OTP
  // 2: Enter & verify 6-digit OTP code (5-min expiration, max 5 attempts, 60s cooldown)
  // 3: Enter New Password & Confirm Password
  // 4: Success confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 60-second cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // STEP 1: Request 6-Digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await fetchApi<{ message?: string; cooldown?: number }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setLoading(false);

    if (res.success) {
      setStep(2);
      setCooldown(res.data?.cooldown || 60);
      setInfoMsg('A 6-digit verification code has been dispatched to your email address.');
    } else {
      setErrorMsg(res.message || 'Unable to process your request at this time. Please try again.');
      if (res.status === 429 && (res as any).cooldownRemaining) {
        setCooldown((res as any).cooldownRemaining);
      }
    }
  };

  // STEP 2: Verify 6-Digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await fetchApi<{ resetSessionToken?: string; message?: string }>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      }),
    });
    setLoading(false);

    if (res.success && res.data?.resetSessionToken) {
      setResetSessionToken(res.data.resetSessionToken);
      setStep(3);
      setErrorMsg('');
    } else {
      setErrorMsg(res.message || 'Invalid or expired 6-digit code. Please check your inbox.');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const res = await fetchApi<{ message?: string; cooldown?: number }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setLoading(false);

    if (res.success) {
      setCooldown(60);
      setOtp('');
      setInfoMsg('A fresh 6-digit code has been dispatched to your email.');
    } else {
      setErrorMsg(res.message || 'Failed to resend code. Please wait a moment.');
    }
  };

  // STEP 3: Submit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!/[0-9]/.test(password)) {
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
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        resetSessionToken,
        password,
      }),
    });
    setLoading(false);

    if (res.success) {
      setStep(4);
    } else {
      setErrorMsg(res.message || 'Unable to update password. Your reset session may have expired.');
    }
  };

  // Password requirements validation helper
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#1D68F2] text-white flex items-center justify-center mx-auto shadow-sm">
            {step === 3 ? (
              <KeyRound className="w-7 h-7 stroke-[2.2]" />
            ) : step === 4 ? (
              <CheckCircle className="w-8 h-8 stroke-[2.2]" />
            ) : (
              <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Updated!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            {step === 1 && 'Enter your registered account email and we will dispatch a 6-digit OTP.'}
            {step === 2 && (
              <>
                Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong>.
              </>
            )}
            {step === 3 && 'Choose a strong new password with at least 8 characters, an uppercase letter and a number.'}
            {step === 4 && 'Your account credentials have been successfully updated.'}
          </p>
        </div>

        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 1 ? 'w-8 bg-[#1D68F2]' : 'w-2 bg-blue-200'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 2 ? 'w-8 bg-[#1D68F2]' : 'w-2 bg-blue-200'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 3 ? 'w-8 bg-[#1D68F2]' : 'w-2 bg-blue-200'
              }`}
            />
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs flex items-center gap-2.5 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-[#1D68F2] flex-shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Account Email Address</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send 6-Digit Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
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
          )}

          {/* STEP 2: Verify 6-Digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
                <span className="truncate max-w-[220px]">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="text-[#1D68F2] font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="otp-input"
                  className="block text-center text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider"
                >
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center">
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="••••••"
                    className="w-56 text-center text-2xl sm:text-3xl font-extrabold tracking-[10px] py-3 px-4 bg-slate-50/80 border-2 border-[#1D68F2]/30 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#1D68F2] focus:ring-4 focus:ring-[#1D68F2]/10 transition-all font-mono"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block text-center mt-2">
                  Code expires in 5 minutes &bull; Max 5 attempts
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 px-4 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Cooldown & Resend Button */}
              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-400">
                    Resend code available in{' '}
                    <strong className="text-slate-700 font-mono font-bold">{cooldown}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D68F2] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend 6-Digit Code</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100 text-xs">
                <div
                  className={`flex items-center gap-2 ${
                    hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    hasUppercase ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least one number (0-9)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Set New Password</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success Message */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Password Reset Complete</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your password has been securely updated. You can now log in to your Biz List Place account with your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm shadow-md transition-all"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
