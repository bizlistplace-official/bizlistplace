import React from 'react';

export default function BusinessDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 bg-slate-200 rounded" />
        <div className="h-4 w-3 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-3 bg-slate-200 rounded" />
        <div className="h-4 w-36 bg-slate-200 rounded" />
      </div>

      {/* Hero Profile Banner Skeleton */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-64 bg-slate-200 rounded-xl" />
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-4 w-full max-w-xl bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Content Details Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

