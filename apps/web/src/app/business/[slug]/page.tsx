import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ReviewSection } from '@/components/business/ReviewSection';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import { ClaimBusinessButton } from '@/components/business/ClaimBusinessButton';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { IBusiness, IBusinessLocation, POPULAR_COUNTRIES } from '@bizpockethub/shared';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Star,
  Flag,
  Share2,
  ChevronRight,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[:.,]+$/, '');
  const res = await fetchApi<IBusiness>(`/businesses/${slug}`);
  if (!res.success || !res.data) {
    return { title: 'Business Profile Not Found' };
  }
  const biz = res.data;
  const loc = biz.primaryLocation;
  const locStr = loc ? ` in ${loc.city}, ${loc.countryName || loc.countryCode}` : '';

  return {
    title: `${biz.name}${locStr}`,
    description: `${biz.shortDescription || biz.description.slice(0, 160)}. Verified contact info, reviews & branch locations.`,
    alternates: {
      canonical: `/business/${biz.slug}`,
    },
    openGraph: {
      title: `${biz.name} | Biz List Place`,
      description: biz.shortDescription || biz.description.slice(0, 160),
      url: `/business/${biz.slug}`,
      type: 'profile',
    },
  };
}

export const revalidate = 60;

export default async function BusinessDetailPage({ params }: BusinessPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[:.,]+$/, '');
  const res = await fetchApi<
    IBusiness & {
      locations: IBusinessLocation[];
      primaryLocation?: IBusinessLocation;
      reviews: any[];
      related: IBusiness[];
    }
  >(`/businesses/${slug}`);

  if (!res.success || !res.data) {
    notFound();
  }

  const biz = res.data;
  const primaryLoc = biz.primaryLocation || biz.locations?.[0];
  const otherLocations = (biz.locations || []).filter(
    (l) => l.branchSlug !== primaryLoc?.branchSlug
  );

  // Generate Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description,
    url: biz.website || `https://bizlistplace.com/business/${biz.slug}`,
    telephone: biz.phone,
    email: biz.contactEmail,
    address: primaryLoc
      ? {
          '@type': 'PostalAddress',
          streetAddress: primaryLoc.addressLine1,
          addressLocality: primaryLoc.city,
          addressRegion: primaryLoc.region,
          postalCode: primaryLoc.postalCode,
          addressCountry: primaryLoc.countryCode,
        }
      : undefined,
    ...(biz.ratingAverage > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: biz.ratingAverage,
            reviewCount: biz.reviewCount || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  // Construct logical SEO breadcrumbs: Home > Country > City > Category > Business Name
  const breadcrumbItems: BreadcrumbItem[] = [];

  const countryCode = primaryLoc?.countryCode?.toUpperCase();
  const countryInfo = countryCode ? POPULAR_COUNTRIES.find((c) => c.code === countryCode) : null;
  const cityName = primaryLoc?.city;
  const primaryCat = biz.categoryIds?.[0] as any;

  if (countryInfo) {
    breadcrumbItems.push({
      label: countryInfo.name,
      href: `/countries/${countryInfo.slug}`,
    });

    if (cityName) {
      const matchedCity = countryInfo.popularCities?.find(
        (c) => c.name.toLowerCase() === cityName.toLowerCase()
      );
      const citySlug = matchedCity ? matchedCity.slug : cityName.toLowerCase().replace(/\s+/g, '-');
      breadcrumbItems.push({
        label: cityName,
        href: `/${countryInfo.slug}/${citySlug}`,
      });
    }
  }

  if (primaryCat && primaryCat.name && primaryCat.slug) {
    breadcrumbItems.push({
      label: primaryCat.name,
      href: `/categories/${primaryCat.slug}`,
    });
  } else if (!countryInfo) {
    breadcrumbItems.push({
      label: 'Directory',
      href: '/search',
    });
  }

  breadcrumbItems.push({
    label: biz.name,
  });

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb Navigation with SEO Schema.org */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Profile Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 max-w-3xl">
              {/* Company Logo Badge */}
              <div className="flex-shrink-0">
                <BusinessLogo business={biz} size="xl" className="shadow-md" />
              </div>

              <div className="space-y-4 flex-1 min-w-0">
                {/* Category & Verified Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const seen = new Set<string>();
                    const uniqueCategories = (biz.categoryIds || []).filter((cat: any) => {
                      const identifier = typeof cat === 'object' && cat ? (cat.slug || cat._id || cat.name) : String(cat);
                      if (!identifier || seen.has(identifier)) return false;
                      seen.add(identifier);
                      return true;
                    });

                    return uniqueCategories.map((cat: any, idx: number) => {
                      const catSlug = typeof cat === 'object' && cat ? cat.slug : cat;
                      const catName = typeof cat === 'object' && cat ? cat.name : cat;
                      const catKey = typeof cat === 'object' && cat ? (cat._id || cat.slug || `cat_${idx}`) : `cat_${cat}_${idx}`;
                      return (
                        <Link
                          key={`${catKey}-${idx}`}
                          href={`/categories/${catSlug}`}
                          className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200 hover:bg-teal-100 transition-colors"
                        >
                          {catName}
                        </Link>
                      );
                    });
                  })()}

                  {biz.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Business Entity
                    </span>
                  ) : (
                    <ClaimBusinessButton business={biz} variant="badge" />
                  )}
                </div>

                {/* Title & Rating */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight break-words">
                    {biz.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-sm text-slate-600">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                      <span>{biz.ratingAverage > 0 ? biz.ratingAverage.toFixed(1) : 'Unrated'}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span>
                      {biz.reviewCount} customer {biz.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                    {primaryLoc && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>{primaryLoc.city}, {primaryLoc.countryName || primaryLoc.countryCode}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Verification Details Box */}
                {biz.verificationStatus === 'verified' && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Biz List Place Verified Entity:</strong>{' '}
                      {biz.verificationNotes ||
                        'This listing has undergone business registry validation and confirmed administrative contact credentials.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 lg:w-64">
              {biz.verificationStatus !== 'verified' && (
                <ClaimBusinessButton business={biz} variant="primary" />
              )}

              {biz.website && (
                <a
                  href={biz.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Visit Official Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call: {biz.phone}
                </a>
              )}

              {biz.contactEmail && (
                <a
                  href={`mailto:${biz.contactEmail}`}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
                >
                  <Mail className="w-4 h-4" />
                  Inquire via Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview / About */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">About {biz.name}</h2>
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {biz.description}
              </div>

              {biz.serviceAreas && biz.serviceAreas.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Service Areas Covered:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {biz.serviceAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Branch Locations Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-teal-600" />
                    Offices & Branch Locations ({biz.locations?.length || 1})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified registered premises and regional customer service centers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Location Card */}
                {primaryLoc && (
                  <div className="p-5 rounded-xl border-2 border-teal-500/30 bg-teal-50/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                        Primary Headquarters
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-bold">
                        {primaryLoc.countryCode}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm break-words">{primaryLoc.branchName}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      {primaryLoc.addressLine1}
                      {primaryLoc.addressLine2 ? `, ${primaryLoc.addressLine2}` : ''}
                      <br />
                      {primaryLoc.city}, {primaryLoc.region} {primaryLoc.postalCode}
                      <br />
                      <strong>{primaryLoc.countryName || primaryLoc.countryCode}</strong>
                    </p>

                    {primaryLoc.phone && (
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${primaryLoc.phone}`} className="hover:underline font-medium break-all">
                          {primaryLoc.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Secondary Locations */}
                {otherLocations.map((loc, idx) => (
                  <div
                    key={loc._id || loc.branchSlug || (loc as any).id || `other-loc-${idx}`}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Regional Branch
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-bold">
                        {loc.countryCode}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm break-words">{loc.branchName}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      {loc.addressLine1}
                      <br />
                      {loc.city}, {loc.region} {loc.postalCode}
                      <br />
                      <strong>{loc.countryName || loc.countryCode}</strong>
                    </p>

                    {loc.phone && (
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${loc.phone}`} className="hover:underline font-medium break-all">
                          {loc.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <ReviewSection
                businessId={biz._id}
                initialReviews={biz.reviews || []}
                ratingAverage={biz.ratingAverage}
                reviewCount={biz.reviewCount}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Business Contact Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Contact & Information
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                {biz.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                        Phone
                      </span>
                      <a href={`tel:${biz.phone}`} className="font-semibold text-slate-900 hover:underline">
                        {biz.phone}
                      </a>
                    </div>
                  </div>
                )}

                {biz.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                        Official Email
                      </span>
                      <a href={`mailto:${biz.contactEmail}`} className="font-semibold text-teal-700 hover:underline">
                        {biz.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {biz.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                        Website
                      </span>
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-teal-700 hover:underline break-all"
                      >
                        {biz.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                      Business Entity Type
                    </span>
                    <span className="capitalize font-semibold text-slate-900">
                      {biz.businessType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Claim / Report Action */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {biz.verificationStatus !== 'verified' ? (
                  <ClaimBusinessButton business={biz} variant="sidebar" />
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Official Profile</span>
                  </div>
                )}

                <Link
                  href={`/contact?subject=Report+Listing+${biz.slug}`}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report Incorrect Information
                </Link>
              </div>
            </div>

            {/* Related Businesses in Same Category */}
            {biz.related && biz.related.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Similar Businesses</h3>
                <div className="space-y-4">
                  {biz.related.map((rel) => (
                    <div key={rel._id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <Link
                        href={`/business/${rel.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-teal-600 block line-clamp-1"
                      >
                        {rel.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center text-amber-500 font-semibold">
                          ★ {rel.ratingAverage.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{rel.reviewCount} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
