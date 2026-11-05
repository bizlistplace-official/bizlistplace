import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { ICategory, INITIAL_CATEGORIES } from '@bizpockethub/shared';
import { CategoriesExplorer } from '@/components/categories/CategoriesExplorer';

export const metadata: Metadata = {
  title: 'All Business Categories | Biz List Place',
  description:
    'Explore 50+ verified business categories and industry sectors across Pakistan and worldwide on Biz List Place.',
};

// Use ISR (Incremental Static Regeneration) to serve pre-rendered HTML instantly
export const revalidate = 300;

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
        >
          <div className="h-44 w-full bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-2/3 bg-slate-100 rounded" />
            <div className="pt-2 flex gap-1.5">
              <div className="h-5 w-16 bg-slate-100 rounded-md" />
              <div className="h-5 w-20 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-14 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CategoriesList() {
  const res = await fetchApi<ICategory[]>('/categories');
  const apiCategories = res.data || [];

  // Create quick lookup map for API categories
  const apiMap = new Map(apiCategories.map((c) => [c.slug, c]));

  // Merge INITIAL_CATEGORIES with API categories so all 50+ categories are ALWAYS rendered
  const mergedList: ICategory[] = INITIAL_CATEGORIES.map((initCat) => {
    const fromApi = apiMap.get(initCat.slug);
    return {
      _id: fromApi?._id || `cat_${initCat.slug}`,
      name: fromApi?.name || initCat.name,
      slug: initCat.slug,
      icon: fromApi?.icon || initCat.icon,
      imageUrl: (fromApi as any)?.imageUrl || (initCat as any)?.imageUrl,
      description: fromApi?.description || initCat.description,
      isActive: true,
      businessCount: fromApi?.businessCount ?? 0,
      subcategories: (fromApi as any)?.subcategories || initCat.subcategories || [],
    };
  });

  // Also include any extra custom categories from the API not present in INITIAL_CATEGORIES
  const initialSlugs = new Set(INITIAL_CATEGORIES.map((c) => c.slug));
  const extras = apiCategories.filter((c) => !initialSlugs.has(c.slug));

  const allCategories = [...mergedList, ...extras];

  return <CategoriesExplorer initialCategories={allCategories} />;
}

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      {/* Centered Header with Equal Left and Right Spacing */}
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

      {/* Categories Grid streamed with Suspense */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesList />
      </Suspense>
    </div>
  );
}
