'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { ICategory, BUSINESS_TYPES } from '@bizpockethub/shared';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CitySelect } from '@/components/ui/CitySelect';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  Phone,
  Mail,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AddBusinessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<ICategory[]>([]);

  // Automatically redirect unauthenticated users to login with redirect param
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/add-business');
    }
  }, [user, authLoading, router]);

  // Form State
  const [name, setName] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState<'physical' | 'service_area' | 'online_only'>('physical');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Primary Location State
  const [branchName, setBranchName] = useState('Headquarters');
  const [countryCode, setCountryCode] = useState('US');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<{ slug: string; status: string } | null>(null);

  useEffect(() => {
    fetchApi<ICategory[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in or register before submitting a business listing.');
      return;
    }

    if (name.trim().length < 2) {
      setErrorMsg('Business name must be at least 2 characters.');
      return;
    }

    if (categoryIds.length === 0) {
      setErrorMsg('Please select at least one primary industry category.');
      return;
    }

    if (description.trim().length < 20) {
      setErrorMsg('Please provide a descriptive overview (minimum 20 characters).');
      return;
    }

    if (businessType === 'physical' && (!addressLine1 || !city || !region)) {
      setErrorMsg('Physical businesses require a valid street address, city, and region.');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      description,
      shortDescription: shortDescription || description.slice(0, 160),
      website: website || undefined,
      contactEmail: contactEmail || user.email,
      phone: phone || undefined,
      categoryIds,
      businessType,
      primaryLocation: {
        branchName: branchName || 'Headquarters',
        countryCode,
        region,
        city,
        postalCode,
        addressLine1: addressLine1 || 'Online / Remote Operations',
        isPrimary: true,
      },
    };

    const res = await fetchApi('/businesses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.success && res.data?.business) {
      setSubmittedData({
        slug: res.data.business.slug,
        status: res.data.business.listingStatus,
      });
    } else {
      setErrorMsg(res.message || 'Failed to submit business listing.');
    }
  };

  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Listing Successfully Submitted!
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
          {submittedData.status === 'published'
            ? 'Your business listing has been verified and is now publicly live in the Biz List Place directory.'
            : 'Your business profile has entered our moderation queue. Our team reviews records for authenticity, spam prevention, and correct category taxonomy.'}
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-md mx-auto text-left space-y-2">
          <div>
            <strong>Listing Status:</strong>{' '}
            <span className="capitalize font-semibold text-teal-700">
              {submittedData.status}
            </span>
          </div>
          <div>
            <strong>URL Slug:</strong>{' '}
            <code className="text-slate-800">/business/{submittedData.slug}</code>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href={`/business/${submittedData.slug}`}>
            <Button variant="primary" size="md">
              Preview Listing Profile
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="md">
              Go to Owner Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[#1D68F2] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">
          Redirecting to login to proceed with your business listing...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumbs items={[{ label: 'Add Business' }]} />

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          Directory Registration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          List Your Business on Biz List Place
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Create an official, crawlable company profile. Reach global buyers, publish branch
          locations, and establish international authority.
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>You need an account to manage your listing and branch locations.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="font-bold underline">
              Log In
            </Link>
            <span>or</span>
            <Link href="/register" className="font-bold underline">
              Register
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
        {/* Section 1: Core Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            1. Core Business Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Engineering & Logistics"
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Category *
              </label>
              <CustomSelect
                value={categoryIds[0] || ''}
                onChange={(val) => setCategoryIds([val])}
                options={categories.map((c) => ({
                  value: c._id || c.slug,
                  label: c.name,
                }))}
                placeholder="Select Primary Category"
                searchable
                searchPlaceholder="Search categories..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Model
              </label>
              <CustomSelect
                value={businessType}
                onChange={(val) => setBusinessType(val as any)}
                options={[
                  { value: 'physical', label: 'Physical Premises / Offices' },
                  { value: 'service_area', label: 'Service Area Business' },
                  { value: 'online_only', label: 'Digital & E-Commerce Only' },
                ]}
                placeholder="Select Operating Model"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary / Headline (Max 160 characters)
            </label>
            <input
              type="text"
              maxLength={160}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Turnkey industrial automation and precision robotics manufacturer."
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Company Description * (Min 20 characters)
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your products, services, capabilities, client portfolio, and background..."
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600" />
            2. Contact & Online Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Public Inquiries Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@company.com"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Primary Location / Branch */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            3. Primary Branch / Headquarters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Global HQ or New York Office"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
              <CountrySelect
                value={countryCode}
                onChange={(c) => {
                  setCountryCode(c);
                  setCity('');
                }}
                placeholder="Select Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Region / State *</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. New York, Punjab, Greater London"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City or Locality *</label>
              <CitySelect
                value={city}
                onChange={setCity}
                countryCode={countryCode}
                allowCustomInput
                placeholder={countryCode ? 'Select or type city...' : 'Select country first'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 10001"
                className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. 350 5th Avenue, Suite 4200"
              className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="secondary" size="md" loading={loading} disabled={!user}>
            Submit Business for Review
          </Button>
        </div>
      </form>
    </div>
  );
}
