'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { fetchApi } from '@/lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetchApi<{ message?: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.success) {
        setSent(true);
      } else {
        setErrorMsg(res.message || 'Unable to deliver message at this time. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Contact Support' }]} />

      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Biz List Place Support
        </h1>
        <p className="text-slate-600 text-sm max-w-xl">
          Have an inquiry regarding listing verification, data corrections, corporate partnerships,
          or account assistance? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-slate-900">Direct Contact</h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1D68F2] flex-shrink-0" />
                <a href="mailto:bizlistplaceofficial@gmail.com" className="hover:underline">
                  bizlistplaceofficial@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1D68F2] flex-shrink-0" />
                <span>+1 (800) 555-BIZLIST</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1D68F2] flex-shrink-0 mt-0.5" />
                <span>Global Compliance & Directory Desk, Worldwide Operations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="font-bold text-lg text-slate-900">Message Received</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for contacting us. A confirmation has been dispatched to <strong>{email}</strong>,
                and a member of our support team will respond to your inquiry within 24 hours.
              </p>
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                    setSubject('');
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2] focus:border-[#1D68F2]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2] focus:border-[#1D68F2]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Listing Verification Inquiry"
                  className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2] focus:border-[#1D68F2]"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your query..."
                  className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2] focus:border-[#1D68F2]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="gap-2 bg-[#1D68F2] hover:bg-[#1756cb] text-white"
              >
                <Send className="w-4 h-4" />
                <span>Send Inquiry</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
