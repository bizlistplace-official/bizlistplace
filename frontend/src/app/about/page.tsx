import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ShieldCheck, Globe, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Biz List Place',
  description: 'Learn about Biz List Place — the premier worldwide verified business directory and global trade platform.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Globe className="w-3.5 h-3.5" />
          Our Mission & Standards
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Building a Verified Commercial World
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Biz List Place is dedicated to making cross-border business discovery transparent,
          dependable, and free from deceptive or low-quality listings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Authentic Moderation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every submission undergoes verification checks to validate company identity, operational
            premises, and contact credentials before earning directory verification badges.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Truly International</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standardized on ISO country codes and multi-branch physical locations, enabling local
            merchants and multinational corporations alike to reach international clients.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Real Feedback</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authentic customer reviews with automated duplicate prevention ensure potential buyers
            gain trustworthy insight into vendor reliability.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Are You a Registered Business Owner?</h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
          Publish your official premises, branch offices, and commercial services to our worldwide
          index today.
        </p>
        <div className="pt-2">
          <Link href="/add-business">
            <Button variant="secondary" size="md">
              Add Your Business Listing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
