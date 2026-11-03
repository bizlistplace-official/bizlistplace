'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { ICategory } from '@bizpockethub/shared';
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
  Sparkles,
  Star,
  Upload,
  MessageCircle,
  ShieldCheck,
  Clock,
  Wrench,
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
  const [facebookUrl, setFacebookUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Primary Location State
  const [branchName, setBranchName] = useState('Headquarters');
  const [countryCode, setCountryCode] = useState('PK');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');

  // Logo Preview State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchApi<ICategory[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Pre-fill user email once loaded
  useEffect(() => {
    if (user?.email && !contactEmail) {
      setContactEmail(user.email);
    }
  }, [user, contactEmail]);

  // Dynamic Form Completion Calculation (matching bizbranches.pk)
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (name.trim().length >= 2) score += 20;
    if (categoryIds.length > 0) score += 15;
    if (description.trim().length >= 20) score += 20;
    if (city.trim().length > 0) score += 15;
    if (addressLine1.trim().length > 0) score += 10;
    if (phone.trim().length >= 7) score += 10;
    if (contactEmail.trim().length > 0) score += 5;
    if (website.trim().length > 0 || facebookUrl.trim().length > 0) score += 5;
    return Math.min(score, 100);
  }, [name, categoryIds, description, city, addressLine1, phone, contactEmail, website, facebookUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted || loading) return;
    setErrorMsg('');
    setSuccessMsg('');

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

    if (businessType === 'physical' && (!addressLine1 || !city)) {
      setErrorMsg('Physical businesses require a valid street address and city.');
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
        countryCode: countryCode || 'PK',
        region: region || city,
        city: city || 'Local Area',
        postalCode: postalCode || undefined,
        addressLine1: addressLine1 || 'Online / Remote Operations',
        phone: phone || undefined,
        isPrimary: true,
      },
      socialLinks: {
        facebook: facebookUrl || undefined,
      },
    };

    try {
      const res = await fetchApi<any>('/businesses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setLoading(false);

      const biz = res.data?.business || (res.data?._id ? res.data : null);

      if (res.success && (biz || res.data)) {
        setIsSubmitted(true);
        setErrorMsg('');
        setSuccessMsg('Your business has been submitted successfully for review.');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirect user to their dashboard after confirmation
        setTimeout(() => {
          router.push('/dashboard');
        }, 2200);
      } else {
        setIsSubmitted(false);
        setSuccessMsg('');
        setErrorMsg(res.message || 'Failed to submit business listing.');
      }
    } catch {
      setLoading(false);
      setIsSubmitted(false);
      setSuccessMsg('');
      setErrorMsg('A network error occurred while submitting. Please try again.');
    }
  };

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        <Breadcrumbs items={[{ label: 'Add Business' }]} />

        {/* Page Title & Subtitle */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Add Your Business
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Pakistan &amp; Global business listing directory. Get discovered by customers in minutes.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1D68F2] border border-blue-200">
              <MessageCircle className="w-3.5 h-3.5" />
              Need quick assistance? Reach our team on WhatsApp or email
            </span>
          </div>
        </div>

        {/* Form Completion Progress Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Form Completion</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Fill in all required fields to complete your listing
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#1D68F2] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {completionPercentage}%
              </span>
              <div className="text-xs text-slate-400 font-medium">Complete</div>
            </div>
          </div>
          <div className="relative w-full bg-slate-100 rounded-full h-3.5 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1D68F2] via-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* POST-APPROVAL FEATURES ROADMAP NOTICE BANNER (Stage 1 of 2) */}
        <div className="rounded-2xl sm:rounded-3xl shadow-xl border border-blue-500/20 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 relative">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#1D68F2]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#1D68F2]/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 shadow-sm mt-0.5">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 bg-blue-400/20 text-blue-300 rounded-md border border-blue-400/30">
                  Quick Registration • Stage 1 of 2
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                Submit your basic listing details now — enhance your landing page after approval!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                To make your registration quick, submit your primary contact info below. Once your listing is approved by our team, you can log in to your owner dashboard to unlock these rich features:
              </p>
            </div>
          </div>

          {/* Post-Approval Features Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-white/10 relative z-10 text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-base">👤</span>
              <span>Owner Profile Card (Photo, Name &amp; Title)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-base">⏰</span>
              <span>Opening Hours &amp; Friday Timings</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-base">🛠️</span>
              <span>Services &amp; Specialties Tags</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-base">🌐</span>
              <span>Google Maps &amp; Branch Locations</span>
            </div>
          </div>
        </div>

        {/* Green Success Alert */}
        {successMsg && (
          <div className="p-5 sm:p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 mt-0.5">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-emerald-900 text-base sm:text-lg">{successMsg}</h4>
              <p className="text-emerald-700 text-xs sm:text-sm">
                Your listing profile is now waiting for moderation. Redirecting you to your Owner Dashboard in a few seconds...
              </p>
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                    Go to Dashboard Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Red Error Alert */}
        {errorMsg && !successMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Add Business Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden"
        >
          <fieldset disabled={isSubmitted || loading}>
            {/* SECTION 1: Business Details */}
            <section className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20">
              <div className="flex items-start gap-4 mb-8">
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-[#1D68F2] to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Business Details</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Tell us about your business and what services you offer
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="businessName" className="text-slate-700 font-semibold text-sm block">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Tech Corporation, Royal Jewels"
                    className="w-full h-12 px-4 border-2 rounded-xl border-slate-200 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-slate-700 font-semibold text-sm block">
                    Category <span className="text-rose-500">*</span>
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
                    searchPlaceholder="Search category..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessType" className="text-slate-700 font-semibold text-sm block">
                    Operating Model
                  </label>
                  <CustomSelect
                    value={businessType}
                    onChange={(val) => setBusinessType(val as any)}
                    options={[
                      { value: 'physical', label: 'Physical Storefront / Office' },
                      { value: 'service_area', label: 'Service Area / Delivery Business' },
                      { value: 'online_only', label: 'Online / Remote Operations' },
                    ]}
                    placeholder="Select Operating Model"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-slate-700 font-semibold text-sm block">
                    Business Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes your business unique, services provided, opening hours, specialties, etc. (minimum 20 characters)"
                    className="w-full p-4 border-2 rounded-xl border-slate-200 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none leading-relaxed"
                  />
                  <div className="text-right text-[11px] text-slate-400">
                    {description.length} characters (min 20)
                  </div>
                </div>

                {/* Logo Upload Box */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-slate-700 font-semibold text-sm block">
                    Business Logo <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="relative flex-1 w-full border-2 border-dashed border-slate-300 hover:border-[#1D68F2] bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-6 text-center transition-all">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        {logoPreview ? 'Change business logo' : 'Upload business logo'}
                      </p>
                      <p className="text-xs text-slate-500 mb-3">PNG, JPG or WebP (square recommended, max 2MB)</p>
                      <span className="inline-block px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm pointer-events-none">
                        Choose Logo File
                      </span>
                      <input
                        type="file"
                        id="logoFile"
                        name="logo"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {logoPreview && (
                      <div className="shrink-0">
                        <div className="w-28 h-28 rounded-2xl border-2 border-slate-200 overflow-hidden bg-white shadow-md flex items-center justify-center p-2">
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-xl" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Contact & Location */}
            <section className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20">
              <div className="flex items-start gap-4 mb-8">
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Contact &amp; Location</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Where can customers reach or visit your business?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold text-sm block">Country</label>
                  <CountrySelect
                    value={countryCode}
                    onChange={(c) => {
                      setCountryCode(c);
                      setCity('');
                    }}
                    placeholder="Select Country"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-slate-700 font-semibold text-sm block">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <CitySelect
                    value={city}
                    onChange={setCity}
                    countryCode={countryCode}
                    allowCustomInput
                    placeholder={countryCode ? 'Select or type city...' : 'Select country first'}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="address" className="text-slate-700 font-semibold text-sm block">
                    Complete Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Shop #14, Main Boulevard, Gulberg III, Lahore"
                    className="w-full h-12 px-4 border-2 rounded-xl border-slate-200 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-slate-700 font-semibold text-sm block">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex h-12 rounded-xl border-2 overflow-hidden border-slate-200 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 bg-white transition-all">
                    <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-bold border-r border-slate-200 text-sm shrink-0">
                      {countryCode === 'PK' ? '+92' : `+${countryCode}`}
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="300 1234567"
                      className="w-full h-full px-3.5 border-0 bg-transparent text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Phone number for direct customer calls</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="text-slate-700 font-semibold text-sm block">
                    WhatsApp Number <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex h-12 rounded-xl border-2 overflow-hidden border-slate-200 focus-within:border-[#1D68F2] focus-within:ring-2 focus-within:ring-[#1D68F2]/20 bg-white transition-all">
                    <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-bold border-r border-slate-200 text-sm shrink-0">
                      {countryCode === 'PK' ? '+92' : `+${countryCode}`}
                    </span>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="300 1234567"
                      className="w-full h-full px-3.5 border-0 bg-transparent text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Can be same as phone number</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="text-slate-700 font-semibold text-sm block">
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@yourbusiness.com"
                    className="w-full h-12 px-4 border-2 rounded-xl border-slate-200 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: Digital Presence */}
            <section className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20">
              <div className="flex items-start gap-4 mb-8">
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Digital Presence</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Connect your official website and social pages
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="websiteUrl" className="text-slate-700 font-semibold text-sm block">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full h-12 px-4 border-2 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="facebookUrl" className="text-slate-700 font-semibold text-sm block">
                    Facebook Page
                  </label>
                  <input
                    type="url"
                    id="facebookUrl"
                    name="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full h-12 px-4 border-2 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: Submission & Reminders */}
            <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-50 to-white text-center space-y-5">
              {/* Post-Approval / Real-time Reminder Card */}
              <div className="p-4 bg-blue-50/90 border border-blue-200/80 rounded-2xl text-left flex items-start gap-3.5 text-xs text-blue-950 shadow-sm max-w-xl mx-auto">
                <CheckCircle className="h-5 w-5 text-[#1D68F2] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold text-blue-950 block text-sm mb-0.5">
                    Almost done! Submit your listing now
                  </strong>
                  Your listing will be reviewed promptly. Once approved, you can log in to your owner dashboard to set up your <strong>Owner Profile Card (Photo, Name, Title)</strong>, <strong>Opening Hours</strong>, and <strong>Branch Locations</strong>!
                </div>
              </div>

              {/* Big Submit Button */}
              <button
                type="submit"
                disabled={!user || isSubmitted || loading}
                className="w-full sm:w-auto min-h-[54px] px-12 py-4 text-base sm:text-lg font-bold bg-[#1D68F2] hover:bg-[#1756cb] text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl flex items-center justify-center gap-3 mx-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting listing...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-white" />
                    <span>Submitted Successfully</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 fill-current" />
                    <span>Submit listing</span>
                    <Star className="h-5 w-5 fill-current" />
                  </>
                )}
              </button>

              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                By submitting, your listing will be verified by our moderation team and published publicly.
              </p>
            </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
