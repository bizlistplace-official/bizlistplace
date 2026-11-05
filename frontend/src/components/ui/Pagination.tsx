'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string | number | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && key !== 'page') {
        params.set(key, String(val));
      }
    });
    params.set('page', String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-8 max-w-full">
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="p-2 border border-slate-200 rounded-lg text-slate-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {visiblePages.map((p, index) => {
        const isCurrent = p === currentPage;
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && p - prevPage > 1;

        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="px-2 text-slate-400">...</span>}
            <Link
              href={createPageUrl(p)}
              className={`min-w-9 h-9 px-3 flex items-center justify-center text-sm font-medium rounded-lg border transition-colors ${
                isCurrent
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p}
            </Link>
          </React.Fragment>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="p-2 border border-slate-200 rounded-lg text-slate-300 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
