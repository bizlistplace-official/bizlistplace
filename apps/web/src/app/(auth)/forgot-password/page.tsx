'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { ShieldCheck, Mail, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.message || 'Unable to process password reset request.');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#1D68F2] text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Enter your registered email address and we will dispatch a reset link.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="w-12 h-12 text-[#1D68F2] mx-auto" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If an account is associated with <strong>{email}</strong>, a password reset link has
                been dispatched. Please check your inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-bold text-sm text-[#1D68F2] hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="forgot-email"
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Account Email</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
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
        </div>
      </div>
    </div>
  );
}
