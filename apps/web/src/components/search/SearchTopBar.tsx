'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Layers, ChevronDown, Check, X } from 'lucide-react';
import { ICategory } from '@bizpockethub/shared';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CitySelect } from '@/components/ui/CitySelect';

interface SearchTopBarProps {
  initialQuery?: string;
  initialCategory?: string;
  initialCountry?: string;
  initialCity?: string;
  categories: ICategory[];
  preserveParams?: {
    businessType?: string;
    verifiedOnly?: string;
    sort?: string;
  };
}

export function SearchTopBar({
  initialQuery = '',
  initialCategory = '',
  initialCountry = '',
  initialCity = '',
  categories = [],
  preserveParams = {},
}: SearchTopBarProps) {
  const router = useRouter();

  const [keyword, setKeyword] = useState(initialQuery);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync state if props change (e.g. from URL navigation or back/forward)
  useEffect(() => {
    setKeyword(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCountry(initialCountry);
  }, [initialCountry]);

  useEffect(() => {
    setSelectedCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Dropdown open state for Category
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories.filter((cat) => cat.name.toLowerCase().includes(q) || cat.slug.includes(q));
  }, [categories, categorySearch]);

  // Find active category label
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      categories.find(
        (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c._id === selectedCategory
      ) || null
    );
  }, [categories, selectedCategory]);

  const categoryLabel = activeCategoryObj ? activeCategoryObj.name : 'All Categories';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);

    // Preserve existing secondary filters if present
    if (preserveParams.businessType) params.set('businessType', preserveParams.businessType);
    if (preserveParams.verifiedOnly === 'true') params.set('verifiedOnly', 'true');
    if (preserveParams.sort && preserveParams.sort !== 'relevance') {
      params.set('sort', preserveParams.sort);
    }

    const query = params.toString();
    router.push(query ? `/search?${query}` : '/search');
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-slate-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 text-slate-900"
      >
        {/* 1. Keyword Input */}
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] bg-white border border-slate-200 rounded-xl focus-within:border-[#00B074] focus-within:ring-2 focus-within:ring-[#00B074]/20 transition-all min-w-0 lg:min-w-[190px]">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by business name, keyword, or service..."
            className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Global Country Selector */}
        <div className="w-full md:w-auto lg:w-44 xl:w-52 flex-shrink-0">
          <CountrySelect
            id="search-top-country"
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
            triggerClassName="!min-h-[46px] sm:!min-h-[48px] !rounded-xl !border-slate-200 hover:!border-slate-300 focus-within:!border-[#00B074] focus-within:!ring-[#00B074]/20"
          />
        </div>

        {/* 3. Global City / Locality Selector */}
        <div className="w-full md:w-auto lg:w-40 xl:w-48 flex-shrink-0">
          <CitySelect
            id="search-top-city"
            aria-label="City or Locality"
            value={selectedCity}
            onChange={setSelectedCity}
            countryCode={selectedCountry}
            includeAllOption
            allOptionLabel="All Cities"
            placeholder="All Cities"
            variant="hero"
            triggerClassName="!min-h-[46px] sm:!min-h-[48px] !rounded-xl !border-slate-200 hover:!border-slate-300 focus-within:!border-[#00B074] focus-within:!ring-[#00B074]/20"
          />
        </div>

        {/* 4. Category Selector Dropdown */}
        <div ref={categoryRef} className="relative w-full md:w-auto lg:w-48 xl:w-56 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] bg-white border rounded-xl text-left transition-all ${
              isCategoryOpen
                ? 'border-[#00B074] ring-2 ring-[#00B074]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span
              className={`text-xs sm:text-sm truncate flex-1 ${
                selectedCategory ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
              }`}
            >
              {categoryLabel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                isCategoryOpen ? 'rotate-180 text-[#00B074]' : ''
              }`}
            />
          </button>

          {/* Category Dropdown Menu */}
          {isCategoryOpen && (
            <div className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Search input inside category dropdown */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Filter categories..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#00B074]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category options list */}
              <div className="max-h-60 overflow-y-auto py-1.5 divide-y divide-slate-50 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setIsCategoryOpen(false);
                    setCategorySearch('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-50 transition-colors ${
                    !selectedCategory ? 'font-bold text-[#00B074] bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>All Categories</span>
                  </span>
                  {!selectedCategory && <Check className="w-4 h-4 text-[#00B074]" />}
                </button>

                {filteredCategories.map((cat) => {
                  const isSelected =
                    selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                    selectedCategory === cat._id;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setIsCategoryOpen(false);
                        setCategorySearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-50 transition-colors ${
                        isSelected ? 'font-bold text-[#00B074] bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#00B074] flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">No categories found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. Green Search Button */}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00B074] hover:bg-[#009E68] active:scale-[0.98] shadow-sm hover:shadow-md transition-all flex-shrink-0 cursor-pointer"
        >
          <Search className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
