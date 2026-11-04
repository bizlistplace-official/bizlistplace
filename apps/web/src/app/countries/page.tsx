import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { CountryInfo, POPULAR_COUNTRIES } from '@bizpockethub/shared';
import { Globe, MapPin, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Global Countries & Commercial Centers',
  description: 'Explore verified business directories across countries and metropolitan hubs worldwide on Biz List Place.',
};

export const revalidate = 60;

export default async function CountriesPage() {
  const res = await fetchApi<CountryInfo[]>('/locations/countries');
  const countries = res.data || POPULAR_COUNTRIES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Countries' }]} />

      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          International Hubs
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Browse by Country & City
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Locate registered companies and primary branch locations organized by country jurisdiction
          and metropolitan regions.
        </p>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div
            key={country.code}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-teal-500 transition-colors space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <Link
                href={`/countries/${country.slug}`}
                className="text-base font-bold text-slate-900 hover:text-teal-600 transition-colors flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                {country.name}
              </Link>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {country.code}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Major Business Cities
              </span>
              <div className="flex flex-wrap gap-2">
                {(country.popularCities || []).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${country.slug}/${city.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <Link
                href={`/countries/${country.slug}`}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
              >
                Explore all {country.name} listings &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
