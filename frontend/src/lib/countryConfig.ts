import { POPULAR_COUNTRIES, CountryInfo } from '@bizpockethub/shared';

export interface CountryConfig {
  code: string; // 'PK', 'US', 'GB'
  routeCode: string; // 'pk', 'us', 'uk'
  slug: string; // 'pakistan', 'united-states', 'united-kingdom'
  name: string; // 'Pakistan', 'United States', 'United Kingdom'
  shortName: string; // 'Pakistan', 'USA', 'UK'
  flag: string; // '🇵🇰', '🇺🇸', '🇬🇧'
  currency: string; // 'PKR', 'USD', 'GBP'
  currencySymbol: string; // '₨', '$', '£'
  demonym: string; // 'Pakistani', 'American', 'British'
  topCities: { name: string; slug: string }[];
  hero: {
    eyebrow: string;
    headingPrefix: string;
    headingHighlight: string;
    subtitle: string;
    popularChips: { label: string; query: string }[];
  };
  intro: {
    badge: string;
    title: string;
    description: string;
  };
  stats: {
    coverageValue: string;
    coverageLabel: string;
    visitorsValue: string;
  };
  popularCategories: {
    name: string;
    slug: string;
    count: string;
  }[];
  seo: {
    title: string;
    description: string;
  };
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  pk: {
    code: 'PK',
    routeCode: 'pk',
    slug: 'pakistan',
    name: 'Pakistan',
    shortName: 'Pakistan',
    flag: '🇵🇰',
    currency: 'PKR',
    currencySymbol: '₨',
    demonym: 'Pakistani',
    topCities: [
      { name: 'Karachi', slug: 'karachi' },
      { name: 'Lahore', slug: 'lahore' },
      { name: 'Islamabad', slug: 'islamabad' },
      { name: 'Rawalpindi', slug: 'rawalpindi' },
      { name: 'Faisalabad', slug: 'faisalabad' },
      { name: 'Multan', slug: 'multan' },
      { name: 'Peshawar', slug: 'peshawar' },
      { name: 'Sialkot', slug: 'sialkot' },
      { name: 'Gujranwala', slug: 'gujranwala' },
      { name: 'Quetta', slug: 'quetta' },
      { name: 'Hyderabad', slug: 'hyderabad' },
      { name: 'Abbottabad', slug: 'abbottabad' },
    ],
    hero: {
      eyebrow: '🇵🇰 PAKISTAN BUSINESS DIRECTORY',
      headingPrefix: 'Find the Right Business in ',
      headingHighlight: 'Pakistan',
      subtitle:
        'Discover verified Pakistani companies, local shops, builders, clinics, and IT agencies across Karachi, Lahore, Islamabad, and nationwide in PKR currency.',
      popularChips: [
        { label: 'Restaurants', query: 'Restaurants' },
        { label: 'Software Houses', query: 'Software Houses' },
        { label: 'Hospitals & Clinics', query: 'Hospitals' },
        { label: 'Solar Energy', query: 'Solar' },
        { label: 'Real Estate Builders', query: 'Real Estate' },
        { label: 'Car Dealers', query: 'Automotive' },
      ],
    },
    intro: {
      badge: "Pakistan's Free Business Directory",
      title: 'What is BizListPlace Pakistan?',
      description:
        "BizListPlace is Pakistan's free business listing directory. Find verified local companies by city and categories across Pakistan, and list your business in PKR at zero cost—no fees or hidden charges.",
    },
    stats: {
      coverageValue: '36+',
      coverageLabel: 'Pakistani Cities',
      visitorsValue: '250K+',
    },
    popularCategories: [
      { name: 'Textile & Garments', slug: 'manufacturing', count: '120+' },
      { name: 'IT & Software Houses', slug: 'technology', count: '340+' },
      { name: 'Real Estate & Builders', slug: 'real-estate', count: '290+' },
      { name: 'Restaurants & Pakwan', slug: 'restaurants', count: '480+' },
      { name: 'Healthcare & Clinics', slug: 'health-medical', count: '210+' },
      { name: 'Automobile & Auto Parts', slug: 'automotive', count: '180+' },
      { name: 'Solar & Electrical', slug: 'home-services', count: '160+' },
      { name: 'Logistics & Goods', slug: 'professional-services', count: '140+' },
    ],
    seo: {
      title: 'BizListPlace Pakistan 🇵🇰 — Verified Business Directory & Local Listings (PKR)',
      description:
        'Search verified companies, shops, builders, clinics, and IT software houses across Karachi, Lahore, Islamabad, and all Pakistani cities in PKR.',
    },
  },

