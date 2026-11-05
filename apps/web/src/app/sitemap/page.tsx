import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  Building2,
  LayoutGrid,
  Globe2,
  PlusCircle,
  ShieldCheck,
  User,
  HelpCircle,
  Mail,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { POPULAR_COUNTRIES } from '@bizpockethub/shared';

export const metadata: Metadata = {
  title: 'Sitemap — Full Directory & Site Index | BizListPlace.com',
  description:
    'Explore the complete directory structure and sitemap of BizListPlace.com. Find business listings, industrial categories, regional portals, and account resources.',
};

export default function SitemapPage() {
  const sections = [
    {
      title: 'Directory & Discovery',
      description: 'Explore verified companies, regional branches, and categorized industry hubs.',
      icon: Search,
      iconColor: 'bg-blue-50 text-[#1D68F2] border-blue-100',
      links: [
        { label: 'Search Businesses', href: '/search', desc: 'Find verified suppliers, contractors, and agencies worldwide' },
        { label: 'Browse Categories', href: '/categories', desc: 'Explore all commercial and industrial sectors' },
        { label: 'Global Locations', href: '/countries', desc: 'Directory index of 190+ countries and regional hubs' },
        { label: 'Pakistan Directory', href: '/pk', desc: 'Verified businesses across Karachi, Lahore, Islamabad, and more' },
        { label: 'United Kingdom Directory', href: '/uk', desc: 'UK enterprise listings, manufacturers, and service providers' },
        { label: 'United States Directory', href: '/us', desc: 'USA nationwide commercial directory and verified entities' },
      ],
    },
    {
      title: 'Business Owners & Vendors',
      description: 'Publish, verify, and manage your commercial listings and physical branch locations.',
      icon: Building2,
      iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      links: [
        { label: 'Add Your Business', href: '/add-business', desc: 'Submit a new company profile to the moderated directory' },
        { label: 'Claim Your Profile', href: '/claim-business', desc: 'Verify ownership of an existing listed entity' },
        { label: 'Owner Dashboard', href: '/dashboard', desc: 'Manage your listings, branches, analytics, and reviews' },
      ],
    },
    {
      title: 'Account & Membership',
      description: 'Access your account credentials, listing preferences, and authentication portal.',
      icon: User,
      iconColor: 'bg-purple-50 text-purple-600 border-purple-100',
      links: [
        { label: 'Log In to My Account', href: '/login', desc: 'Access your saved listings and business dashboard' },
        { label: 'Create Free Account', href: '/register', desc: 'Join BizListPlace as a buyer or business owner' },
        { label: 'Password Recovery', href: '/forgot-password', desc: 'Reset your password securely via email' },
      ],
    },
    {
      title: 'Company & Support',
      description: 'Get in touch with directory moderators, view guides, and review platform policies.',
      icon: FileText,
      iconColor: 'bg-amber-50 text-amber-600 border-amber-100',
      links: [
        { label: 'About BizListPlace', href: '/about', desc: 'Our mission for verified international trade' },
        { label: 'Contact Support', href: '/contact', desc: 'Get assistance with listings, verification, or inquiries' },
        { label: 'Help Center & FAQs', href: '/help', desc: 'Frequently asked questions regarding listing badges' },
        { label: 'Privacy Policy', href: '/privacy', desc: 'How we respect and protect your business data' },
        { label: 'Terms of Service', href: '/terms', desc: 'Directory usage terms, guidelines, and policies' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumbs items={[{ label: 'Sitemap' }]} />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1D68F2] text-xs font-bold border border-blue-200">
            <Compass className="w-3.5 h-3.5" />
            Platform Index
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
            Website Sitemap
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
            Quickly navigate all sections, regional directories, business management portals, and
            support resources on BizListPlace.com.
          </p>
        </div>

        <div className="flex-shrink-0">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-[#1D68F2] hover:border-[#1D68F2] text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200"
          >
            <span>XML Sitemap (Feed)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sitemap Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow duration-200 space-y-5"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 ${section.iconColor}`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{section.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                </div>
              </div>

              <ul className="divide-y divide-slate-100">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="group flex items-start justify-between gap-3 py-3 hover:text-[#1D68F2] transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-[#1D68F2] transition-colors flex items-center gap-1.5">
                          {link.label}
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-1">{link.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D68F2] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Top Regions Quick Links */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#1D68F2]" />
          <h2 className="text-base font-bold text-slate-900">Featured Regional Portals</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {POPULAR_COUNTRIES.slice(0, 10).map((country) => (
            <Link
              key={country.code}
              href={`/countries/${country.slug}`}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#1D68F2] hover:border-blue-300 hover:shadow-xs transition-all duration-150"
            >
              <span className="truncate">{country.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                {country.code}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
