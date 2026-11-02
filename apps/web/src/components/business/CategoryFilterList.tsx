'use client';

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { ICategory } from '@bizpockethub/shared';

interface CategoryFilterListProps {
  categories: ICategory[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
  baseUrl?: string;
  preserveParams?: Record<string, string>;
  className?: string;
  maxHeight?: string;
}

export function CategoryFilterList({
  categories,
  selectedCategory = '',
  onSelectCategory,
  baseUrl,
  preserveParams = {},
  className = '',
  maxHeight = 'max-h-[520px]',
}: CategoryFilterListProps) {
  // Sort categories: categories with businesses first (descending), then alphabetically
  const sortedCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => {
      const countA = a.businessCount ?? 0;
      const countB = b.businessCount ?? 0;
      if (countB !== countA) {
        return countB - countA;
      }
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Helper to generate URL preserving other search params
  const getHref = (slug: string) => {
    if (!baseUrl) return '#';
    const params = new URLSearchParams();
    Object.entries(preserveParams).forEach(([k, v]) => {
      if (v && k !== 'category' && k !== 'page') params.set(k, v);
    });
    if (slug) {
      params.set('category', slug);
    }
    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-5 sm:p-6 ${className}`}
    >
      {/* Header matching screenshot */}
      <div className="flex items-center gap-2.5 pb-4 px-1">
        <SlidersHorizontal className="w-5 h-5 text-emerald-600 stroke-[2.4]" />
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Filter Listings
        </h3>
      </div>

      {/* Subheader matching screenshot */}
      <div className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-3 px-1">
        CATEGORIES
      </div>

      {/* Scrollable list matching screenshot */}
      <div
        className={`${maxHeight} overflow-y-auto space-y-1.5 pr-1.5 focus:outline-none`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
        }}
      >
        {/* All Categories Item */}
        {onSelectCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm transition-all text-left ${
              !selectedCategory
                ? 'bg-[#EAF8F5] text-[#065F56] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>All Categories</span>
          </button>
        ) : (
          <Link
            href={getHref('')}
            prefetch={true}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm transition-all ${
              !selectedCategory
                ? 'bg-[#EAF8F5] text-[#065F56] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <span>All Categories</span>
          </Link>
        )}

        {/* Categories List */}
        {sortedCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = cat.businessCount ?? 0;

          if (onSelectCategory) {
            return (
              <button
                key={cat.slug || cat._id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-2xl text-sm transition-all group text-left ${
                  isSelected
                    ? 'bg-[#EAF8F5] text-[#065F56] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 font-medium'
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200/60 font-bold'
                      : 'bg-slate-50 border-slate-200/70 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 shadow-xs'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={cat.slug || cat._id}
              href={getHref(cat.slug)}
              prefetch={true}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-2xl text-sm transition-all group ${
                isSelected
                  ? 'bg-[#EAF8F5] text-[#065F56] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 font-medium'
              }`}
            >
              <span className="truncate pr-2">{cat.name}</span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200/60 font-bold'
                    : 'bg-slate-50 border-slate-200/70 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 shadow-xs'
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
