import React from 'react';

export default function CountriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 max-w-2xl">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-10 w-80 bg-slate-200 rounded-xl" />
        <div className="h-4 w-full bg-slate-100 rounded" />
      </div>

      {/* Countries Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-8 bg-slate-100 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-6 w-20 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

