'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { IBusiness } from '@bizpockethub/shared';
import {
  ShieldCheck,
  X,
  Info,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ClaimBusinessModalProps {
  business: IBusiness;
  isOpen: boolean;
  onClose: () => void;
}

// Utility to mask email e.g. "he*****a@gmail.com"
function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'Not on file';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  const maskedLocal = `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 3, 3))}${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export function ClaimBusinessModal({ business, isOpen, onClose }: ClaimBusinessModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Step 1: Form, Step 2: OTP Verification, Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields (matching reference screenshot)
  const [fullName, setFullName] = useState(user?.name ? `${user.name} (Owner)` : '');
  const [emailOption, setEmailOption] = useState<'registered_email' | 'corporate_email'>('corporate_email');
  const [receiveEmail, setReceiveEmail] = useState('');
  const [phone, setPhone] = useState(business.phone || '');
  const [notes, setNotes] = useState('');

  // Claim tracking state
  const [claimId, setClaimId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  // Registered business email
  const regEmail = business.contactEmail || '';
  const maskedRegEmail = maskEmail(regEmail);

  // Pre-fill email based on option
  useEffect(() => {
    if (emailOption === 'registered_email' && regEmail) {
      setReceiveEmail(regEmail);
    } else if (emailOption === 'corporate_email') {
      if (!receiveEmail || receiveEmail === regEmail) {
        setReceiveEmail(user?.email || '');
      }
    }
  }, [emailOption, regEmail, user]);

  // Handle countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  // STEP 1: Submit Claim Form
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in to your account first so we can link your business claim.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name and designation.');
      return;
    }

    if (!receiveEmail.trim() || !receiveEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your verification code.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Please enter your contact phone or WhatsApp number.');
      return;
    }

    setLoading(true);

    const res = await fetchApi<any>(`/businesses/${business._id}/claim`, {
      method: 'POST',
      body: JSON.stringify({
        fullName: fullName.trim(),
        verificationOption: emailOption,
        businessEmail: receiveEmail.trim().toLowerCase(),
        phone: phone.trim(),
        notes: notes.trim(),
      }),
    });

    setLoading(false);

    if (res.success && res.data?.claimId) {
      setClaimId(res.data.claimId);
      setStep(2);
      setCooldown(60);
      setSuccessMsg('Verification code and 1-click link sent to your email.');
    } else {
      setErrorMsg(res.message || 'Unable to submit claim. Please check details.');
    }
  };

  // STEP 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await fetchApi<any>(`/claims/${claimId}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp: otpCode.trim() }),
    });

    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMsg(res.message || 'Incorrect verification code. Please try again.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg('');

    const res = await fetchApi<any>(`/claims/${claimId}/resend-otp`, {
      method: 'POST',
    });

    setLoading(false);

    if (res.success) {
      setCooldown(60);
      setSuccessMsg('A new 6-digit verification code has been dispatched.');
    } else {
      setErrorMsg(res.message || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors absolute top-6 right-6 cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: Claim Information Form (Exact Screenshot Match) */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Claim This Business
                </h3>
                <p className="text-sm font-semibold text-slate-500 truncate max-w-xs">
                  {business.name}
                </p>
              </div>
            </div>

            {/* Notice Callout Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                We will identify your ownership via email and send you a{' '}
                <strong className="font-bold text-emerald-900">6-digit verification code</strong> and a{' '}
                <strong className="font-bold text-emerald-900">1-click verification link</strong> to claim this listing.
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!user && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-3">
                <span>Please sign in to link this business to your account.</span>
                <Link
                  href={`/login?redirect=/business/${business.slug}`}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0"
                >
                  Log In
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-5">
              {/* Field 1: Full Name / Designation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Your Full Name / Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Usman (Owner / Manager)"
                  className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Field 2: Verification Email Option */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Verification Email Option <span className="text-rose-500">*</span>
                </label>

                {/* Option A: Send to registered business email */}
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    emailOption === 'registered_email'
                      ? 'border-[#1D68F2] bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="emailOption"
                    value="registered_email"
                    checked={emailOption === 'registered_email'}
                    onChange={() => setEmailOption('registered_email')}
                    disabled={!regEmail}
                    className="w-4 h-4 text-[#1D68F2] focus:ring-[#1D68F2]"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    Send to registered business email{' '}
                    <span className="font-bold text-slate-900">
                      ({regEmail ? maskedRegEmail : 'Not on file'})
                    </span>
                  </span>
                </label>

                {/* Option B: Use my direct official / corporate email */}
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    emailOption === 'corporate_email'
                      ? 'border-[#1D68F2] bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="emailOption"
                    value="corporate_email"
                    checked={emailOption === 'corporate_email'}
                    onChange={() => setEmailOption('corporate_email')}
                    className="w-4 h-4 text-[#1D68F2] focus:ring-[#1D68F2]"
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    Use my direct official / corporate email
                  </span>
                </label>
              </div>

              {/* Field 3: Email Address to Receive Verification Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Email Address to Receive Verification Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={receiveEmail}
                  onChange={(e) => setReceiveEmail(e.target.value)}
                  placeholder="yourname@company.com"
                  readOnly={emailOption === 'registered_email' && Boolean(regEmail)}
                  className={`w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 transition-all text-sm font-medium outline-none text-slate-900 placeholder:text-slate-400 ${
                    emailOption === 'registered_email' && regEmail ? 'bg-slate-50 cursor-not-allowed text-slate-600' : 'bg-white'
                  }`}
                />
              </div>

              {/* Field 4: Phone / WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Phone / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Field 5: Optional Additional Ownership Evidence */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Ownership Evidence / Notes <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide utility bill details, registration number, or official role statement..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-xs font-medium outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !user}
                className="w-full min-h-[52px] py-3.5 px-6 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending code &amp; link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification Code &amp; Link</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Enter 6-digit Code & Link verification */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1D68F2] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Enter 6-Digit Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                We sent a 6-digit verification code and a one-click link to{' '}
                <strong className="text-slate-800">{receiveEmail}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && !errorMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-slate-700 block">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-48 h-14 mx-auto text-center tracking-[0.4em] font-mono text-2xl font-black border-2 border-slate-300 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500">
                💡 <strong>Tip:</strong> You can also just open your inbox and click the{' '}
                <span className="text-[#1D68F2] font-semibold">1-Click Verification Link</span> to verify instantly without entering code.
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full min-h-[50px] py-3 px-6 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Code &amp; Submit Claim</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Edit Information
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  className="font-bold text-[#1D68F2] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Email Ownership Verified!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your ownership claim request for <strong className="text-slate-900">{business.name}</strong> has been submitted.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Verified Email:</span>
                <span className="font-bold text-slate-900">{receiveEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Claimant:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pending Admin Approval
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Our compliance team will review your business credentials. Once approved, the business will be linked to your Owner Dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs shadow-sm transition-all"
              >
                Go to Owner Dashboard
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

