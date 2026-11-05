import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HelpCircle, ShieldCheck, PlusCircle, CheckCircle, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center & FAQs',
  description: 'Frequently asked questions regarding listing submissions, verification badges, and business directory management on Biz List Place.',
};

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I add my company to Biz List Place?',
      a: 'Click on "Add Your Business" in the top navigation, select your primary industrial sector, input your contact details, and specify your primary physical or remote branch location. Submissions are queued for moderation.',
    },
    {
      q: 'What does the "Verified Business" badge signify?',
      a: 'The Verified badge indicates that Biz List Place administrators have confirmed the business entity against registered corporate filings, official domain contact records, or verified government documentation. It is not an endorsement of performance.',
    },
    {
      q: 'How can I claim an existing listing on the directory?',
      a: 'If your business is already listed as an unverified entity, visit the listing profile and click "Claim Listing" or visit our claim portal. You will be prompted to provide an official corporate email and role verification statement.',
    },
    {
      q: 'Can a company list multiple physical branch offices?',
      a: 'Yes. Once a listing is approved, business owners can navigate to their Owner Dashboard and add unlimited regional branch offices, complete with independent phone numbers, addresses, and geographic coordinates.',
    },
    {
      q: 'How does Biz List Place handle fake or malicious reviews?',
      a: 'Every user review requires authentication, duplicate review submissions from the same user on a given business are prevented, and business owners cannot review their own listings. Suspicious entries can be flagged for review.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Help Center' }]} />

      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          Support & FAQs
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 text-sm max-w-xl">
          Learn how Biz List Place helps global companies publish verified profiles and how visitors
          find dependable service providers.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Still have questions?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Our directory support team is available to assist with your specific inquiries.
          </p>
        </div>
        <Link
          href="/contact"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
