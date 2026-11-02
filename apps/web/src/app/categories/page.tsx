import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { ICategory, INITIAL_CATEGORIES } from '@bizpockethub/shared';
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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Business Categories | Biz List Place',
  description: 'Explore all 34+ verified business categories and industry sectors across Pakistan and worldwide on Biz List Place.',
};

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

// Use ISR (Incremental Static Regeneration) to serve pre-rendered HTML instantly
export const revalidate = 300;

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-2/3 bg-slate-100 rounded" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-12 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CategoriesList() {
  const res = await fetchApi<ICategory[]>('/categories');
  const categories = res.data || INITIAL_CATEGORIES;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
      {categories.map((cat) => {
        const Icon = categoryIcons[cat.slug] || Building2;
        const subcats = (cat as any).subcategories || [];

        return (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            prefetch={true}
            className="bg-white border border-slate-200 hover:border-[#1a56c5]/50 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1a56c5] flex items-center justify-center group-hover:bg-[#1a56c5] group-hover:text-white transition-all duration-200 group-hover:scale-105 shadow-xs">
                <Icon className="w-6 h-6 text-[#1a56c5] group-hover:text-white transition-colors duration-200" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-[#1a56c5] transition-colors leading-snug">
                  {cat.name}
                </h2>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                  {cat.description || 'Verified companies and providers within this sector.'}
                </p>
              </div>

              {/* Subcategories preview tags */}
              {subcats.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {subcats.slice(0, 3).map((sub: string, idx: number) => (
                    <span
                      key={`${sub}-${idx}`}
                      className="text-[11px] font-medium bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {sub}
                    </span>
                  ))}
                  {subcats.length > 3 && (
                    <span className="text-[10px] text-slate-600 font-semibold self-center">
                      +{subcats.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#1a56c5] bg-blue-50 px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                {(cat as any).businessCount ?? 0} Listed
              </span>
              <span className="text-slate-900 group-hover:text-[#1a56c5] group-hover:translate-x-1 transition-all">
                Browse &rarr;
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      {/* Centered Header with Equal Left and Right Spacing */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1a56c5] text-xs font-bold tracking-wide uppercase shadow-xs">
          Comprehensive Directory
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore All Business Categories
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Find accredited companies, suppliers, contractors, retail outlets, and service providers
          categorized by their primary industry sector across Pakistan and worldwide.
        </p>
      </div>

      {/* Categories Grid streamed with Suspense */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesList />
      </Suspense>
    </div>
  );
}
