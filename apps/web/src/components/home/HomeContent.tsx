import React, { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SearchHero } from '@/components/search/SearchHero';
import {
  FeaturedBusinessesSlider,
  FeaturedBusinessesSkeleton,
} from '@/components/home/FeaturedBusinessesSlider';
import { fetchApi } from '@/lib/api';
import { CountryConfig } from '@/lib/countryConfig';
import { IBusiness } from '@bizpockethub/shared';
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  Star,
  Zap,
  Globe,
  Headphones,
  UtensilsCrossed,
  Plus,
  ShoppingBag,
  GraduationCap,
  Car,
  Home,
  Plane,
  Laptop,
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const FaqSection = dynamic(
  () => import('@/components/home/FaqSection').then((mod) => mod.FaqSection),
  {
    loading: () => <div className="min-h-[200px]" />,
  }
);

const BROWSE_CATEGORIES = [
  {
    name: 'Restaurants & Food',
    slug: 'restaurants-hospitality',
    icon: <UtensilsCrossed className="w-7 h-7 text-orange-600" />,
    circleBg: 'bg-orange-100',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare-medical',
    icon: <Plus className="w-7 h-7 text-emerald-600 stroke-[3]" />,
    circleBg: 'bg-emerald-100',
  },
  {
    name: 'Shopping & Retail',
    slug: 'retail-ecommerce',
    icon: <ShoppingBag className="w-7 h-7 text-pink-600" />,
    circleBg: 'bg-pink-100',
  },
  {
    name: 'Education',
    slug: 'education-training',
    icon: <GraduationCap className="w-7 h-7 text-purple-600" />,
    circleBg: 'bg-purple-100',
  },
  {
    name: 'Automotive',
    slug: 'automotive-transport',
    icon: <Car className="w-7 h-7 text-blue-600" />,
    circleBg: 'bg-blue-100',
  },
  {
    name: 'Real Estate',
    slug: 'construction-real-estate',
    icon: <Home className="w-7 h-7 text-teal-600" />,
    circleBg: 'bg-teal-100',
  },
  {
    name: 'Travel & Tourism',
    slug: 'restaurants-hospitality',
    icon: <Plane className="w-7 h-7 text-sky-600" />,
    circleBg: 'bg-sky-100',
  },
  {
    name: 'IT & Technology',
    slug: 'technology-software',
    icon: <Laptop className="w-7 h-7 text-indigo-600" />,
    circleBg: 'bg-indigo-100',
  },
];

async function LiveStatsNumber({ countryCode }: { countryCode?: string }) {
  const query = countryCode ? `?country=${encodeURIComponent(countryCode)}&limit=1` : '?limit=1';
  const businessesRes = await fetchApi<{ total: number }>(`/businesses${query}`);
  const total = typeof (businessesRes as any)?.total === 'number'
    ? (businessesRes as any).total
    : Array.isArray((businessesRes as any)?.data)
    ? (businessesRes as any).data.length
    : 0;
  return <>{total}</>;
}

async function FeaturedBusinessesSection({ country }: { country?: CountryConfig }) {
  if (country) {
    const featuredUrl = `/businesses/featured?country=${encodeURIComponent(country.code)}`;
    const countryFeatured = await fetchApi<IBusiness[]>(featuredUrl);

    // If featured listings exist for this country, use them immediately without querying all businesses
    if (countryFeatured.data && countryFeatured.data.length > 0) {
      return <FeaturedBusinessesSlider initialBusinesses={countryFeatured.data} country={country} />;
    }

    // Fallback: only fetch standard listings if no featured businesses exist for this country
    const countryAll = await fetchApi<{ total: number; data?: IBusiness[] }>(
      `/businesses?country=${encodeURIComponent(country.code)}&limit=36`
    );
    const fallbackBusinesses: IBusiness[] = (countryAll as any)?.data || [];

    return <FeaturedBusinessesSlider initialBusinesses={fallbackBusinesses} country={country} />;
  }

  const featuredRes = await fetchApi<IBusiness[]>('/businesses/featured');

  // If featured listings exist globally, use them immediately without querying all businesses
  if (featuredRes.data && featuredRes.data.length > 0) {
    return <FeaturedBusinessesSlider initialBusinesses={featuredRes.data} />;
  }

  // Fallback: only fetch standard listings if no featured businesses exist globally
  const businessesRes = await fetchApi<{ total: number; data?: IBusiness[] }>('/businesses?limit=36');
  const allListingBusinesses: IBusiness[] = (businessesRes as any)?.data || [];

  return <FeaturedBusinessesSlider initialBusinesses={allListingBusinesses} />;
}

interface HomeContentProps {
  country?: CountryConfig;
}

