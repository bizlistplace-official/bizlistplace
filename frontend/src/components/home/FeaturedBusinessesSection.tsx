'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IBusiness, ICategory } from '@bizpockethub/shared';
import { CategoryFilterList } from '@/components/business/CategoryFilterList';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import {
  Star,
  MapPin,
  ArrowRight,
  Plus,
  Building2,
  ExternalLink,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface FeaturedBusinessesSectionProps {
  initialBusinesses: IBusiness[];
  categories: ICategory[];
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  bank: '/images/biz_tech.jpg',
  laboratory: '/images/biz_hospital.jpg',
  hospital: '/images/biz_hospital.jpg',
  'bus-companies': '/images/biz_auto.jpg',
  'shopping-retail-chains': '/images/biz_fashion.jpg',
  'courier-cargo-companies': '/images/biz_auto.jpg',
  'restaurants-food-chains': '/images/biz_coffee.jpg',
  'telecom-companies': '/images/biz_tech.jpg',
  'hotels-guest-houses': '/images/biz_coffee.jpg',
  education: '/images/biz_tech.jpg',
  'information-technology-it-services': '/images/biz_tech.jpg',
  automotive: '/images/biz_auto.jpg',
  'apparel-textiles': '/images/biz_fashion.jpg',
  'real-estate': '/images/biz_tech.jpg',
  'electronics-solar-appliances': '/images/biz_tech.jpg',
  'beauty-spa': '/images/biz_fashion.jpg',
  travel: '/images/biz_auto.jpg',
  restaurants: '/images/biz_coffee.jpg',
  healthcare: '/images/biz_hospital.jpg',
  construction: '/images/biz_tech.jpg',
  technology: '/images/biz_tech.jpg',
  'technology-software': '/images/biz_tech.jpg',
  'legal-financial': '/images/biz_tech.jpg',
  legal: '/images/biz_tech.jpg',
};

function getBusinessImage(biz: IBusiness): string {
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
  return '/images/biz_tech.jpg';
}

export function FeaturedBusinessesSection({
  initialBusinesses,
  categories,
}: FeaturedBusinessesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredBusinesses = useMemo(() => {
    if (!selectedCategory) {
      return initialBusinesses;
    }
    return initialBusinesses.filter((b) => {
      const matchPrimary =
        b.primaryCategory?.slug === selectedCategory ||
        b.primaryCategory?._id === selectedCategory;
      const matchCategoryIds = b.categoryIds?.some((id) =>
        typeof id === 'string'
          ? id === selectedCategory
          : id.slug === selectedCategory || id._id === selectedCategory
      );
      return matchPrimary || matchCategoryIds;
    });
  }, [initialBusinesses, selectedCategory]);

  const currentCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1D68F2] text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Verified Directory
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Businesses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover verified companies, chains, and service branches across Pakistan & worldwide
          </p>
        </div>
        <Link
          href="/search"
          className="text-xs sm:text-sm font-semibold text-[#1D68F2] hover:text-[#1557D0] flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <span>View All in Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Left Filter Listings Sidebar + Right Businesses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Filter Listings Sidebar matching screenshot */}
        <div className="lg:col-span-4 xl:col-span-3.5 w-full">
          <CategoryFilterList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            maxHeight="max-h-[580px]"
          />
        </div>

        {/* Right Column: Business Cards List */}
        <div className="lg:col-span-8 xl:col-span-8.5 w-full space-y-4">
          {/* Active Filter State Bar */}
          <div className="bg-white rounded-2xl px-5 py-3 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <span>Showing:</span>
              <span className="text-[#0D6559] bg-[#EAF8F5] px-2.5 py-0.5 rounded-full font-bold">
                {currentCategoryObj ? currentCategoryObj.name : 'All Categories'}
              </span>
              <span className="text-slate-400 font-normal">
                ({filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'})
              </span>
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-medium"
              >
                Clear filter &times;
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.slice(0, 9).map((biz) => {
                const img = getBusinessImage(biz);
                const city = biz.primaryLocation?.city || 'Pakistan';
                const country = biz.primaryLocation?.countryName || biz.primaryLocation?.countryCode || 'PK';
                const catName = biz.primaryCategory?.name || 'General Business';

                return (
                  <Link
                    key={biz._id || biz.slug}
                    href={`/business/${biz.slug}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col group cursor-pointer"
                  >
                    {/* Card Image + Badge */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={img}
                        alt={biz.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="bg-[#1D68F2] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm">
                          Verified
                        </span>
                        {biz.isFeatured && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Brand Logo (Bottom Right) */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <BusinessLogo business={biz} size="sm" className="shadow-md bg-white border-2 border-white rounded-lg" />
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm text-slate-900 leading-snug truncate group-hover:text-[#1D68F2] transition-colors">
                        {biz.name}
                      </h3>

                      {/* Category line */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                        <span className="text-[#0D6559] bg-[#EAF8F5] px-2 py-0.5 rounded text-[11px] font-medium truncate">
                          {catName}
                        </span>
                      </div>

                      {/* Location line */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {city}, {country}
                        </span>
                      </div>

                      {/* Rating line */}
                      <div className="flex items-center gap-1.5 text-xs mt-2 font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">
                          {biz.ratingAverage ? biz.ratingAverage.toFixed(1) : '4.8'}
                        </span>
                        <span className="text-slate-400 font-medium">
                          ({biz.reviewCount || 15} reviews)
                        </span>
                      </div>

                      {/* View Details Button */}
                      <div className="mt-4 pt-3 border-t border-slate-50">
                        <div className="block w-full py-1.5 px-3 text-center text-xs font-semibold text-[#1D68F2] border border-blue-200 group-hover:bg-blue-50/70 rounded-xl transition-colors">
                          View Details &rarr;
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                No listings in {currentCategoryObj?.name} yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Be the first accredited provider or business branch to list in this category.
              </p>
              <div className="pt-2">
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  + Add Business in {currentCategoryObj?.name}
                </Link>
              </div>
            </div>
          )}

          {/* Bottom link to view more in directory */}
          {filteredBusinesses.length > 9 && (
            <div className="text-center pt-2">
              <Link
                href={
                  selectedCategory
                    ? `/search?category=${encodeURIComponent(selectedCategory)}`
                    : '/search'
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D68F2] hover:underline"
              >
                <span>View all {filteredBusinesses.length} listings in {currentCategoryObj ? currentCategoryObj.name : 'Directory'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
