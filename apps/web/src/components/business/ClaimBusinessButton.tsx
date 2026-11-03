'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IBusiness } from '@bizpockethub/shared';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { ClaimBusinessModal } from './ClaimBusinessModal';

interface ClaimBusinessButtonProps {
  business: IBusiness;
  variant?: 'primary' | 'badge' | 'sidebar';
  className?: string;
}

export function ClaimBusinessButton({
  business,
  variant = 'primary',
  className = '',
}: ClaimBusinessButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // If URL has ?claim=true, automatically open the claim modal
  useEffect(() => {
    if (searchParams.get('claim') === 'true') {
      setIsOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      {variant === 'primary' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Claim This Business</span>
        </button>
      )}

      {variant === 'badge' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Unclaimed Listing — Are you the owner? Claim it now</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full py-2.5 bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-[#1D68F2] font-semibold text-xs rounded-xl border border-slate-200 hover:border-blue-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Claim or Verify This Profile</span>
        </button>
      )}

      <ClaimBusinessModal
        business={business}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