export function HomeContent({ country }: HomeContentProps) {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 pb-16 overflow-x-hidden">
      {/* 1. Hero Search Section */}
      <SearchHero country={country} />

      {/* 2. Floating Stats / Trust Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-slate-100 p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:divide-x divide-slate-100">
          {/* Stat 1: Real Businesses Listed */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pl-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                <Suspense fallback={<span>0</span>}>
                  <LiveStatsNumber countryCode={country?.code} />
                </Suspense>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {country ? `${country.shortName} Businesses` : 'Businesses Listed'}
              </div>
            </div>
          </div>

          {/* Stat 2: Coverage (Cities / Countries) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pl-0 lg:pl-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 fill-[#1D68F2]/20" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {country ? country.stats.coverageValue : '195+'}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {country ? country.stats.coverageLabel : 'Countries & Regions'}
              </div>
            </div>
          </div>

          {/* Stat 3: Monthly Visitors */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pl-0 lg:pl-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {country ? country.stats.visitorsValue : '1M+'}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Monthly Visitors
              </div>
            </div>
          </div>

          {/* Stat 4: Trusted & Verified Listings */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pl-0 lg:pl-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {country ? `${country.currency} (${country.currencySymbol})` : 'Trusted'}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {country ? 'Local Pricing & Currency' : '& Verified Listings'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Businesses Section with React Suspense Streaming */}
      <Suspense fallback={<FeaturedBusinessesSkeleton />}>
        <FeaturedBusinessesSection country={country} />
      </Suspense>

      {/* 3.2. Country-Specific Top Cities Section (Shown on country homepages) */}
      {country && country.topCities && country.topCities.length > 0 && (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-14 sm:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1D68F2] text-xs font-bold uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {country.name} Cities &amp; Locations
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Cities in {country.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore verified businesses, shops, and services in major {country.demonym} cities
              </p>
            </div>
            <Link
              href={`/search?country=${encodeURIComponent(country.code)}`}
              className="text-xs sm:text-sm font-semibold text-[#1D68F2] hover:text-[#1557D0] flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View All {country.shortName} Cities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {country.topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${country.routeCode}/${city.slug}`}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#1D68F2] transition-colors truncate">
                    {city.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {country.shortName}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3.5. What is Biz List Place? Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-14 sm:mt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-8">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0f4bc0] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              {country?.intro.badge || "Pakistan's Free Business Directory"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {country?.intro.title || 'What is Biz List Place?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed max-w-3xl">
              {country ? (
                <>
                  {country.intro.description} Find top local services by city and category in {country.name}, and list your company in {country.currency} ({country.currencySymbol}) at zero cost.
                </>
              ) : (
                <>
                  Biz List Place is Pakistan's free{' '}
                  <Link href="/search" className="text-[#1D68F2] font-semibold hover:underline">
                    business listing directory
                  </Link>
                  . Find local businesses by city and{' '}
                  <Link href="/categories" className="text-[#1D68F2] font-semibold hover:underline">
                    business categories in Pakistan
                  </Link>
                  , and list your own business at no cost—no fees, no credit card required.
                </>
              )}
            </p>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1: Search & Discover */}
            <div className="bg-[#FAFBFD] rounded-2xl p-4.5 border border-slate-100 hover:border-blue-200 transition-colors space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Search &amp; Discover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {country
                  ? `Find ${country.demonym} restaurants, clinics, shops, and services.`
                  : 'Find restaurants, clinics, shops, and services by category and city.'}
              </p>
            </div>

            {/* Feature 2: Browse by Location */}
            <div className="bg-[#FAFBFD] rounded-2xl p-4.5 border border-slate-100 hover:border-blue-200 transition-colors space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Browse by Location</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {country
                  ? `${country.topCities.slice(0, 3).map((c) => c.name).join(', ')} and nationwide.`
                  : 'Karachi, Lahore, Islamabad, and more—find businesses near you.'}
              </p>
            </div>

            {/* Feature 3: Free Listings */}
            <div className="bg-[#FAFBFD] rounded-2xl p-4.5 border border-slate-100 hover:border-blue-200 transition-colors space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Free Listings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {country
                  ? `List in ${country.currency} (${country.currencySymbol}) with zero fees or commissions.`
                  : 'Contact details, address, website—all visible to customers.'}
              </p>
            </div>

            {/* Feature 4: 100% Free - No Cost */}
            <div className="bg-[#FAFBFD] rounded-2xl p-4.5 border border-slate-100 hover:border-blue-200 transition-colors space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">100% Free - No Cost</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Free to list and free to search. No credit card required.
              </p>
            </div>
          </div>

          {/* Narrative Paragraphs */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
            <p>
              Whether you run a local business in {country ? country.topCities[0]?.name || country.name : 'Lahore'}, an office in {country ? country.topCities[1]?.name || country.name : 'Karachi'}, or an online service, you can{' '}
              <Link
                href={country ? `/add-business?country=${country.code}` : '/add-business'}
                className="text-[#1D68F2] font-semibold hover:underline"
              >
                add your business free
              </Link>{' '}
              and reach high-intent customers. Our directory helps people find local businesses by city and category, read reviews, and get contact details in one place.
            </p>
            <p>
              {country ? (
                <>
                  We cover major cities across {country.name} including{' '}
                  {country.topCities.map((c) => c.name).join(', ')}, as well as regional towns. Browse by categories or use our real-time search bar to filter by city, neighborhood, and keyword.
                </>
              ) : (
                <>
                  We cover major cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta, as well as many smaller towns across the country. Browse by{' '}
                  <Link href="/categories" className="text-[#1D68F2] font-semibold hover:underline">
                    business categories in Pakistan
                  </Link>{' '}
                  or use the search bar to find a specific business or service.
                </>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={country ? `/add-business?country=${country.code}` : '/add-business'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your Business Free</span>
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Browse by Category Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-14 sm:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {country ? `Popular Categories in ${country.name}` : 'Browse by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {country
                ? `Explore ${country.demonym} businesses and services in your preferred category`
                : 'Explore businesses and services in your preferred category'}
            </p>
          </div>
          <Link
            href="/categories"
            prefetch={true}
            className="text-xs sm:text-sm font-semibold text-[#1D68F2] hover:text-[#1557D0] flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Category Cards - 4 columns x 2 rows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5 w-full justify-center">
          {BROWSE_CATEGORIES.map((cat) => {
            const catHref = country
              ? `/search?country=${encodeURIComponent(country.code)}&category=${encodeURIComponent(cat.slug)}`
              : `/categories/${cat.slug}`;

            return (
              <Link
                key={cat.name}
                href={catHref}
                prefetch={true}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center mb-3.5 sm:mb-4 ${cat.circleBg} transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                >
                  {cat.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1D68F2] transition-colors leading-snug">
                  {cat.name}
                </h3>
                {country && (
                  <span className="text-[11px] text-slate-400 font-medium mt-1">
                    in {country.shortName}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4.5. Join the Revolution CTA Banner Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-14 sm:mt-16">
        <div className="relative bg-white rounded-3xl sm:rounded-[36px] p-8 sm:p-14 border border-slate-100 shadow-[0_12px_45px_rgba(0,0,0,0.04)] text-center overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F7F2] border border-[#B3E8D7] text-[#006644] text-xs sm:text-sm font-semibold mb-4 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-50 stroke-[2.2]" />
            <span>Ready to Get Started?</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-50 stroke-[2.2]" />
          </div>

          {/* Heading */}
          <h2 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Join the{' '}
            <span className="bg-gradient-to-r from-[#009270] via-[#059669] to-[#7C3AED] bg-clip-text text-transparent">
              {country ? `${country.name} Directory` : 'Revolution'}
            </span>
          </h2>

          {/* Description */}
          <p className="relative z-10 text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3 mb-8 leading-relaxed">
            {country
              ? `Search for businesses in ${country.name} or add your business free. Connect with local buyers in ${country.currency} (${country.currencySymbol}).`
              : 'Search for businesses in Pakistan & worldwide or add your business free. No credit card, no fees.'}
          </p>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              href={country ? `/add-business?country=${country.code}` : '/add-business'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              <Building2 className="w-5 h-5 text-white" />
              <span>List Your Business FREE</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
            <Link
              href={country ? `/search?country=${encodeURIComponent(country.code)}` : '/search'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#A3E3D1] hover:border-[#6EE7B7] text-slate-900 font-bold text-sm sm:text-base transition-all duration-200 active:scale-[0.99]"
            >
              <Search className="w-5 h-5 text-slate-800" />
              <span>Explore {country ? `${country.shortName} Businesses` : 'Businesses'}</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs sm:text-sm text-slate-500 font-medium pt-2 border-t border-slate-100/80">
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>100% Free</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Instant Approval</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{country ? `${country.name} Coverage` : 'Global Reach'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us? Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading + Description */}
            <div className="lg:col-span-4 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Why Choose Us?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
                {country
                  ? `We make it easy to find and connect with the right businesses across ${country.name} and worldwide.`
                  : 'We make it easy to find and connect with the right businesses, anywhere in the world.'}
              </p>
            </div>

            {/* Right Column: 4 Features */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Verified Listings */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  Verified Listings
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Trustworthy and genuine businesses only
                </p>
              </div>

              {/* Feature 2: Fast & Easy Search */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                  <Zap className="w-5 h-5 stroke-[2.2] fill-[#1D68F2]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  Fast &amp; Easy Search
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Find what you need in seconds
                </p>
              </div>

              {/* Feature 3: Coverage */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                  <Globe className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {country ? `${country.shortName} Coverage` : 'Global Coverage'}
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  {country ? `${country.stats.coverageValue} ${country.stats.coverageLabel}` : 'Businesses in 195+ countries'}
                </p>
              </div>

              {/* Feature 4: 24/7 Support */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                  <Headphones className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  24/7 Support
                </h3>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  We&apos;re always here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Got Questions? Frequently Asked Questions Section */}
      <FaqSection country={country} />
    </div>
  );
}
