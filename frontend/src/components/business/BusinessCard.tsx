import React from 'react';
import Link from 'next/link';
import { IBusiness } from '@bizpockethub/shared';
import { BusinessLogo } from './BusinessLogo';
import { Badge } from '../ui/Badge';
import {
  MapPin,
  Star,
  CheckCircle2,
  ExternalLink,
  Phone,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface BusinessCardProps {
  business: IBusiness;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryCat =
    business.categoryIds && business.categoryIds.length > 0
      ? (business.categoryIds[0] as any).name || 'General Business'
      : 'General Business';

  const loc = business.primaryLocation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group p-5">
      {/* Top Header: Category & Badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 line-clamp-1">
          {primaryCat}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {business.isFeatured && (
            <Badge variant="featured">Featured</Badge>
          )}
          {business.verificationStatus === 'verified' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          ) : (
            <Link
              href={`/claim-business?businessId=${business._id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              Claim
            </Link>
          )}
        </div>
      </div>

      {/* Business Name with Logo */}
      <div className="flex items-center gap-3 mb-2">
        <BusinessLogo business={business} size="md" className="flex-shrink-0 shadow-2xs" />
        <Link href={`/business/${business.slug}`} className="group-hover:text-[#0b7a70] transition-colors min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
            {business.name}
          </h3>
        </Link>
      </div>

      {/* Ratings & Reviews */}
      <div className="flex items-center gap-2 mt-1 mb-3 text-xs text-slate-600">
        <div className="flex items-center text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
          <span className="font-bold text-slate-900">{business.ratingAverage.toFixed(1)}</span>
        </div>
        <span className="text-slate-400">•</span>
        <span>
          {business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* Location */}
      {loc && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">
            {loc.city}, {loc.countryName || loc.countryCode}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-grow">
        {business.shortDescription || business.description}
      </p>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title={business.phone}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Visit official website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <Link
          href={`/business/${business.slug}`}
          className="text-xs font-semibold text-slate-900 hover:text-[#0b7a70] flex items-center gap-1 transition-colors"
        >
          View Profile &rarr;
        </Link>
      </div>
    </div>
  );
}
