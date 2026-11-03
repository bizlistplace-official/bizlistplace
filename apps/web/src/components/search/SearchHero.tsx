'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building, LayoutGrid } from 'lucide-react';
import { POPULAR_COUNTRIES, INITIAL_CATEGORIES } from '@bizpockethub/shared';
import { CountryConfig } from '@/lib/countryConfig';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CitySelect } from '@/components/ui/CitySelect';
import { CustomSelect } from '@/components/ui/CustomSelect';

const POPULAR_SEARCH_CHIPS = [
  { label: 'Restaurants', query: 'Restaurants' },
  { label: 'Hospitals', query: 'Hospitals' },
  { label: 'Hotels', query: 'Hotels' },
  { label: 'Retail Stores', query: 'Retail' },
  { label: 'IT Services', query: 'IT Services' },
  { label: 'Car Dealers', query: 'Automotive' },
];

interface SearchHeroProps {
  country?: CountryConfig;
}

export function SearchHero({ country }: SearchHeroProps = {}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(country?.code || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('');

  // Keep selectedCountry synchronized if country prop changes
  useEffect(() => {
    if (country?.code) {
      setSelectedCountry(country.code);
    }
  }, [country?.code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedCity) params.set('city', selectedCity);
    if (category.trim()) params.set('category', category.trim());
    router.push(`/search?${params.toString()}`);
  };

  const popularChips = country?.hero?.popularChips || POPULAR_SEARCH_CHIPS;

  const handleChipClick = (query: string) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (selectedCountry) {
      params.set('country', selectedCountry);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div
      className="relative overflow-visible bg-slate-900 min-h-[560px] sm:min-h-[580px] lg:h-[calc(100svh-72px)] lg:min-h-[calc(100svh-72px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-0"
    >
      {/* Background Hero Image with panoramic daytime city skyline matching screenshot */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/hero_city_day.jpg"
          alt="Worldwide business directory skyline"
          fill
          priority
          fetchPriority="high"
          quality={70}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1440px) 1440px, 100vw"
          className="object-cover object-[center_42%]"
        />
      </div>

      {/* Daylight / Atmospheric Overlay providing clean, crisp readability for text while preserving skyline */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/35 to-slate-900/35 pointer-events-none" />

      {/* Hero Content Container matching exact screenshot */}
      <div className="relative max-w-5xl mx-auto w-full z-30 text-center">
        {/* Eyebrow */}
        <div className="text-xs sm:text-[13px] font-bold text-slate-900 tracking-[0.14em] uppercase mb-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          {country?.hero?.eyebrow || 'GLOBAL BUSINESS DIRECTORY'}
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-950 tracking-tight leading-[1.18] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          {country?.hero ? (
            <>
              {country.hero.headingPrefix} <br className="hidden sm:inline" />
              <span className="text-[#1D68F2]">
                {country.hero.headingHighlight}
              </span>
            </>
          ) : (
            <>
              Find the Right Business <br className="hidden sm:inline" />
              Near You or <span className="text-[#1D68F2]">Worldwide</span>
            </>
          )}
        </h1>

        {/* Subtitle - Crisp, bold, high-contrast readable */}
        <p className="mt-3 text-sm sm:text-base text-slate-800 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
          {country?.hero?.subtitle ? (
            country.hero.subtitle
          ) : (
            <>
              Discover trusted businesses, shops, services and branches <br className="hidden sm:inline" />
              across the world — all in one place.
            </>
          )}
        </p>

        {/* Hero CTA Button: Add Business Free */}
        <div className="mt-4 sm:mt-5 flex items-center justify-center">
          <Link
            href="/add-business"
            className="group inline-flex items-center justify-center px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D68F2] hover:bg-[#1557D0] shadow-md shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-blue-400/30"
          >
            <span>Add Your Business Free</span>
          </Link>
        </div>

        {/* Search Bar Form: Mobile (stack) -> Tablet (2x2 grid) -> Desktop (single row) */}
        <form
          onSubmit={handleSearch}
          className="relative z-20 mt-6 sm:mt-7 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] w-full max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-2 text-slate-900"
        >
          {/* 1. Keyword Input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl min-w-0 lg:min-w-[180px] focus-within:border-[#1D68F2] focus-within:ring-1 focus-within:ring-[#1D68F2] transition-colors">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <label htmlFor="hero-keyword-input" className="sr-only">
              Search for business, service or company
            </label>
            <input
              id="hero-keyword-input"
              aria-label="Search for business, service or company"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for business, service or company..."
              className="w-full text-xs sm:text-sm font-normal text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* 2. Global Country Selector */}
          <div className="w-full lg:w-44 xl:w-52">
            <CountrySelect
              id="hero-location-select"
              aria-label="Location Country"
              value={selectedCountry}
              onChange={(c) => {
                setSelectedCountry(c);
                setSelectedCity('');
              }}
              includeAllOption
              allOptionLabel="All Countries"
              placeholder="All Countries"
              variant="hero"
            />
          </div>

          {/* 3. Global City / Locality Selector */}
          <div className="w-full lg:w-44 xl:w-52">
            <CitySelect
              id="hero-city-select"
              aria-label="City or Locality"
              value={selectedCity}
              onChange={setSelectedCity}
              countryCode={selectedCountry}
              includeAllOption
              allOptionLabel="All Cities"
              placeholder="All Cities"
              variant="hero"
            />
          </div>

          {/* 4. Category Selector */}
          <div className="w-full lg:w-44 xl:w-52">
            <CustomSelect
              id="hero-category-select"
              aria-label="Business Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: '', label: 'All Categories' },
                ...INITIAL_CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
              ]}
              placeholder="All Categories"
              icon={<LayoutGrid className="w-4 h-4 text-slate-400" />}
              variant="hero"
              searchable
              searchPlaceholder="Search categories..."
            />
          </div>

          {/* 5. Search Button */}
          <button
            type="submit"
            className="md:col-span-2 lg:col-span-1 bg-[#1D68F2] hover:bg-[#1557D0] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm flex-shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </form>

        {/* Popular Searches: translucent dark pill chips over bottom skyline/park */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          {/* <span className="font-semibold text-white drop-shadow-sm mr-1.5">Popular:</span> */}
          {popularChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip.query)}
              className="px-3.5 py-1 rounded-full text-xs font-normal text-white bg-slate-900/35 hover:bg-slate-900/55 border border-white/25 hover:border-white/40 backdrop-blur-[2px] transition-all duration-200 cursor-pointer drop-shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
