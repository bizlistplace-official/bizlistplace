'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Building2, ArrowUpDown, ShieldCheck, RotateCcw } from 'lucide-react';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CitySelect } from '@/components/ui/CitySelect';
import { CustomSelect } from '@/components/ui/CustomSelect';

const BUSINESS_TYPE_OPTIONS = [
  { value: '', label: 'Any Type' },
  { value: 'physical', label: 'Physical Premises / Offices' },
  { value: 'service_area', label: 'Service Area Provider' },
  { value: 'online_only', label: 'Digital & E-Commerce Only' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance & Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name_asc', label: 'Company Name (A–Z)' },
];

interface SearchFilterPanelProps {
  initialValues: {
    q?: string;
    category?: string;
    country?: string;
    city?: string;
    businessType?: string;
    verifiedOnly?: boolean;
    sort?: string;
  };
  onApply?: () => void;
  className?: string;
}

export function SearchFilterPanel({
  initialValues,
  onApply,
  className = '',
}: SearchFilterPanelProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialValues.q || '');
  const [country, setCountry] = useState(initialValues.country || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [businessType, setBusinessType] = useState(initialValues.businessType || '');
  const [verifiedOnly, setVerifiedOnly] = useState(initialValues.verifiedOnly || false);
  const [sort, setSort] = useState(initialValues.sort || 'relevance');

  const hasActiveFilters = Boolean(
    q || country || city || businessType || verifiedOnly || (sort && sort !== 'relevance')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (initialValues.category) params.set('category', initialValues.category);
    if (q.trim()) params.set('q', q.trim());
    if (country.trim()) params.set('country', country.trim());
    if (city.trim()) params.set('city', city.trim());
    if (businessType.trim()) params.set('businessType', businessType.trim());
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (sort && sort !== 'relevance') params.set('sort', sort);

    const query = params.toString();
    router.push(query ? `/search?${query}` : '/search');
    if (onApply) onApply();
  };

  const handleReset = () => {
    setQ('');
    setCountry('');
    setCity('');
    setBusinessType('');
    setVerifiedOnly(false);
    setSort('relevance');

    const params = new URLSearchParams();
    if (initialValues.category) params.set('category', initialValues.category);
    const query = params.toString();
    router.push(query ? `/search?${query}` : '/search');
    if (onApply) onApply();
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* 1. Keyword Input */}
      <div>
        <label htmlFor="search-keyword-filter" className="block text-xs font-bold text-slate-700 mb-1.5">
          Keyword or Company
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            id="search-keyword-filter"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Apex, Tech, Cafe..."
            className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* 2. Global Country Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Country (195+ Global)
        </label>
        <CountrySelect
          value={country}
          onChange={(newCountry) => {
            setCountry(newCountry);
            // Reset city if country changed
            if (newCountry !== country) {
              setCity('');
            }
          }}
          includeAllOption
          allOptionLabel="All Countries"
          placeholder="All Countries"
          variant="default"
          size="md"
        />
      </div>

      {/* 3. Global City Dropdown with Dynamic Loading */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          City or Locality
        </label>
        <CitySelect
          value={city}
          onChange={setCity}
          countryCode={country}
          includeAllOption
          allOptionLabel="All Cities"
          placeholder={country ? 'Select city/town...' : 'All Cities'}
          variant="default"
          size="md"
        />
      </div>

      {/* 4. Business Type Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Operating Model
        </label>
        <CustomSelect
          value={businessType}
          onChange={setBusinessType}
          options={BUSINESS_TYPE_OPTIONS}
          placeholder="Any Type"
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
          variant="default"
          size="md"
        />
      </div>

      {/* 5. Verified Listings Only Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#1D68F2] border-slate-300 focus:ring-[#1D68F2] cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Listings Only
          </span>
        </label>
      </div>

      {/* 6. Sort By Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Sort Results By
        </label>
        <CustomSelect
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
          placeholder="Relevance & Featured"
          icon={<ArrowUpDown className="w-4 h-4 text-slate-400" />}
          variant="default"
          size="md"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Apply Filters</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </form>
  );
}
