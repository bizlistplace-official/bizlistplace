import { INITIAL_CATEGORIES, POPULAR_COUNTRIES, ALL_GLOBAL_COUNTRIES, ICategory, IBusiness, CountryInfo } from '@bizpockethub/shared';

export const mockCategories: ICategory[] = INITIAL_CATEGORIES.map((cat, idx) => ({
  _id: `cat_${idx + 1}`,
  name: cat.name,
  slug: cat.slug,
  icon: cat.icon,
  description: cat.description,
  isActive: true,
  businessCount: 0,
  subcategories: cat.subcategories || [],
}));

const catMap = new Map<string, ICategory>();
mockCategories.forEach((c) => catMap.set(c.slug, c));

export function getCat(slug: string): ICategory {
  const cat = catMap.get(slug);
  if (cat) return cat;
  if (slug === 'legal-financial') return catMap.get('legal') || mockCategories[0];
  if (slug === 'technology-software') return catMap.get('information-technology-it-services') || mockCategories[0];
  if (slug === 'healthcare-medical') return catMap.get('healthcare') || mockCategories[0];
  if (slug === 'restaurants-hospitality') return catMap.get('restaurants') || mockCategories[0];
  if (slug === 'construction-real-estate') return catMap.get('construction') || mockCategories[0];
  if (slug === 'automotive-transport') return catMap.get('automotive') || mockCategories[0];
  if (slug === 'professional-services') return catMap.get('legal') || mockCategories[0];
  return mockCategories[0];
}

// Clean in-memory business list (all dummy/example businesses deleted, ready for real registrations)
export const mockBusinesses: IBusiness[] = [];

const KNOWN_SLUG_LOGOS: Record<string, string> = {
  'apple-park-center': '/images/logos/apple.svg',
  'best-buy-west-coast': '/images/logos/best_buy.svg',
  'harvard-university': '/images/harvard.svg',
  'massachusetts-general-hospital': '/images/mgh.svg',
  'daewoo-express': '/images/logos/daewoo_express.svg',
  'habib-bank-limited': '/images/logos/hbl.svg',
  'meezan-bank': '/images/logos/meezan.svg',
  'kfc': '/images/logos/kfc.svg',
  'jazz': '/images/logos/jazz.svg',
  'tcs-express': '/images/logos/tcs_express.svg',
  'shaukat-khanum': '/images/logos/shaukat_khanum.svg',
  'chughtai-lab': '/images/logos/chughtai_lab.svg',
  'al-fatah': '/images/logos/alfatah.svg',
  'habib-metro': '/images/logos/habib_metro.svg',
  'dry-ice': '/images/logos/dry_ice.svg',
  'orbit-grow': '/images/logos/orbit_grow.svg',
  'chiniot-pakwan': '/images/logos/chiniot_pakwan.svg',
  'khan-wood': '/images/logos/khan_wood.svg',
  'us-solar': '/images/logos/us_solar.svg',
  'web-consultants': '/images/logos/web_consultants.svg',
};

// Ensure every single business in mockBusinesses has verified countryCode and logoUrl explicitly set
mockBusinesses.forEach((b) => {
  if (!b.countryCode) {
    b.countryCode = (b.primaryLocation?.countryCode || 'PK').toUpperCase();
  }
  if (!b.logoUrl) {
    const slugMatch = Object.keys(KNOWN_SLUG_LOGOS).find((k) => b.slug.includes(k) || k.includes(b.slug));
    if (slugMatch) {
      b.logoUrl = KNOWN_SLUG_LOGOS[slugMatch];
    } else if (b.website && !b.website.includes('.demo') && !b.website.includes('example')) {
      try {
        const domain = new URL(b.website).hostname.replace(/^www\./, '');
        b.logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch {
        // fallback
      }
    }
  }
});

// Dynamically compute exact business counts for every category
mockCategories.forEach((cat) => {
  cat.businessCount = mockBusinesses.filter((b) =>
    b.categoryIds?.some((id) =>
      typeof id === 'string'
        ? id === cat._id || id === cat.slug
        : id._id === cat._id || id.slug === cat.slug
    ) ||
    b.primaryCategory?.slug === cat.slug ||
    b.primaryCategory?._id === cat._id
  ).length;
});

const popularMap = new Map<string, CountryInfo>();
POPULAR_COUNTRIES.forEach((c) => popularMap.set(c.code.toUpperCase(), c));

export const mockCountries: (CountryInfo & { flag?: string; currency?: string; phonecode?: string; isPopular?: boolean; count: number })[] =
  ALL_GLOBAL_COUNTRIES.map((gc) => {
    const pop = popularMap.get(gc.code.toUpperCase());
    const count = mockBusinesses.filter(
      (b) => (b.countryCode || b.primaryLocation?.countryCode || '').toUpperCase() === gc.code
    ).length;
    return {
      code: gc.code,
      name: gc.name,
      flag: gc.flag,
      slug: gc.slug,
      currency: gc.currency,
      phonecode: gc.phonecode,
      isPopular: Boolean(gc.isPopular),
      popularCities: pop?.popularCities || [],
      count,
    };
  });
