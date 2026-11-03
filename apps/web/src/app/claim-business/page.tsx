'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClaimBusinessModal } from '@/components/business/ClaimBusinessModal';
import { ShieldCheck, Building2, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { IBusiness } from '@bizpockethub/shared';

function ClaimBusinessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const businessIdParam = searchParams.get('businessId') || searchParams.get('slug') || '';
  const [queryInput, setQueryInput] = useState(businessIdParam);
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch business details if businessIdParam is supplied
  useEffect(() => {
    if (businessIdParam) {
      setLoading(true);
      fetchApi<IBusiness>(`/businesses/${businessIdParam}`)
        .then((res) => {
          if (res.success && res.data) {
            setBusiness(res.data);
            setModalOpen(true);
          } else {
            setErrorMsg('Could not find the requested business listing. Please check the ID or slug.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [businessIdParam]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setErrorMsg('');
    setLoading(true);

    const res = await fetchApi<IBusiness>(`/businesses/${encodeURIComponent(queryInput.trim())}`);
    setLoading(false);

    if (res.success && res.data) {
      setBusiness(res.data);
      setModalOpen(true);
    } else {
      setErrorMsg('No business listing found with that ID or slug. Please verify the URL or slug.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Breadcrumbs items={[{ label: 'Claim Business' }]} />

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D68F2] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#1D68F2]" />
          Ownership Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Claim Your Business Listing
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
          Take full control of your business profile on Biz List Place. Manage contact details, update branch locations, upload your official logo, and respond directly to customer reviews.
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-4">
          <span>You must be signed in with an active account to submit a claim.</span>
          <Link href="/login" className="font-bold underline text-[#1D68F2]">
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

      {/* Lookup Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          Search for the Listing You Wish to Claim
        </h2>
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Business ID or Slug
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g. apex-cloud-solutions or business identifier"
                className="w-full text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2] focus:border-[#1D68F2]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              You can also click &quot;Claim This Business&quot; directly on any business detail page.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="bg-[#1D68F2] hover:bg-[#1756cb] text-white"
            >
              Find Listing
            </Button>
          </div>
        </form>

        {business && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1D68F2] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{business.name}</h3>
                <p className="text-xs text-slate-500">
                  {business.countryCode || business.primaryLocation?.countryName || 'Listing'} • {business.primaryCategory?.name || 'Business'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D68F2] hover:bg-[#1756cb] text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Open Claim Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {business && (
        <ClaimBusinessModal
          business={business}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
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
