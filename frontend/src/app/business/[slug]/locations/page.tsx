import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { IBusiness, IBusinessLocation } from '@bizpockethub/shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ChevronRight, MapPin, Phone, Mail, Building2, GitBranch } from 'lucide-react';

interface LocationsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchApi<IBusiness>(`/businesses/${slug}`);
  if (!res.success || !res.data) return { title: 'Locations Not Found' };
  return {
    title: `${res.data.name} — Branch Locations & Offices`,
    description: `Official branch locations, corporate offices, and premises for ${res.data.name} on Biz List Place.`,
  };
}

export default async function BusinessLocationsPage({ params }: LocationsPageProps) {
  const { slug } = await params;
  const res = await fetchApi<IBusiness & { locations: IBusinessLocation[] }>(`/businesses/${slug}`);

  if (!res.success || !res.data) notFound();
  const biz = res.data;
  const locations = biz.locations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Directory', href: '/search' },
          { label: biz.name, href: `/business/${slug}` },
          { label: 'Branch Locations' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <GitBranch className="w-7 h-7 text-teal-600" />
          {biz.name} — Registered Branches & Offices
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Comprehensive geographic registry of physical premises, regional branches, and customer
          service offices for {biz.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc, idx) => (
          <div
            key={loc._id || loc.branchSlug || (loc as any).id || `loc-${idx}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    loc.isPrimary
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {loc.isPrimary ? 'Primary HQ' : 'Branch Office'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {loc.countryCode}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900">{loc.branchName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {loc.addressLine1}
                {loc.addressLine2 ? `, ${loc.addressLine2}` : ''}
                <br />
                {loc.city}, {loc.region} {loc.postalCode}
                <br />
                <strong>{loc.countryName || loc.countryCode}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              {loc.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${loc.phone}`} className="hover:underline font-medium">
                    {loc.phone}
                  </a>
                </div>
              )}
              {loc.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${loc.email}`} className="hover:underline font-medium text-teal-700">
                    {loc.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
