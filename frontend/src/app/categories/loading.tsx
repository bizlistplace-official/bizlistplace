import React from 'react';

export default function CategoriesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 overflow-x-hidden">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1a56c5] text-xs font-bold tracking-wide uppercase shadow-xs">
          Comprehensive Directory
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore All Business Categories
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Find accredited companies, suppliers, contractors, retail outlets, and service providers
          categorized by their primary industry sector across Pakistan and worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full animate-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="h-4 w-16 bg-slate-100 rounded" />
              <div className="h-4 w-12 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

