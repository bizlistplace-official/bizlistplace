import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { POPULAR_COUNTRIES, IBusiness } from '@bizpockethub/shared';
import { ChevronRight, Globe, MapPin, Building2 } from 'lucide-react';

import { getCountryConfig } from '@/lib/countryConfig';

interface CountryPageProps {
  params: Promise<{ countrySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}): Promise<Metadata> {
  const { countrySlug } = await params;
  const cfg = getCountryConfig(countrySlug);
  const country =
    POPULAR_COUNTRIES.find(
      (c) => c.slug.toLowerCase() === countrySlug.toLowerCase() || c.code.toLowerCase() === countrySlug.toLowerCase()
    ) || (cfg ? POPULAR_COUNTRIES.find((c) => c.code.toLowerCase() === cfg.code.toLowerCase()) : undefined);
  if (!country) return { title: 'Country Not Found' };

  return {
    title: `Businesses in ${country.name}`,
    description: `Browse verified business directory listings, corporate suppliers, and offices in ${country.name} on Biz List Place.`,
    alternates: {
      canonical: `/countries/${country.slug}`,
    },
  };
}

export const revalidate = 60;

export default async function CountryDetailPage({ params, searchParams }: CountryPageProps) {
  const { countrySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const sort = resolvedSearchParams.sort || 'relevance';

  const cfg = getCountryConfig(countrySlug);
  const country =
    POPULAR_COUNTRIES.find(
      (c) => c.slug.toLowerCase() === countrySlug.toLowerCase() || c.code.toLowerCase() === countrySlug.toLowerCase()
    ) || (cfg ? POPULAR_COUNTRIES.find((c) => c.code.toLowerCase() === cfg.code.toLowerCase()) : undefined);
  if (!country) {
    notFound();
  }

  const queryParams = new URLSearchParams();
  queryParams.set('country', country.code);
  queryParams.set('page', String(page));
  queryParams.set('limit', '12');
  if (sort) queryParams.set('sort', sort);

  const res = await fetchApi<IBusiness[]>(`/businesses?${queryParams.toString()}`);

  const businesses: IBusiness[] = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
  const pagination = (res as any).pagination || (res.data as any)?.pagination || { total: businesses.length, page: 1, limit: 12, totalPages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Countries', href: '/countries' },
          { label: country.name },
        ]}
      />

      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <Globe className="w-3.5 h-3.5" />
            Country Directory
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {country.code}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Companies in {country.name}
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Discover verified business entities, head offices, and commercial branch locations
          operating in {country.name}.
        </p>

        {/* Popular Cities in Country */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Metropolitan Cities:
          </span>
          <div className="flex flex-wrap gap-2">
            {(country.popularCities || []).map((city) => (
              <Link
                key={city.slug}
                href={`/${country.slug}/${city.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 px-3 py-1 rounded-lg transition-colors"
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {businesses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">
            No published listings currently registered in {country.name}.
          </p>
          <Link href="/add-business">
            <span className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">
              List a Business in {country.name}
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

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl={`/countries/${countrySlug}`}
        queryParams={{ sort }}
      />
    </div>
  );
}
