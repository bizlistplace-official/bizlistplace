'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  Building2,
  Plus,
} from 'lucide-react';
import { IBusiness } from '@bizpockethub/shared';
import { BusinessLogo } from '@/components/business/BusinessLogo';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  education: '/images/harvard.svg',
  hospital: '/images/mgh.svg',
  healthcare: '/images/mgh.svg',
  laboratory: '/images/mgh.svg',
  bank: '/images/biz_tech.jpg',
  'bus-companies': '/images/biz_auto.jpg',
  'shopping-retail-chains': '/images/biz_fashion.jpg',
  'courier-cargo-companies': '/images/biz_auto.jpg',
  'restaurants-food-chains': '/images/biz_coffee.jpg',
  'telecom-companies': '/images/biz_tech.jpg',
  'hotels-guest-houses': '/images/biz_coffee.jpg',
  'information-technology-it-services': '/images/biz_tech.jpg',
  automotive: '/images/biz_auto.jpg',
  'apparel-textiles': '/images/biz_fashion.jpg',
  'real-estate': '/images/hero_city_day.jpg',
  'electronics-solar-appliances': '/images/biz_tech.jpg',
  'beauty-spa': '/images/biz_fashion.jpg',
  travel: '/images/biz_auto.jpg',
  restaurants: '/images/biz_coffee.jpg',
  construction: '/images/hero_city_day.jpg',
  technology: '/images/biz_tech.jpg',
  'technology-software': '/images/biz_tech.jpg',
  'legal-financial': '/images/biz_tech.jpg',
  legal: '/images/biz_tech.jpg',
};

const PHOTO_POOL = [
  '/images/harvard.svg',
  '/images/mgh.svg',
  '/images/biz_tech.jpg',
  '/images/biz_hospital.jpg',
  '/images/biz_coffee.jpg',
  '/images/biz_fashion.jpg',
  '/images/biz_auto.jpg',
  '/images/hero_city_day.jpg',
];

function getListingPhoto(biz: IBusiness, index: number): string {
  if (biz.coverImageUrl) return biz.coverImageUrl;

  const primarySlug = biz.primaryCategory?.slug || '';
  if (CATEGORY_IMAGE_MAP[primarySlug]) {
    return CATEGORY_IMAGE_MAP[primarySlug];
  }

  for (const catId of biz.categoryIds || []) {
    const slug = typeof catId === 'string' ? catId : catId.slug;
    if (slug && CATEGORY_IMAGE_MAP[slug]) {
      return CATEGORY_IMAGE_MAP[slug];
    }
  }

  return PHOTO_POOL[index % PHOTO_POOL.length];
}

import { CountryConfig } from '@/lib/countryConfig';

interface FeaturedBusinessesSliderProps {
  initialBusinesses: IBusiness[];
  country?: CountryConfig;
}

