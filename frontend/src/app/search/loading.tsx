import React from 'react';

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-72 bg-slate-200 rounded-xl" />
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>

      {/* Top Search Bar Skeleton */}
      <div className="mb-8 bg-white rounded-2xl sm:rounded-3xl p-3 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="h-11 flex-1 bg-slate-100 rounded-xl w-full" />
        <div className="h-11 w-full md:w-44 lg:w-48 bg-slate-100 rounded-xl" />
        <div className="h-11 w-full md:w-40 lg:w-44 bg-slate-100 rounded-xl" />
        <div className="h-11 w-full md:w-48 lg:w-52 bg-slate-100 rounded-xl" />
        <div className="h-11 w-full md:w-28 bg-emerald-100 rounded-xl" />
      </div>

      {/* Main Grid: Filters Sidebar + Results Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="w-full">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
            <div className="h-6 w-36 bg-slate-200 rounded" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-4 w-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Area Skeleton */}
        <main className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm"
              >
                <div className="h-36 bg-slate-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