  us: {
    code: 'US',
    routeCode: 'us',
    slug: 'united-states',
    name: 'United States',
    shortName: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    demonym: 'American',
    topCities: [
      { name: 'New York', slug: 'new-york' },
      { name: 'Los Angeles', slug: 'los-angeles' },
      { name: 'Chicago', slug: 'chicago' },
      { name: 'Houston', slug: 'houston' },
      { name: 'Phoenix', slug: 'phoenix' },
      { name: 'Philadelphia', slug: 'philadelphia' },
      { name: 'San Antonio', slug: 'san-antonio' },
      { name: 'San Diego', slug: 'san-diego' },
      { name: 'Dallas', slug: 'dallas' },
      { name: 'Austin', slug: 'austin' },
      { name: 'San Francisco', slug: 'san-francisco' },
      { name: 'Miami', slug: 'miami' },
    ],
    hero: {
      eyebrow: '🇺🇸 UNITED STATES BUSINESS DIRECTORY',
      headingPrefix: 'Find the Right Business Across the ',
      headingHighlight: 'United States',
      subtitle:
        'Discover verified American companies, contractors, legal experts, healthcare clinics, and corporate offices across all 50 states in USD currency.',
      popularChips: [
        { label: 'Tech & SaaS', query: 'Technology' },
        { label: 'Attorneys & Law', query: 'Legal' },
        { label: 'Medical Clinics', query: 'Healthcare' },
        { label: 'General Contractors', query: 'Construction' },
        { label: 'Real Estate Agents', query: 'Real Estate' },
        { label: 'Auto Repair', query: 'Automotive' },
      ],
    },
    intro: {
      badge: "America's Free Business Directory",
      title: 'What is BizListPlace USA?',
      description:
        "BizListPlace is America's trusted business listing directory. Find verified local companies by state, city, and business categories across the US, and list your business in USD at zero cost.",
    },
    stats: {
      coverageValue: '50',
      coverageLabel: 'US States Covered',
      visitorsValue: '650K+',
    },
    popularCategories: [
      { name: 'Technology & SaaS', slug: 'technology', count: '450+' },
      { name: 'Healthcare & Medical', slug: 'health-medical', count: '380+' },
      { name: 'Legal & Attorneys', slug: 'professional-services', count: '290+' },
      { name: 'Real Estate & Mortgages', slug: 'real-estate', count: '410+' },
      { name: 'Restaurants & Dining', slug: 'restaurants', count: '520+' },
      { name: 'Construction & Roofing', slug: 'home-services', count: '310+' },
      { name: 'Auto Repair & Sales', slug: 'automotive', count: '240+' },
      { name: 'Financial Advisory', slug: 'finance', count: '190+' },
    ],
    seo: {
      title: 'BizListPlace USA 🇺🇸 — American Business Directory & Company Listings (USD)',
      description:
        'Discover top verified businesses, contractors, doctors, lawyers, and corporate offices across New York, California, Texas, and nationwide in USD.',
    },
  },

  uk: {
    code: 'GB',
    routeCode: 'uk',
    slug: 'united-kingdom',
    name: 'United Kingdom',
    shortName: 'UK',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    demonym: 'British',
    topCities: [
      { name: 'London', slug: 'london' },
      { name: 'Manchester', slug: 'manchester' },
      { name: 'Birmingham', slug: 'birmingham' },
      { name: 'Edinburgh', slug: 'edinburgh' },
      { name: 'Glasgow', slug: 'glasgow' },
      { name: 'Liverpool', slug: 'liverpool' },
      { name: 'Bristol', slug: 'bristol' },
      { name: 'Leeds', slug: 'leeds' },
      { name: 'Sheffield', slug: 'sheffield' },
      { name: 'Belfast', slug: 'belfast' },
      { name: 'Newcastle', slug: 'newcastle' },
      { name: 'Cardiff', slug: 'cardiff' },
    ],
    hero: {
      eyebrow: '🇬🇧 UNITED KINGDOM BUSINESS DIRECTORY',
      headingPrefix: 'Find the Right Business Across the ',
      headingHighlight: 'United Kingdom',
      subtitle:
        'Discover verified British enterprises, local shops, solicitors, builders, and trades across London, Manchester, Birmingham, and nationwide in GBP currency.',
      popularChips: [
        { label: 'Pubs & Dining', query: 'Restaurants' },
        { label: 'Solicitors & Legal', query: 'Legal' },
        { label: 'NHS & Private Dental', query: 'Dental' },
        { label: 'Builders & Trades', query: 'Builders' },
        { label: 'Estate Agents', query: 'Estate Agents' },
        { label: 'FinTech & Finance', query: 'Finance' },
      ],
    },
    intro: {
      badge: "UK's Free Business Directory",
      title: 'What is BizListPlace UK?',
      description:
        "BizListPlace is the United Kingdom's verified business directory. Find local companies by borough, city, and business categories across England, Scotland, Wales, and Northern Ireland, and list your business in GBP at zero cost.",
    },
    stats: {
      coverageValue: '40+',
      coverageLabel: 'UK Counties & Cities',
      visitorsValue: '400K+',
    },
    popularCategories: [
      { name: 'Financial & FinTech', slug: 'finance', count: '280+' },
      { name: 'Pubs & Restaurants', slug: 'restaurants', count: '460+' },
      { name: 'Estate Agents & Property', slug: 'real-estate', count: '320+' },
      { name: 'NHS & Private Health', slug: 'health-medical', count: '270+' },
      { name: 'Solicitors & Legal', slug: 'professional-services', count: '230+' },
      { name: 'Builders & Contractors', slug: 'home-services', count: '350+' },
      { name: 'Transport & Courier', slug: 'transportation', count: '190+' },
      { name: 'Retail & Fashion', slug: 'retail', count: '240+' },
    ],
    seo: {
      title: 'BizListPlace UK 🇬🇧 — UK Business Directory & Local Company Listings (GBP)',
      description:
        'Explore verified British companies, builders, estate agents, solicitors, and shops across London, Manchester, Birmingham, and the entire UK in GBP.',
    },
  },
};