export function FeaturedBusinessesSlider({
  initialBusinesses = [],
  country,
}: FeaturedBusinessesSliderProps) {
  // Sort listings:
  // 1. More reviews preferred (highest review count first)
  // 2. Latest listings preferred (newest creation date first)
  const items = useMemo(() => {
    if (!initialBusinesses || initialBusinesses.length === 0) return [];

    const sortedList = [...initialBusinesses].sort((a, b) => {
      const revA = a.reviewCount || 0;
      const revB = b.reviewCount || 0;
      if (revB !== revA) {
        return revB - revA; // higher reviews first
      }
      const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
      return timeB - timeA; // latest listing first
    });

    // Target 36 items for 6 slides of 6 businesses (6,6,6,6,6,6 then repeat)
    const targetCount = 36;
    const filled: IBusiness[] = [];

    while (filled.length < targetCount && sortedList.length > 0) {
      filled.push(...sortedList);
    }
    const final36 = filled.slice(0, targetCount);

    return final36.map((biz, idx) => {
      const city = biz.primaryLocation?.city || 'Cambridge';
      const country = biz.primaryLocation?.countryName || biz.primaryLocation?.countryCode || 'USA';
      const categoryName = biz.primaryCategory?.name || 'Education';
      const photo = getListingPhoto(biz, idx);
      const rating = biz.ratingAverage || 0.0;
      const reviews = biz.reviewCount || 0;
      const phone = biz.phone || '+1 (555) 000-0000';
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const description =
        biz.shortDescription ||
        biz.description ||
        `${biz.name} is a verified provider offering top-tier services and excellence.`;

      return {
        id: `${biz._id || biz.slug}-${idx}`,
        name: biz.name,
        slug: biz.slug,
        category: categoryName,
        city: city,
        country: country,
        photo: photo,
        logoUrl: biz.logoUrl,
        website: biz.website,
        rating: rating,
        reviews: reviews,
        phone: phone,
        cleanPhone: cleanPhone,
        description: description,
        verified: biz.verificationStatus === 'verified' || true,
      };
    });
  }, [initialBusinesses]);

  // 6 businesses per slide (2 rows of 3 columns)
  const itemsPerSlide = 6;
  const totalSlides = useMemo(() => Math.max(1, Math.ceil(items.length / itemsPerSlide)), [items.length]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  // Auto-play infinite rotation: 6, 6, 6, 6, 6, 6 then repeat
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  if (items.length === 0) {
    return (
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-14 sm:mt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1D68F2] flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {country ? `No businesses listed in ${country.name} yet` : 'No businesses listed yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
            Be the very first company or service provider to list in {country ? country.name : 'this directory'}. It takes less than 2 minutes and is 100% free!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={country ? `/add-business?country=${country.code}` : '/add-business'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Business Free</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Browse All Businesses</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const visibleItems = items.slice(
    currentSlide * itemsPerSlide,
    currentSlide * itemsPerSlide + itemsPerSlide
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
      {/* Header aligned with centered cards */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 px-4 sm:px-10 lg:px-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {country ? `Featured Businesses in ${country.name}` : 'Featured Businesses'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {country
              ? `Top-rated and recently listed verified ${country.demonym} companies, branches & services (${country.currency})`
              : 'Top-rated and recently listed verified organizations, institutions & companies'}
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <Link
            href={country ? `/search?country=${encodeURIComponent(country.code)}` : '/search'}
            className="text-xs sm:text-sm font-semibold text-[#1D68F2] hover:text-[#1557D0] flex items-center gap-1 transition-colors"
          >
            <span>{country ? `View All in ${country.shortName}` : 'View All Businesses'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {totalSlides > 1 && (
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100 shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100 shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slider Container with Reduced Card Width and Centered Layout */}
      <div
        className="relative group/slider max-w-5xl mx-auto px-4 sm:px-10 lg:px-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Previous Button (Desktop/Tablet) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200/90 items-center justify-center text-slate-700 hover:text-[#1D68F2] hover:border-blue-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}

        {/* Next Button (Desktop/Tablet) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200/90 items-center justify-center text-slate-700 hover:text-[#1D68F2] hover:border-blue-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}

        {/* 6 Cards Grid (2 Rows x 3 Columns) - Centered with Reduced Card Width and Tighter Gap */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 transition-opacity duration-300 justify-center ${
            isAnimating ? 'opacity-85' : 'opacity-100'
          }`}
        >
          {visibleItems.map((biz) => (
            <Link
              key={biz.id}
              href={`/business/${biz.slug}`}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              {/* Card Image Banner with Two Floating Badges - Compact Height */}
              <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
                <Image
                  src={biz.photo}
                  alt={biz.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={biz.photo.startsWith('http')}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Badges (Top Left): Category + City */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  {/* Category Pill (Blue) */}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1D68F2] text-white text-[9.5px] font-extrabold uppercase tracking-wider shadow-sm">
                    {biz.category}
                  </span>

                  {/* City Pill (White) */}
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 text-[9.5px] font-extrabold uppercase tracking-wider shadow-sm">
                    {biz.city}
                  </span>
                </div>

                {/* Brand Logo (Bottom Right) */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <BusinessLogo business={biz} size="sm" className="shadow-md bg-white border-2 border-white rounded-lg" />
                </div>
              </div>

              {/* Card Body - Compact Spacing */}
              <div className="p-4 sm:p-4.5 flex flex-col flex-1 justify-between gap-2.5">
                <div className="space-y-1.5">
                  {/* Title & Verified Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#1D68F2] group-hover:text-[#1557D0] transition-colors line-clamp-1">
                      {biz.name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#1D68F2] fill-blue-50 flex-shrink-0" />
                  </div>

                  {/* Location Row */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {biz.city}, {biz.country}
                    </span>
                  </div>

                  {/* Rating Stars & Count */}
                  <div className="flex items-center gap-1 text-xs pt-0.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => {
                        const isFilled = starIdx < Math.round(biz.rating);
                        return (
                          <Star
                            key={starIdx}
                            className={`w-3 h-3 ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 fill-slate-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="font-bold text-slate-800 ml-1 text-xs">
                      {biz.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-600 font-medium text-[11px]">
                      ({biz.reviews} reviews)
                    </span>
                  </div>

                  {/* Short Description (1-2 lines compact) */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {biz.description}
                  </p>
                </div>

                {/* Bottom Action Area - Full Card Link Footer */}
                <div className="pt-2">
                  <div className="w-full bg-slate-50 group-hover:bg-blue-50/70 rounded-xl py-2 px-3.5 flex items-center justify-between text-xs font-bold text-[#1D68F2] group-hover:text-[#1557D0] transition-all border border-slate-100 group-hover:border-blue-200">
                    <span>View Details</span>
                    <div className="w-5 h-5 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#1D68F2] group-hover:border-blue-200 transition-colors">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Dots (6 dots for 6 slides, looping infinitely) */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (idx !== currentSlide && !isAnimating) {
                      setIsAnimating(true);
                      setCurrentSlide(idx);
                    }
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-7 h-2.5 rounded-full bg-[#1D68F2] shadow-xs'
                      : 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function FeaturedBusinessesSkeleton() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-7 w-60 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-slate-200 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 space-y-3 animate-pulse"
          >
            <div className="h-36 sm:h-40 bg-slate-100 rounded-xl" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-8 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
