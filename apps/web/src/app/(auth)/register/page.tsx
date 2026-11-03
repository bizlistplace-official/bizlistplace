'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+92');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessName.trim() || businessName.trim().length < 2) {
      setErrorMsg('Business name must be at least 2 characters long.');
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

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
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    // Submit registration with 'business_owner' role
    const res = await register(
      businessName.trim(),
      email.trim().toLowerCase(),
      password,
      'business_owner'
    );
    setLoading(false);

    if (res.success) {
      router.push(redirectTo);
    } else {
      setErrorMsg(res.message || 'Registration failed. Please check your details.');
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
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Sign up to list your business on Biz List Place
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="w-full p-1 bg-slate-100 rounded-2xl flex items-center">
        <Link
          href={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="flex-1 py-2 text-center text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl transition-all select-none"
        >
          Login
        </Link>
        <div className="flex-1 py-2 text-center text-xs sm:text-sm font-bold bg-white text-slate-900 rounded-xl shadow-xs transition-all select-none">
          Sign Up
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* 1. Business Name */}
          <div>
            <label
              htmlFor="register-business-name"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Business Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-business-name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
            />
          </div>

          {/* 2. Email Address */}
          <div>
            <label
              htmlFor="register-email"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email Address</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
            />
          </div>

          {/* 3. Phone Number */}
          <div>
            <label
              htmlFor="register-phone"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Phone Number</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 transition-all">
              <input
                type="text"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                aria-label="Dialing code"
                className="w-16 text-center py-3 px-1.5 bg-slate-50 border-r border-slate-200 text-slate-700 text-sm font-semibold focus:outline-none select-none"
              />
              <input
                id="register-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="300 1234567"
                className="w-full text-sm px-3.5 py-3 text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Password */}
          <div>
            <label
              htmlFor="register-password"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Password</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters (1 uppercase, 1 number)"
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

          {/* 5. Confirm Password */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Confirm Password</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full text-sm pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
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
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="pt-2 text-center text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-bold text-[#1D68F2] hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Terms & Privacy footer notice */}
      <p className="text-center text-xs text-slate-400">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-slate-600 transition-colors">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1D68F2] mx-auto" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