// Aliases mapping: e.g. 'pakistan' -> 'pk', 'gb' -> 'uk', 'united-kingdom' -> 'uk', 'united-states' -> 'us'
export const COUNTRY_ALIASES: Record<string, string> = {
  pk: 'pk',
  pakistan: 'pk',
  us: 'us',
  usa: 'us',
  'united-states': 'us',
  uk: 'uk',
  gb: 'uk',
  'united-kingdom': 'uk',
};

/**
 * Resolves a CountryConfig given a route param or slug (e.g. 'pk', 'pakistan', 'us', 'uk', 'united-states')
 */
export function getCountryConfig(slugOrCode: string): CountryConfig | null {
  if (!slugOrCode) return null;
  const normalized = slugOrCode.trim().toLowerCase();
  const targetCode = COUNTRY_ALIASES[normalized] || normalized;

  if (COUNTRY_CONFIGS[targetCode]) {
    return COUNTRY_CONFIGS[targetCode];
  }

  // Fallback to checking POPULAR_COUNTRIES for any other international country
  const matched = POPULAR_COUNTRIES.find(
    (c) => c.slug.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );

  if (!matched) return null;

  return {
    code: matched.code,
    routeCode: matched.code.toLowerCase(),
    slug: matched.slug,
    name: matched.name,
    shortName: matched.name,
    flag: '🌐',
    currency: 'USD',
    currencySymbol: '$',
    demonym: matched.name,
    topCities: (matched.popularCities || []).map((ct) => ({
      name: ct.name,
      slug: ct.slug,
    })),
    hero: {
      eyebrow: `🌐 ${matched.name.toUpperCase()} BUSINESS DIRECTORY`,
      headingPrefix: 'Find the Right Business in ',
      headingHighlight: matched.name,
      subtitle: `Discover verified businesses, local suppliers, and service providers across ${matched.name} and worldwide.`,
      popularChips: [
        { label: 'Restaurants', query: 'Restaurants' },
        { label: 'Healthcare', query: 'Healthcare' },
        { label: 'Hotels', query: 'Hotels' },
        { label: 'Retail', query: 'Retail' },
        { label: 'Services', query: 'Services' },
      ],
    },
    intro: {
      badge: `${matched.name}'s Free Business Directory`,
      title: `What is BizListPlace ${matched.name}?`,
      description: `BizListPlace is ${matched.name}'s verified business listing directory. Find local companies and corporate branches across ${matched.name}, and list your business at zero cost.`,
    },
    stats: {
      coverageValue: `${matched.popularCities?.length || 10}+`,
      coverageLabel: 'Cities Covered',
      visitorsValue: '100K+',
    },
    popularCategories: [
      { name: 'Technology', slug: 'technology', count: '100+' },
      { name: 'Healthcare', slug: 'health-medical', count: '80+' },
      { name: 'Restaurants', slug: 'restaurants', count: '150+' },
      { name: 'Real Estate', slug: 'real-estate', count: '90+' },
    ],
    seo: {
      title: `BizListPlace ${matched.name} — Verified Business Directory & Local Listings`,
      description: `Find top verified companies, contractors, local shops, and services in ${matched.name} on BizListPlace.`,
    },
  };
}
