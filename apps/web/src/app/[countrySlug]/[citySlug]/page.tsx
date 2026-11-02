import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { POPULAR_COUNTRIES, IBusiness } from '@bizpockethub/shared';
import { ChevronRight, MapPin, Building2 } from 'lucide-react';

interface CityPageProps {
  params: Promise<{ countrySlug: string; citySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

import { getCountryConfig } from '@/lib/countryConfig';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countrySlug: string; citySlug: string }>;
}): Promise<Metadata> {
  const { countrySlug, citySlug } = await params;
  const cfg = getCountryConfig(countrySlug);
  const country =
    POPULAR_COUNTRIES.find(
      (c) => c.slug === countrySlug || c.code.toLowerCase() === countrySlug.toLowerCase()
    ) || (cfg ? POPULAR_COUNTRIES.find((c) => c.code === cfg.code) : undefined);
  if (!country) return { title: 'Location Not Found' };

  const city = country.popularCities.find((ct) => ct.slug === citySlug);
  const cityName = city ? city.name : citySlug.replace(/-/g, ' ');

  return {
    title: `Businesses in ${cityName}, ${country.name}`,
    description: `Discover verified local and international companies, contractors, shops, and corporate branches in ${cityName}, ${country.name} on Biz List Place.`,
    alternates: {
      canonical: `/${countrySlug}/${citySlug}`,
    },
  };
}

export const revalidate = 60;

export default async function CityDetailPage({ params, searchParams }: CityPageProps) {
  const { countrySlug, citySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const sort = resolvedSearchParams.sort || 'relevance';

  const cfg = getCountryConfig(countrySlug);
  const country =
    POPULAR_COUNTRIES.find(
      (c) => c.slug === countrySlug || c.code.toLowerCase() === countrySlug.toLowerCase()
    ) || (cfg ? POPULAR_COUNTRIES.find((c) => c.code === cfg.code) : undefined);
  if (!country) {
    notFound();
  }

  const cityObj = country.popularCities.find((c) => c.slug === citySlug);
  const cityName = cityObj ? cityObj.name : citySlug.replace(/-/g, ' ');

  const queryParams = new URLSearchParams();
  queryParams.set('country', country.code);
  queryParams.set('city', cityName);
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
          { label: country.name, href: `/countries/${country.slug}` },
          { label: cityName },
        ]}
      />

      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <MapPin className="w-3.5 h-3.5" />
          City Hub Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Companies in {cityName}, {country.name}
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Explore registered business premises, local service providers, corporate offices, and
          industrial facilities located in {cityName}.
        </p>
      </div>

      {/* Listings Grid */}
      {businesses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">
            No published listings currently registered in {cityName}.
          </p>
          <Link href="/add-business">
            <span className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">
              List a Business in {cityName}
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
        baseUrl={`/${countrySlug}/${citySlug}`}
        queryParams={{ sort }}
      />
    </div>
  );
}
