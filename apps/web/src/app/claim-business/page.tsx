'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShieldCheck, CheckCircle, AlertCircle, Building2, Phone, Mail, FileText } from 'lucide-react';
import { IBusiness } from '@bizpockethub/shared';

function ClaimBusinessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const businessIdParam = searchParams.get('businessId') || '';
  const [businessId, setBusinessId] = useState(businessIdParam);
  const [business, setBusiness] = useState<IBusiness | null>(null);

  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch business details if businessId is supplied
  useEffect(() => {
    if (businessId) {
      fetchApi<IBusiness>(`/businesses/${businessId}`).then((res) => {
        if (res.success && res.data) {
          setBusiness(res.data);
          if (res.data.contactEmail) setBusinessEmail(res.data.contactEmail);
        }
      });
    }
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to submit a listing ownership claim.');
      return;
    }

    if (!businessId) {
      setErrorMsg('Please specify the business you are claiming.');
      return;
    }

    if (notes.trim().length < 10) {
      setErrorMsg('Please describe your role and ownership relationship to the business.');
      return;
    }

    setLoading(true);
    const res = await fetchApi(`/businesses/${businessId}/claim`, {
      method: 'POST',
      body: JSON.stringify({
        businessEmail,
        phone,
        notes,
      }),
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.message || 'Unable to submit claim request.');
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Claim Request Submitted!
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
          Our directory compliance and verification team will review your claim credentials. You
          will receive an update at <strong>{businessEmail}</strong> within 1-2 business days.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Claim Business' }]} />

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Ownership Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Claim Your Business Listing
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Verify your ownership of an existing Biz List Place profile to manage contact details,
          update branch addresses, upload logos, and respond to customer reviews.
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-4">
          <span>You must be signed in with an active account to submit a claim.</span>
          <Link href="/login" className="font-bold underline">
            Log In
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {business && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="text-slate-500 block">Claiming Listing:</span>
            <strong className="text-sm font-bold text-slate-900">{business.name}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {!business && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business ID or Slug *
            </label>
            <input
              type="text"
              required
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. apex-cloud-solutions or business ID"
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Corporate Email Address *
          </label>
          <input
            type="email"
            required
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="e.g. director@yourcompany.com"
            className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Using your company domain email ensures significantly faster claim approval.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Business Contact Phone *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 019-2831"
            className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Proof of Ownership & Role Statement *
          </label>
          <textarea
            required
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain your executive role (e.g. Managing Partner, Founder, Marketing Director), official registration number, or verification evidence..."
            className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Link href="/">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!user}>
            Submit Claim Verification
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ClaimBusinessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading claim interface...</div>}>
      <ClaimBusinessContent />
    </Suspense>
  );
}
