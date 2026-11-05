'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ICategory } from '@bizpockethub/shared';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Laptop,
  Stethoscope,
  Scale,
  Factory,
  Utensils,
  ShoppingBag,
  Car,
  Briefcase,
  GraduationCap,
  Landmark,
  FlaskConical,
  Store,
  Bus,
  Hospital,
  Home,
  Globe,
  UtensilsCrossed,
  Truck,
  Bed,
  Smartphone,
  Wheat,
  Shirt,
  PartyPopper,
  Sparkles,
  HardHat,
  Sun,
  CircleDollarSign,
  Wrench,
  Package,
  Printer,
  ShieldCheck,
  Code2,
  Plane,
  Pill,
  Dumbbell,
  Armchair,
  Megaphone,
  HeartHandshake,
  Fuel,
  Camera,
  Film,
  Search,
  X,
  Layers,
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  'bank': Landmark,
  'laboratory': FlaskConical,
  'local-shops-traders': Store,
  'information-technology-it-services': Laptop,
  'bus-companies': Bus,
  'hospital': Hospital,
  'shopping-retail-chains': ShoppingBag,
  'education': GraduationCap,
  'real-estate': Home,
  'importer-and-exporter': Globe,
  'restaurants-food-chains': UtensilsCrossed,
  'courier-cargo-companies': Truck,
  'hotels-guest-houses': Bed,
  'automotive': Car,
  'retail': ShoppingBag,
  'telecom-companies': Smartphone,
  'agriculture-dairy-livestock': Wheat,
  'apparel-textiles': Shirt,
  'banquet-halls-events': PartyPopper,
  'beauty-spa': Sparkles,
  'construction': HardHat,
  'electronics-solar-appliances': Sun,
  'finance': CircleDollarSign,
  'healthcare': Stethoscope,
  'home-services-maintenance': Wrench,
  'manufacturing-industrial': Factory,
  'kiryana-wholesale-general': Package,
  'legal': Scale,
  'printing-packaging-stationery': Printer,
  'restaurants': Utensils,
  'security-safety-surveillance': ShieldCheck,
  'technology': Code2,
  'transport-cargo-logistics': Truck,
  'travel': Plane,
  'pharmacy-medical-stores': Pill,
  'fitness-gyms-sports': Dumbbell,
  'furniture-interior-decor': Armchair,
  'cleaning-pest-control': Sparkles,
  'marketing-advertising': Megaphone,
  'pet-care-veterinary': HeartHandshake,
  'energy-petroleum': Fuel,
  'photography-videography': Camera,
  'car-rental-services': Car,
  'entertainment-media': Film,
  // Existing compatibility
  'technology-software': Laptop,
  'healthcare-medical': Stethoscope,
  'legal-financial': Scale,
  'construction-real-estate': Building2,
  'restaurants-hospitality': Utensils,
  'retail-ecommerce': ShoppingBag,
  'automotive-transport': Car,
  'professional-services': Briefcase,
  'education-training': GraduationCap,
};

// Fallback images in case an external image fails or is missing
const DEFAULT_FALLBACK_IMAGE = '/images/hero_city_day.jpg';

interface CategoriesExplorerProps {
  initialCategories: ICategory[];
}

export function CategoriesExplorer({ initialCategories }: CategoriesExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories by name, slug, description, or subcategories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return initialCategories;

    return initialCategories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(q);
      const descMatch = cat.description ? cat.description.toLowerCase().includes(q) : false;
      const subcatsMatch = Array.isArray(cat.subcategories)
        ? cat.subcategories.some((sub) => sub.toLowerCase().includes(q))
        : false;
      const slugMatch = cat.slug.toLowerCase().includes(q);

      return nameMatch || descMatch || subcatsMatch || slugMatch;
    });
  }, [initialCategories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
        {/* Real-time Filter Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter categories (e.g. Hospital, IT, Bank, Salon, Real Estate)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a56c5]/20 focus:border-[#1a56c5] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 text-[#1a56c5]" />
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredCategories.length}</strong> of{' '}
            {initialCategories.length} Categories
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No categories found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any business category matching &quot;{searchQuery}&quot;. Try searching for another industry or clear your search filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a56c5] hover:bg-[#1546a3] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
          {filteredCategories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Building2;
            const subcats = (cat as any).subcategories || [];
            const imageUrl = (cat as any).imageUrl || DEFAULT_FALLBACK_IMAGE;

            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                prefetch={true}
                className="bg-white border border-slate-200 hover:border-[#1a56c5]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
              >
                {/* Top Category Image with Floating Icon & Count Badge */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                        target.src = DEFAULT_FALLBACK_IMAGE;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle Dark Gradient Overlay for optimal contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

                  {/* Floating Glassmorphic Icon Badge */}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-[#1a56c5] flex items-center justify-center group-hover:bg-[#1a56c5] group-hover:text-white transition-all duration-300 group-hover:scale-105">
                    <Icon className="w-5 h-5 transition-colors" />
                  </div>

                  {/* Top-Right Count Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {(cat as any).businessCount ?? 0} Listed
                  </div>

                  {/* Bottom Category Name over image gradient for immediate visibility */}
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                    <h2 className="text-base font-bold text-white tracking-tight drop-shadow-sm line-clamp-1 group-hover:text-blue-200 transition-colors">
                      {cat.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cat.description || 'Verified companies, dealers, and service providers within this sector.'}
                    </p>

                    {/* Subcategories preview tags */}
                    {subcats.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap gap-1.5">
                        {subcats.slice(0, 3).map((sub: string, idx: number) => (
                          <span
                            key={`${sub}-${idx}`}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                          >
                            {sub}
                          </span>
                        ))}
                        {subcats.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-semibold self-center">
                            +{subcats.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 group-hover:text-slate-800 transition-colors">
                      Explore Listings
                    </span>
                    <span className="text-[#1a56c5] font-bold group-hover:translate-x-1 transition-all flex items-center gap-1">
                      Browse <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
