import React from 'react';

export default function CategoryDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 bg-slate-200 rounded" />
        <div className="h-4 w-3 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-3 bg-slate-200 rounded" />
        <div className="h-4 w-28 bg-slate-200 rounded" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded-full" />
        <div className="h-10 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-full max-w-xl bg-slate-200 rounded" />
        <div className="h-4 w-48 bg-slate-200 rounded" />
      </div>

      {/* Business Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm"
          >
            <div className="h-40 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

