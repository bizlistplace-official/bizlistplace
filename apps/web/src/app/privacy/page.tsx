import React from 'react';
import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data processing disclosures for Biz List Place directory users and business owners.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          Data Transparency
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            Biz List Place collects information you voluntarily supply when registering an account,
            submitting a business listing, claiming ownership, or publishing customer reviews. This
            includes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Account credentials: Name, email address, encrypted password hashes.</li>
            <li>
              Public business data: Corporate name, commercial descriptions, operational hours, branch
              office addresses, contact phone numbers, public emails, and social media handles.
            </li>
            <li>
              Verification records: Business registration evidence and executive statements submitted
              during listing verification or claim requests.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. How We Use Information</h2>
          <p>
            Information submitted as public directory data is intentionally indexed and displayed to
            enable visitors to discover and contact your commercial entity. Account credentials and
            audit logs are utilized strictly for authentication, security monitoring, and spam
            prevention.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Cookies & Session Storage</h2>
          <p>
            We use secure, HttpOnly session cookies to preserve your authenticated session. We do not
            store sensitive unencrypted authorization secrets in client-side localStorage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            4. International Data Privacy Disclosures
          </h2>
          <p className="text-xs text-slate-600">
            Note: While Biz List Place implements strict data minimization, role-based access control,
            and secure encryption standards, complete regulatory compliance (such as full EU GDPR,
            UK DPA, or California CCPA/CPRA certification) requires ongoing operational processes,
            including formal Data Processing Agreements (DPAs), independent security audits, and
            designated Data Protection Officers as enterprise deployment requires.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact Data Inquiries</h2>
          <p>
            For data correction requests or to request permanent account deletion, contact our data
            privacy desk at <strong>privacy@bizlistplace.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
