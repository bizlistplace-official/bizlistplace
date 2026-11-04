'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { ICategory, INITIAL_CATEGORIES } from '@bizpockethub/shared';
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
  User,
  Upload,
  Clock,
  Search,
  Share2,
  ImageIcon,
  Sparkles,
  Wrench,
} from 'lucide-react';

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DaySchedule {
  isOpen: boolean;
  from: string;
  to: string;
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const DEFAULT_SCHEDULE: Record<DayKey, DaySchedule> = {
  monday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  tuesday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  wednesday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  thursday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  friday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  saturday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
  sunday: { isOpen: false, from: '09:00 AM', to: '06:00 PM' },
};

export default function AddBusinessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Array<Partial<ICategory> & { _id?: string; slug: string; name: string }>>(
    () => [...INITIAL_CATEGORIES]
  );

  // Automatically redirect unauthenticated users to login with redirect param
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/add-business');
    }
  }, [user, authLoading, router]);

  // Section 1: Business Identity State
  const [name, setName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Section 2: Location & Category State
  const [countryCode, setCountryCode] = useState('PK');
  const [city, setCity] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [postalCode, setPostalCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');

  // Section 3: Content & Media State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // Section 4: Weekly Opening Hours State
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(DEFAULT_SCHEDULE);

  // Section 5: Online Links State
  const [website, setWebsite] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');

  // Submission State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) {
      errs.name = 'Business Name is required (min 2 characters)';
    }
    if (contactPersonName.trim().length < 2) {
      errs.contactPersonName = 'Contact Person Name is required';
    }
    if (phone.trim().length < 5) {
      errs.phone = 'Phone Number is required';
    }
    if (!city.trim()) {
      errs.city = 'City is required';
    }
    if (categoryIds.length === 0) {
      errs.category = 'Category is required';
    }
    if (!addressLine1.trim()) {
      errs.addressLine1 = 'Complete Address is required';
    }
    if (description.trim().length < 20) {
      errs.description = 'Business Description is required (min 20 characters)';
    }
    return errs;
  }, [name, contactPersonName, phone, city, categoryIds, addressLine1, description]);

  const isFieldInvalid = (fieldName: string) => {
    return (hasSubmitted || touched[fieldName]) && Boolean(errors[fieldName]);
  };

  const markTouched = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  useEffect(() => {
    fetchApi<ICategory[]>('/categories').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const apiMap = new Map<string, ICategory>();
        res.data.forEach((c) => {
          if (c.slug) apiMap.set(c.slug, c);
        });

        // Merge INITIAL_CATEGORIES with API categories so all 38+ categories are present with Mongo _ids
        const merged: Array<Partial<ICategory> & { _id?: string; slug: string; name: string }> = INITIAL_CATEGORIES.map(
          (ic) => {
            const fromApi = apiMap.get(ic.slug);
            return fromApi ? { ...ic, ...fromApi } : ic;
          }
        );

        // Include any extra categories from the API not present in INITIAL_CATEGORIES
        const initialSlugs = new Set(INITIAL_CATEGORIES.map((c) => c.slug));
        res.data.forEach((c) => {
          if (!initialSlugs.has(c.slug)) {
            merged.push(c);
          }
        });

        setCategories(merged);

        // If category was previously selected by slug, sync it to _id if available
        setCategoryIds((prev) => {
          if (prev.length === 0) return prev;
          const currentVal = prev[0];
          const matched = merged.find((c) => c.slug === currentVal || c._id === currentVal);
          return matched?._id ? [matched._id] : prev;
        });
      }
    });
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c._id || c.slug,
        label: c.name,
      })),
    [categories]
  );

  const selectedCategoryValue = useMemo(() => {
    const current = categoryIds[0];
    if (!current) return '';
    const found = categories.find((c) => c._id === current || c.slug === current);
    return found ? (found._id || found.slug) : current;
  }, [categoryIds, categories]);

  // Pre-fill user email once loaded
  useEffect(() => {
    if (user?.email && !contactEmail) {
      setContactEmail(user.email);
    }
  }, [user, contactEmail]);

  // Dynamic Form Completion Calculation
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (name.trim().length >= 2) score += 15;
    if (contactPersonName.trim().length >= 2) score += 10;
    if (phone.trim().length >= 7) score += 10;
    if (city.trim().length > 0) score += 15;
    if (categoryIds.length > 0) score += 15;
    if (addressLine1.trim().length > 0) score += 10;
    if (logoPreview) score += 5;
    if (description.trim().length >= 20) score += 15;
    if (website.trim().length > 0 || facebookUrl.trim().length > 0 || youtubeUrl.trim().length > 0 || googleBusinessUrl.trim().length > 0) score += 5;
    return Math.min(score, 100);
  }, [name, contactPersonName, phone, city, categoryIds, addressLine1, logoPreview, description, website, facebookUrl, youtubeUrl, googleBusinessUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Logo file exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Action: Standard Hours (Mon-Sat 9AM-6PM, Sun Closed)
  const handleSetStandardHours = () => {
    setSchedule({
      monday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      tuesday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      wednesday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      thursday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      friday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      saturday: { isOpen: true, from: '09:00 AM', to: '06:00 PM' },
      sunday: { isOpen: false, from: '09:00 AM', to: '06:00 PM' },
    });
  };

  // Quick Action: 24/7 Open
  const handleSet247Hours = () => {
    setSchedule({
      monday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      tuesday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      wednesday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      thursday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      friday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      saturday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
      sunday: { isOpen: true, from: '12:00 AM', to: '11:59 PM' },
    });
  };

  // Toggle Day Open/Closed
  const toggleDayStatus = (dayKey: DayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
      },
    }));
  };

  // Update Day Time
  const updateDayTime = (dayKey: DayKey, field: 'from' | 'to', val: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: val,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    if (isSubmitted || loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setErrorMsg('Please log in or register before submitting a business listing.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please complete all required fields highlighted in red below.');
      const firstInvalidEl = document.querySelector('[data-invalid="true"]');
      if (firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    const formattedOpeningHours: Record<string, string> = {};
    for (const [day, val] of Object.entries(schedule)) {
      formattedOpeningHours[day] = val.isOpen ? `${val.from} - ${val.to}` : 'Closed';
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      shortDescription: description.trim().slice(0, 160),
      website: website.trim() || undefined,
      contactEmail: contactEmail.trim() || user.email,
      phone: phone.trim() || undefined,
      logoUrl: logoPreview || undefined,
      categoryIds,
      businessType: 'physical',
      countryCode: (countryCode || 'PK').toUpperCase(),
      serviceAreas: neighbourhood.trim() ? [neighbourhood.trim()] : [],
      primaryLocation: {
        branchName: 'Headquarters',
        countryCode: (countryCode || 'PK').toUpperCase(),
        region: neighbourhood.trim() || city.trim() || 'Local Area',
        city: city.trim() || 'Local Area',
        postalCode: postalCode.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: neighbourhood.trim() || undefined,
        phone: phone.trim() || undefined,
        email: contactEmail.trim() || user.email,
        openingHours: formattedOpeningHours,
        isPrimary: true,
      },
      socialLinks: {
        facebook: facebookUrl.trim() || undefined,
        youtube: youtubeUrl.trim() || undefined,
        google: googleBusinessUrl.trim() || undefined,
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
        setSuccessMsg('Your business has been submitted successfully for approval.');
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
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <Breadcrumbs items={[{ label: 'Add Business' }]} />

        {/* Page Title & Subtitle */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Add Your Business
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Pakistan &amp; Global business listing directory. Get discovered by customers in minutes.
          </p>
        </div>

        {/* Form Completion Progress Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Form Completion</h2>
              <p className="text-xs text-slate-500">
                Fill in all required fields to complete your listing
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-[#1D68F2]">
                {completionPercentage}%
              </span>
            </div>
          </div>
          <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#1D68F2] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
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

        {/* Form Form Container */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6 sm:space-y-8">
          <fieldset disabled={isSubmitted || loading} className="space-y-6 sm:space-y-8">

            {/* STAGE 1 ROADMAP / POST-APPROVAL NOTICE BANNER */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#0A1428] via-[#0F224A] to-[#0A1324] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20">
              {/* Subtle Ambient Glow Effect */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#1D68F2]/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header Row: Icon + Badge + Titles */}
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1D68F2] to-blue-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/25 mt-0.5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    QUICK REGISTRATION • STAGE 1 OF 2
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                    Submit your basic listing details now — enhance your landing page after approval!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
                    To make your registration quick, submit your primary contact info below. Once your listing is approved by our team, you can log in to your owner dashboard to unlock these rich features:
                  </p>
                </div>
              </div>

              {/* Divider Line */}
              <div className="relative z-10 h-px bg-white/10 w-full my-5 sm:my-6" />

              {/* 4 Feature Badges Grid */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-2xl px-3.5 py-3 transition-colors backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                    Owner Profile Card <span className="text-[11px] font-normal text-slate-400 block">(Photo, Name &amp; Title)</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-2xl px-3.5 py-3 transition-colors backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                    Opening Hours <span className="text-[11px] font-normal text-slate-400 block">&amp; Friday Timings</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-2xl px-3.5 py-3 transition-colors backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/20 text-rose-300 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                    Services &amp; Specialties <span className="text-[11px] font-normal text-slate-400 block">Category Tags</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-2xl px-3.5 py-3 transition-colors backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-300 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight">
                    Google Maps &amp; <span className="text-[11px] font-normal text-slate-400 block">Social Video Links</span>
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: Business Identity */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              {/* Section Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      SECTION 1
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Business Identity
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official business details and primary contact channels
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Row 1: Business Name */}
                <div data-invalid={isFieldInvalid('name')}>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    BUSINESS NAME <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    placeholder="e.g. Skyline Logistics & Courier Services"
                    className={`w-full h-12 px-4 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                      isFieldInvalid('name')
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200/90 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20'
                    }`}
                  />
                  {isFieldInvalid('name') && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Row 2: Contact Person & Business Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div data-invalid={isFieldInvalid('contactPersonName')}>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                      CONTACT PERSON NAME <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                        onBlur={() => markTouched('contactPersonName')}
                        placeholder="e.g. Awais Ali"
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                          isFieldInvalid('contactPersonName')
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200/90 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20'
                        }`}
                      />
                    </div>
                    {isFieldInvalid('contactPersonName') && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                        {errors.contactPersonName}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase">
                        BUSINESS EMAIL
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal lowercase">
                        optional
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. contact@yourbusiness.com"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Phone Number & WhatsApp Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div data-invalid={isFieldInvalid('phone')}>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                      PHONE NUMBER <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => markTouched('phone')}
                        placeholder="e.g. +92 300 1234567"
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                          isFieldInvalid('phone')
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200/90 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20'
                        }`}
                      />
                    </div>
                    {isFieldInvalid('phone') && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase">
                        WHATSAPP NUMBER
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal lowercase">
                        optional
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#25D366]">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g. +92 321 5031143"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Location & Category */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              {/* Section Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      SECTION 2
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Location &amp; Category
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specify your regional location, industry category, and address
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Row 1: Country, City, Area/Neighbourhood */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                      COUNTRY <span className="text-rose-500">*</span>
                    </label>
                    <CountrySelect
                      value={countryCode}
                      onChange={(c) => {
                        setCountryCode(c);
                        setCity('');
                      }}
                      hideFlag
                      hideCodeBadge
                      triggerClassName="!h-12 !rounded-xl !border-slate-200/90 !bg-white !text-sm !font-medium !text-slate-800 focus:!border-[#1D68F2] focus:!ring-2 focus:!ring-[#1D68F2]/20"
                      placeholder="Select Country"
                    />
                  </div>

                  <div data-invalid={isFieldInvalid('city')}>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                      CITY <span className="text-rose-500">*</span>
                    </label>
                    <CitySelect
                      value={city}
                      onChange={(c) => {
                        setCity(c);
                        markTouched('city');
                      }}
                      countryCode={countryCode}
                      allowCustomInput
                      placeholder="Search or select city..."
                      icon={<Search className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                      triggerClassName={`!h-12 !rounded-xl !bg-white !text-sm !font-medium !text-slate-800 ${
                        isFieldInvalid('city')
                          ? '!border-rose-400 focus:!border-rose-500 focus:!ring-2 focus:!ring-rose-500/20'
                          : '!border-slate-200/90 focus:!border-[#1D68F2] focus:!ring-2 focus:!ring-[#1D68F2]/20'
                      }`}
                    />
                    {isFieldInvalid('city') && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase">
                        AREA / NEIGHBOURHOOD
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal lowercase">
                        optional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={neighbourhood}
                      onChange={(e) => setNeighbourhood(e.target.value)}
                      placeholder="e.g. DHA Phase 5 / Gulberg III"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Category & Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  <div data-invalid={isFieldInvalid('category')}>
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                      CATEGORY <span className="text-rose-500">*</span>
                    </label>
                    <CustomSelect
                      value={selectedCategoryValue}
                      onChange={(val) => {
                        setCategoryIds(val ? [val] : []);
                        markTouched('category');
                      }}
                      options={categoryOptions}
                      placeholder="Select a category"
                      searchable
                      searchPlaceholder="Search category..."
                      triggerClassName={`!h-12 !rounded-xl !bg-white !text-sm !font-medium !text-slate-800 ${
                        isFieldInvalid('category')
                          ? '!border-rose-400 focus:!border-rose-500 focus:!ring-2 focus:!ring-rose-500/20'
                          : '!border-slate-200/90 focus:!border-[#1D68F2] focus:!ring-2 focus:!ring-[#1D68F2]/20'
                      }`}
                    />
                    {isFieldInvalid('category') && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase">
                        POSTAL / ZIP CODE
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal lowercase">
                        optional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 54000"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="hidden md:block" />
                </div>

                {/* Row 3: Complete Address */}
                <div data-invalid={isFieldInvalid('addressLine1')}>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    COMPLETE ADDRESS <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      onBlur={() => markTouched('addressLine1')}
                      placeholder="e.g. Office # 402, 4th Floor, Arfa Software Technology Park, Ferozepur Road"
                      className={`w-full h-12 pl-4 pr-10 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                        isFieldInvalid('addressLine1')
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200/90 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  {isFieldInvalid('addressLine1') && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 3: Content & Media */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              {/* Section Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                      SECTION 3
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Content &amp; Media
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your official business logo and write a compelling description
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Logo Upload Dropzone */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    BUSINESS LOGO <span className="text-rose-500">*</span>{' '}
                    <span className="text-xs text-slate-400 font-normal lowercase">
                      (max 5mb, jpg/png/webp)
                    </span>
                  </label>

                  <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1D68F2] bg-white hover:bg-blue-50/20 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group">
                    <input
                      type="file"
                      id="logoUploadInput"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {logoPreview ? (
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Business Logo preview"
                          className="w-24 h-24 object-contain rounded-xl border border-slate-200 shadow-sm mb-3 bg-white"
                        />
                        <p className="text-sm font-bold text-slate-800">Logo selected</p>
                        <p className="text-xs text-[#1D68F2] font-semibold mt-1">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                          Click to upload your Business Logo
                        </p>
                        <p className="text-xs text-slate-400">
                          Supports JPG, PNG, WebP up to 5MB (Up to 5 images remaining)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Description */}
                <div data-invalid={isFieldInvalid('description')}>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    BUSINESS DESCRIPTION <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 2000) {
                        setDescription(e.target.value);
                      }
                    }}
                    onBlur={() => markTouched('description')}
                    placeholder="Describe your business services, products, background, and what makes your business unique... (min 20 characters)"
                    className={`w-full p-4 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-y min-h-[140px] ${
                      isFieldInvalid('description')
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200/90 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-medium">
                    <span>Minimum 20 characters required</span>
                    <span>{description.length}/2000</span>
                  </div>
                  {isFieldInvalid('description') && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 animate-in fade-in-0 duration-150">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 4: Weekly Opening Hours (Optional) */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              {/* Section Header with Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        SECTION 4
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Weekly Opening Hours
                      </h2>
                      <span className="text-xs sm:text-sm text-slate-400 font-normal">
                        (Optional)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set opening and closing times for each day of the week
                    </p>
                  </div>
                </div>

                {/* Quick Action Presets */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSetStandardHours}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 text-[#1D68F2] hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                  >
                    Standard (Mon-Sat 9AM-6PM)
                  </button>
                  <button
                    type="button"
                    onClick={handleSet247Hours}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors cursor-pointer"
                  >
                    24/7 Open
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-3" />

              {/* Weekly Days Rows */}
              <div className="divide-y divide-slate-100">
                {DAYS.map((day) => {
                  const dayData = schedule[day.key];
                  return (
                    <div
                      key={day.key}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Day Name & Open/Closed Toggle Badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-24 sm:w-28 text-sm font-bold ${
                            dayData.isOpen ? 'text-slate-800' : 'text-slate-400 font-semibold'
                          }`}
                        >
                          {day.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleDayStatus(day.key)}
                          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer select-none ${
                            dayData.isOpen
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {dayData.isOpen ? 'Open' : 'Closed'}
                        </button>
                      </div>

                      {/* Right: Time Selectors or 'Closed all day' */}
                      <div className="flex items-center">
                        {dayData.isOpen ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">From:</span>
                            <div className="relative inline-flex items-center">
                              <select
                                value={dayData.from}
                                onChange={(e) => updateDayTime(day.key, 'from', e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-xl px-3 pr-8 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#1D68F2] outline-none cursor-pointer"
                              >
                                {TIME_OPTIONS.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                            </div>

                            <span className="text-slate-400 mx-1">—</span>

                            <span className="text-xs text-slate-400 font-medium">To:</span>
                            <div className="relative inline-flex items-center">
                              <select
                                value={dayData.to}
                                onChange={(e) => updateDayTime(day.key, 'to', e.target.value)}
                                className="appearance-none bg-white border border-slate-200 rounded-xl px-3 pr-8 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#1D68F2] outline-none cursor-pointer"
                              >
                                {TIME_OPTIONS.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm italic text-slate-400">
                            Closed all day
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 5: Online Links (All Optional) */}
            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              {/* Section Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                      SECTION 5
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Online Links
                    </h2>
                    <span className="text-xs sm:text-sm text-slate-400 font-normal">
                      (All Optional)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your website, social media pages, and Google Business Profile
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Form Fields: 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Official Website */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    OFFICIAL WEBSITE
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Facebook Page URL */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    FACEBOOK PAGE URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1877F2]">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourbusiness"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* YouTube Channel URL */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    YOUTUBE CHANNEL URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourbusiness"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Google Business Profile URL */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase block mb-2">
                    GOOGLE BUSINESS PROFILE URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={googleBusinessUrl}
                      onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/... or business profile link"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Form Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-1/3 h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base transition-colors shadow-sm cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!user || isSubmitted || loading}
                className="w-full sm:w-2/3 h-14 rounded-2xl bg-[#1D68F2] hover:bg-[#1554c9] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting listing...</span>
                  </div>
                ) : isSubmitted ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                    <span>Submitted Successfully</span>
                  </div>
                ) : (
                  <span>Submit Business for Approval</span>
                )}
              </button>
            </div>

          </fieldset>
        </form>
      </div>
    </main>
  );
}
