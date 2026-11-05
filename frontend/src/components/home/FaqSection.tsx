'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, Plus, Headphones, MessageCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is the best business directory in Pakistan?',
    answer:
      'Biz List Place is one of Pakistan\'s premier free business directories, connecting thousands of local shops, clinics, restaurants, and service providers across major cities like Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and Multan. It offers verified listings, authentic customer reviews, and direct WhatsApp contact at zero cost.',
  },
  {
    id: 'faq-2',
    question: 'How do I add a business listing in Pakistan?',
    answer:
      'Adding your business listing is quick and completely free. Simply click the "+ Add Your Business Free" button, fill out your company name, category, address, phone number, operating hours, and upload your storefront or logo. Once submitted, your listing is approved quickly to help customers find you.',
  },
  {
    id: 'faq-3',
    question: 'How do I add my business to Biz List Place?',
    answer:
      'You can register your business by visiting our Add Business page (/add-business). Choose your business category, specify your city and local neighborhood, provide contact details (phone, WhatsApp, email, website), and add a brief description of your services.',
  },
  {
    id: 'faq-4',
    question: 'Is it free to list my business?',
    answer:
      'Yes, 100% free! There are no listing fees, no monthly subscriptions, and no credit card is required to list or search for businesses on Biz List Place.',
  },
  {
    id: 'faq-5',
    question: 'How can customers find my business?',
    answer:
      'Customers find your business through our targeted search bar, category explorer, city & location filters, and featured directory placements. In addition, listings are structured to be indexed by search engines like Google for maximum local organic reach.',
  },
  {
    id: 'faq-6',
    question: 'Can I edit my business information after listing?',
    answer:
      'Yes. You can update your contact numbers, address, operating hours, descriptions, and uploaded photos anytime through your business dashboard or by reaching out to our support team.',
  },
  {
    id: 'faq-7',
    question: 'What information should I include in my business listing?',
    answer:
      'For maximum customer engagement and trust, we recommend providing your official business name, exact physical address, active phone and WhatsApp numbers, website URL, social media handles, opening hours, high-quality photos, and a clear description of your services.',
  },
  {
    id: 'faq-8',
    question: 'How do I contact businesses listed on Biz List Place?',
    answer:
      'Each business listing card and detail page provides verified contact channels, including one-click direct phone calls, instant WhatsApp chat, official website links, and physical map locations.',
  },
];

import { CountryConfig } from '@/lib/countryConfig';

interface FaqSectionProps {
  country?: CountryConfig;
}

export function FaqSection({ country }: FaqSectionProps = {}) {
  // Allow toggling open state; first item open by default for rich first impression
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']);

  const localizedFaqs: FaqItem[] = React.useMemo(() => {
    if (!country) return FAQS;
    const citiesList = country.topCities.slice(0, 5).map((c) => c.name).join(', ');
    return [
      {
        id: 'faq-1',
        question: `What is the best business directory in ${country.name}?`,
        answer: `BizListPlace is ${country.name}'s premier free business directory, connecting local shops, clinics, offices, and service providers across major cities like ${citiesList}. It offers verified listings, authentic customer reviews, and direct contact at zero cost in ${country.currency} (${country.currencySymbol}).`,
      },
      {
        id: 'faq-2',
        question: `How do I add a business listing in ${country.name}?`,
        answer: `Adding your business listing in ${country.name} is quick and completely free. Simply click "+ Add Business Free", select ${country.name} and your city, provide contact details, operating hours, and photos to reach customers across ${country.name}.`,
      },
      ...FAQS.slice(2),
    ];
  }, [country]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-16 sm:mt-20">
      {/* Section Header matching exact screenshot */}
      <div className="relative text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        {/* Subtle Ambient Glow matching screenshot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-44 bg-gradient-to-r from-emerald-100/30 via-teal-50/20 to-purple-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Badge: (?) Got Questions? 💭 */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50/80 via-white to-purple-50/80 border border-emerald-200/60 shadow-xs mb-4">
          <HelpCircle className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800">Got Questions?</span>
          <MessageCircle className="w-4 h-4 text-purple-500 stroke-[2.2]" />
        </div>

        {/* Heading: Frequently Asked Questions (with gradient on Questions) */}
        <h2 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Frequently Asked{' '}
          <span className="bg-gradient-to-r from-[#00A86B] via-[#0D9488] via-[#7C3AED] to-[#E11D48] bg-clip-text text-transparent">
            Questions
          </span>
        </h2>

        {/* Subtitle */}
        <p className="relative z-10 text-xs sm:text-sm md:text-base text-slate-600 mt-3 leading-relaxed max-w-xl mx-auto">
          Answers to common questions about finding businesses in Pakistan and adding your
          business free on Biz List Place.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {FAQS.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white border-blue-200 shadow-[0_4px_20px_rgba(29,104,242,0.06)]'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none group"
              >
                <span
                  className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen ? 'text-[#1D68F2]' : 'text-slate-800 group-hover:text-slate-900'
                  }`}
                >
                  {faq.question}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-blue-50 text-[#1D68F2] rotate-180'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions Box */}
      <div className="mt-10 sm:mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D68F2] flex items-center justify-center flex-shrink-0">
            <Headphones className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Can&apos;t find the answer you&apos;re looking for? Reach out to our team or list your business today.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <Link
            href="/add-business"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs sm:text-sm font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>List Your Business</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
