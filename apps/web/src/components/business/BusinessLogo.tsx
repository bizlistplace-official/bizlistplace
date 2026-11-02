'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

export const KNOWN_BRAND_LOGOS: Record<string, string> = {
  'apple-park-center': '/images/logos/apple.svg',
  'apple': '/images/logos/apple.svg',
  'best-buy-west-coast': '/images/logos/best_buy.svg',
  'best-buy': '/images/logos/best_buy.svg',
  'harvard-university': '/images/harvard.svg',
  'harvard': '/images/harvard.svg',
  'massachusetts-general-hospital': '/images/mgh.svg',
  'mgh': '/images/mgh.svg',
  'daewoo-express': '/images/logos/daewoo_express.svg',
  'daewoo': '/images/logos/daewoo_express.svg',
  'habib-bank-limited': '/images/logos/hbl.svg',
  'hbl': '/images/logos/hbl.svg',
  'meezan-bank': '/images/logos/meezan.svg',
  'meezan': '/images/logos/meezan.svg',
  'kfc': '/images/logos/kfc.svg',
  'jazz': '/images/logos/jazz.svg',
  'tcs-express': '/images/logos/tcs_express.svg',
  'tcs': '/images/logos/tcs_express.svg',
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

// Deterministic gradient palettes for fallback monograms
const GRADIENT_PALETTES = [
  'from-blue-600 to-indigo-700 text-white',
  'from-teal-600 to-emerald-700 text-white',
  'from-slate-800 to-slate-950 text-white',
  'from-rose-600 to-red-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-purple-600 to-violet-800 text-white',
  'from-cyan-600 to-blue-700 text-white',
];

export function resolveLogoUrl(business: {
  slug?: string;
  logoUrl?: string;
  website?: string;
  name?: string;
}): string | null {
  if (business.logoUrl && business.logoUrl.trim().length > 0) {
    return business.logoUrl;
  }

  const slug = (business.slug || '').toLowerCase();
  for (const [key, path] of Object.entries(KNOWN_BRAND_LOGOS)) {
    if (slug === key || slug.includes(key)) {
      return path;
    }
  }

  const name = (business.name || '').toLowerCase();
  for (const [key, path] of Object.entries(KNOWN_BRAND_LOGOS)) {
    if (name.includes(key.replace(/-/g, ' '))) {
      return path;
    }
  }

  if (business.website) {
    try {
      const url = new URL(business.website);
      const host = url.hostname.replace(/^www\./, '');
      if (
        host &&
        !host.includes('example') &&
        !host.includes('.demo') &&
        !host.includes('localhost')
      ) {
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
      }
    } catch {
      // invalid URL
    }
  }

  return null;
}

export function getInitials(name: string): string {
  if (!name) return 'BL';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface BusinessLogoProps {
  business: {
    name: string;
    slug?: string;
    logoUrl?: string;
    website?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  roundedClassName?: string;
}

const SIZE_STYLES = {
  sm: {
    container: 'w-8 h-8 min-w-[32px] rounded-lg text-xs',
    img: 32,
    icon: 'w-4 h-4',
  },
  md: {
    container: 'w-12 h-12 min-w-[48px] rounded-xl text-sm',
    img: 48,
    icon: 'w-6 h-6',
  },
  lg: {
    container: 'w-16 h-16 min-w-[64px] rounded-2xl text-lg',
    img: 64,
    icon: 'w-8 h-8',
  },
  xl: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 min-w-[80px] sm:min-w-[96px] rounded-2xl sm:rounded-3xl text-xl sm:text-2xl',
    img: 96,
    icon: 'w-10 h-10',
  },
};

export function BusinessLogo({
  business,
  size = 'md',
  className = '',
  roundedClassName,
}: BusinessLogoProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveLogoUrl(business);

  const sizeCfg = SIZE_STYLES[size] || SIZE_STYLES.md;
  const rounded = roundedClassName || sizeCfg.container.split(' ').find((c) => c.startsWith('rounded-')) || 'rounded-xl';

  // Compute deterministic gradient for fallback
  let hash = 0;
  for (let i = 0; i < (business.name || '').length; i++) {
    hash = (hash << 5) - hash + business.name.charCodeAt(i);
    hash |= 0;
  }
  const palette = GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length];
  const initials = getInitials(business.name);

  if (resolvedUrl && !imgError) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-white border border-slate-200/90 shadow-2xs ${sizeCfg.container} ${rounded} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={`${business.name} logo`}
          className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Stylish fallback monogram
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${palette} font-extrabold tracking-wider shadow-2xs select-none border border-white/20 ${sizeCfg.container} ${rounded} ${className}`}
      title={business.name}
    >
      <span>{initials}</span>
    </div>
  );
}
