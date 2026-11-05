'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ClaimVerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg('No verification token provided in URL.');
      return;
    }

    fetchApi<any>(`/claims/verify-link?token=${encodeURIComponent(token)}`).then((res) => {
      setLoading(false);
      if (res.success) {
        setSuccess(true);
        if (res.data?.business?.name) {
          setBusinessName(res.data.business.name);
        }
      } else {
        setErrorMsg(res.message || 'Verification link is invalid or has expired.');
      }
    });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[#1D68F2] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">
          Verifying your business claim email link...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {success ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Email Ownership Verified!
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your claim request {businessName ? <>for <strong className="text-slate-900">{businessName}</strong></> : 'for the business'} has been authenticated.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 text-left space-y-1">
            <strong className="font-bold text-emerald-900 block text-sm">
              Status: Pending Administrator Approval
            </strong>
            <p className="leading-relaxed">
              Our directory administration will review the claim. Once approved, you will receive full owner access to manage the business in your Owner Dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs shadow-sm transition-all"
            >
              Go to Owner Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verification Failed
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {errorMsg}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-10 h-10 border-4 border-[#1D68F2] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Loading verification...</p>
        </div>
      }
    >
      <ClaimVerifyContent />
    </Suspense>
  );
}

