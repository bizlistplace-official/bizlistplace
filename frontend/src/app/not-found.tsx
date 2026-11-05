import React from 'react';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAFBFD]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1D68F2] flex items-center justify-center mx-auto shadow-sm">
          <Search className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1D68F2] tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page or business listing you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white text-sm font-bold shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-xs transition-all"
          >
            <span>Search Businesses</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

