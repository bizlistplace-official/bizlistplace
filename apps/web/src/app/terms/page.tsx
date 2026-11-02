import React from 'react';
import { Metadata } from 'next';
import { FileCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and listing guidelines for Biz List Place worldwide directory.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <FileCheck className="w-4 h-4" />
          Listing Guidelines
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing Biz List Place or listing your commercial entity, you agree to comply with
            these Terms of Service and all applicable international trade and data regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Business Listing Accuracy</h2>
          <p>
            Users and business owners who submit profiles certify that all submitted information
            (including corporate identity, physical locations, phone numbers, and operational
            hours) is accurate and legitimate. We reserve the right to suspend or remove profiles
            found to contain misleading, fraudulent, or counterfeit information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Verification Badges</h2>
          <p>
            Verification badges awarded by Biz List Place represent confirmation that identity records
            were reviewed by our moderation desk. Verification does not constitute a warranty of
            commercial performance, financial viability, or legal representation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Prohibited Content</h2>
          <p>
            Biz List Place strictly prohibits listings related to illegal goods, deceptive financial
            schemes, impersonation, or offensive material. Any listing violating these standards is
            subject to immediate suspension.
          </p>
        </section>
      </div>
    </div>
  );
}
