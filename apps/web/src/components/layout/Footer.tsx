'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Globe2, ShieldCheck } from 'lucide-react';
import { POPULAR_COUNTRIES } from '@bizpockethub/shared';
import { useAuth } from '@/lib/authContext';

const FooterParticles = dynamic(
  () => import('./FooterParticles').then((mod) => mod.FooterParticles),
  { loading: () => null }
);

export function Footer() {
  const { user } = useAuth();
  const accountHref = user ? '/dashboard' : '/login';

  return (
    <footer className="relative bg-slate-950 text-slate-400 text-sm border-t border-slate-900 mt-20 overflow-hidden">
      {/* Animated Floating Particles in rgb(29, 104, 242) */}
      <FooterParticles />

      {/* Subtle Ambient Radial Glow in rgb(29, 104, 242) */}
      <div className="absolute -top-32 left-1/3 w-[500px] h-[300px] bg-[rgba(29,104,242,0.08)] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 right-10 w-[400px] h-[250px] bg-[rgba(29,104,242,0.05)] rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-10 h-10 min-w-10 min-h-10 rounded-xl overflow-hidden shadow-md shadow-[#1D68F2]/25 group-hover:shadow-[0_0_18px_rgba(29,104,242,0.6)] transition-all duration-300 border border-blue-400/20 bg-white flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/apple-touch-icon.png"
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-extrabold tracking-tight text-white leading-tight group-hover:text-slate-100 transition-colors font-jakarta">
                  BizListPlace<span className="text-[#1D68F2]">.com</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wide group-hover:text-[#1D68F2] transition-colors font-jakarta">
                  Find. Connect. Grow.
                </span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs sm:text-sm">
              The worldwide verified business directory platform. Connecting verified suppliers,
              manufacturers, agencies, and enterprise service providers across 190+ countries.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 hover:text-[rgb(29,104,242)] transition-colors cursor-default">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Moderated Listings
              </span>
              <span className="flex items-center gap-1.5 hover:text-[rgb(29,104,242)] transition-colors cursor-default">
                <Globe2 className="w-4 h-4 text-[rgb(29,104,242)]" />
                Global Presence
              </span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <span>Directory</span>
            </h2>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/search"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Search Businesses</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Browse Categories</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/add-business"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Add a Business</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/claim-business"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Claim Your Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  href={accountHref}
                  suppressHydrationWarning
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>My Account</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Regions */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Top Regions</h2>
            <ul className="space-y-2.5 text-xs">
              {POPULAR_COUNTRIES.slice(0, 5).map((country) => (
                <li key={country.code}>
                  <Link
                    href={`/countries/${country.slug}`}
                    className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                  >
                    <span>{country.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h2>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>About Biz List Place</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Contact Support</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-slate-400 hover:text-[rgb(29,104,242)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200"
                >
                  <span>Sitemap</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar / Copyright Bar at the very bottom with background color rgb(29 104 242) */}
      <div className="relative z-10 w-full bg-[rgb(29,104,242)] border-t border-blue-400/30 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-center sm:text-left">
          <p className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-white font-medium">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-extrabold text-white tracking-wide font-jakarta">BizListPlace.com</span>
            <span className="text-white/90">•</span>
            <span className="text-white font-medium">All rights reserved. International Business Directory.</span>
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 text-xs sm:text-sm text-white font-medium tracking-wide">
            <span className="w-6 h-[2px] bg-white/70 rounded-full hidden sm:inline-block" />
            <span className="text-white">Built for authentic global discovery &amp; verified trade</span>
            <span className="w-6 h-[2px] bg-white/70 rounded-full hidden sm:inline-block" />
          </div>
        </div>
      </div>
    </footer>
  );
}
