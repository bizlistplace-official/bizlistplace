import React from 'react';
import { Metadata } from 'next';
import { fetchApi } from '@/lib/api';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Pagination } from '@/components/ui/Pagination';
import { CategoryFilterList } from '@/components/business/CategoryFilterList';
import { SearchFilterPanel } from '@/components/search/SearchFilterPanel';
import { SearchTopBar } from '@/components/search/SearchTopBar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IBusiness, ICategory } from '@bizpockethub/shared';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Search Directory',
  description: 'Search worldwide businesses by keyword, sector, country, and city on Biz List Place.',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    city?: string;
    businessType?: string;
    verifiedOnly?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const country = resolvedParams.country || '';
  const city = resolvedParams.city || '';
  const businessType = resolvedParams.businessType || '';
  const verifiedOnly = resolvedParams.verifiedOnly === 'true';
  const sort = resolvedParams.sort || 'relevance';

  // Build query string for API
  const apiParams = new URLSearchParams();
  if (q) apiParams.set('q', q);
  if (category) apiParams.set('category', category);
  if (country) apiParams.set('country', country);
  if (city) apiParams.set('city', city);
  if (businessType) apiParams.set('businessType', businessType);
  if (verifiedOnly) apiParams.set('verifiedOnly', 'true');
  if (sort) apiParams.set('sort', sort);
  apiParams.set('page', String(page));
  apiParams.set('limit', '12');

  const [searchRes, categoriesRes] = await Promise.all([
    fetchApi<IBusiness[]>(`/businesses?${apiParams.toString()}`),
    fetchApi<ICategory[]>('/categories'),
  ]);

  const businesses: IBusiness[] = Array.isArray(searchRes.data)
    ? searchRes.data
    : (searchRes.data as any)?.data || [];
  const pagination = (searchRes as any).pagination || (searchRes.data as any)?.pagination || { total: businesses.length, page: 1, limit: 12, totalPages: 1 };
  const categories = categoriesRes.data || [];

  const hasFilters = Boolean(q || category || country || city || businessType || verifiedOnly);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={
          hasFilters
            ? [
                { label: 'Directory', href: '/search' },
                {
                  label: q
                    ? `Results for "${q}"`
                    : category
                    ? categories.find((c) => c.slug === category)?.name || category
                    : country
                    ? `Country: ${country}`
                    : city
                    ? `City: ${city}`
                    : 'Search Results',
                },
              ]
            : [{ label: 'Directory' }]
        }
      />

      {/* Header */}
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {q ? `Search Results for "${q}"` : 'Worldwide Business Directory'}
        </h1>
        <p className="text-slate-500 text-sm">
          Showing {businesses.length} of {pagination.total} verified companies and commercial listings
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="mb-8">
        <SearchTopBar
          initialQuery={q}
          initialCategory={category}
          initialCountry={country}
          initialCity={city}
          categories={categories}
          preserveParams={{
            businessType,
            verifiedOnly: verifiedOnly ? 'true' : '',
            sort,
          }}
        />
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full">
          {/* Mobile Collapsible Filters Accordion */}
          <details className="lg:hidden group bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6">
            <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-sm text-slate-800 select-none">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <span>Filters &amp; Categories</span>
                {hasFilters && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                    Active
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold text-teal-600 group-open:hidden">Tap to Expand</span>
              <span className="text-xs font-semibold text-slate-500 hidden group-open:inline">Hide</span>
            </summary>
            <div className="pt-4 space-y-6">
              {/* Category Filter */}
              <CategoryFilterList
                categories={categories}
                selectedCategory={category}
                baseUrl="/search"
                preserveParams={{
                  q,
                  country,
                  city,
                  businessType,
                  verifiedOnly: verifiedOnly ? 'true' : '',
                  sort,
                }}
                maxHeight="max-h-[350px]"
              />

              {/* Location & Keyword Refinement */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                    Location &amp; Filters
                  </span>
                  {hasFilters && (
                    <Link
                      href="/search"
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Reset All
                    </Link>
                  )}
                </div>

                <SearchFilterPanel
                  initialValues={{
                    q,
                    category,
                    country,
                    city,
                    businessType,
                    verifiedOnly,
                    sort,
                  }}
                />
              </div>
            </div>
          </details>

          {/* Desktop Permanent Sidebar */}
          <div className="hidden lg:block space-y-6">
            <CategoryFilterList
              categories={categories}
              selectedCategory={category}
              baseUrl="/search"
              preserveParams={{
                q,
                country,
                city,
                businessType,
                verifiedOnly: verifiedOnly ? 'true' : '',
                sort,
              }}
              maxHeight="max-h-[460px]"
            />

            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                  Location &amp; Filters
                </span>
                {hasFilters && (
                  <Link
                    href="/search"
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Reset All
                  </Link>
                )}
              </div>

              <SearchFilterPanel
                initialValues={{
                  q,
                  category,
                  country,
                  city,
                  businessType,
                  verifiedOnly,
                  sort,
                }}
              />
            </div>
          </div>
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Active Filters:</span>
              {q && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                  Keyword: <strong>{q}</strong>
                </span>
              )}
              {category && (
                <span className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200">
                  Sector: <strong>{category}</strong>
                </span>
              )}
              {country && (
                <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
                  Country: <strong>{country}</strong>
                </span>
              )}
              {city && (
                <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-md border border-purple-200">
                  City: <strong>{city}</strong>
                </span>
              )}
              {verifiedOnly && (
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                  Verified Only
                </span>
              )}
            </div>
          )}

          {/* Cards Grid */}
          {businesses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Listings Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No published businesses match your selected criteria. Try removing some filters or
                searching for a broader keyword.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/search"
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear All Filters
                </Link>
                <Link
                  href="/add-business"
                  className="px-4 py-2 bg-teal-600 rounded-lg text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  Add This Business
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {businesses.map((biz) => (
                <BusinessCard key={biz._id} business={biz} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            baseUrl="/search"
            queryParams={{
              q,
              category,
              country,
              city,
              businessType,
              verifiedOnly: verifiedOnly ? 'true' : undefined,
              sort,
            }}
          />
        </div>
      </div>
    </div>
  );
}
