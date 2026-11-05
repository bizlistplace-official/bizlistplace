import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICategory, IBusiness, INITIAL_CATEGORIES } from '@bizpockethub/shared';
import { ChevronRight, Building2, Search, SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; country?: string; sort?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[:.,]+$/, '');
  const res = await fetchApi<ICategory>(`/categories/${slug}`);
  const category = res.data || (INITIAL_CATEGORIES.find((c) => c.slug === slug) as any);
  if (!category) {
    return { title: 'Category Not Found' };
  }
  return {
    title: `${category.name} Companies & Providers`,
    description: `Discover verified ${category.name.toLowerCase()} businesses, suppliers, and agencies worldwide on Biz List Place. ${category.description || ''}`,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[:.,]+$/, '');
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const country = resolvedSearchParams.country || '';
  const sort = resolvedSearchParams.sort || 'relevance';

  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', '12');
  if (country) queryParams.set('country', country);
  if (sort) queryParams.set('sort', sort);

  const [categoryRes, businessRes] = await Promise.all([
    fetchApi<ICategory>(`/categories/${slug}`),
    fetchApi<IBusiness[]>(`/categories/${slug}/businesses?${queryParams.toString()}`),
  ]);

  let category = categoryRes.data;
  if (!category) {
    const fallback = INITIAL_CATEGORIES.find((c) => c.slug === slug);
    if (fallback) {
      category = {
        _id: `cat_${fallback.slug}`,
        name: fallback.name,
        slug: fallback.slug,
        icon: fallback.icon,
        imageUrl: (fallback as any).imageUrl,
        description: fallback.description,
        isActive: true,
        businessCount: 0,
        subcategories: (fallback as any).subcategories || [],
      } as any;
    }
  }

  if (!category) {
    notFound();
  }

  const businesses: IBusiness[] = Array.isArray(businessRes.data)
    ? businessRes.data
    : (businessRes.data as any)?.data || [];
  const pagination = (businessRes as any).pagination || (businessRes.data as any)?.pagination || { total: businesses.length, page: 1, limit: 12, totalPages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Building2 className="w-3.5 h-3.5" />
          Industry Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {category.name}
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          {category.description ||
            'Find accredited, verified companies, consultants, contractors, and corporate offices operating within this sector worldwide.'}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          <span>{pagination.total} Verified Listings</span>
          <span>•</span>
          <Link
            href={`/search?category=${slug}`}
            className="text-[#0b7a70] hover:text-teal-900 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Refine with advanced filters &rarr;
          </Link>
        </div>
      </div>

      {/* Listings Section with Sequential H2 */}
      <section aria-labelledby="listings-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 id="listings-heading" className="text-xl font-bold text-slate-900">
            Verified {category.name} Companies
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {businesses.length} of {pagination.total} results
          </span>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              No published listings currently registered in {category.name}
            </h3>
            <p className="text-sm text-slate-600">
              Be the first accredited provider listed in this industry category.
            </p>
            <Link href="/add-business">
              <span className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">
                List Your Business in {category.name}
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businesses.map((biz) => (
              <BusinessCard key={biz._id} business={biz} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl={`/categories/${slug}`}
        queryParams={{ country, sort }}
      />
    </div>
  );
}
