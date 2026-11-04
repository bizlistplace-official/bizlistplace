'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import { IBusiness, IClaimRequest, IBusinessLocation, ICategory, INITIAL_CATEGORIES } from '@bizpockethub/shared';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CitySelect } from '@/components/ui/CitySelect';
import {
  Building2,
  Plus,
  PlusCircle,
  ExternalLink,
  MapPin,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  Star,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  TrendingUp,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [claims, setClaims] = useState<IClaimRequest[]>([]);
  const [categories, setCategories] = useState<Array<Partial<ICategory> & { _id?: string; slug: string; name: string }>>(
    () => [...INITIAL_CATEGORIES]
  );
  const [loading, setLoading] = useState(true);

  // Active business index (for multi-business switcher)
  const [selectedBizIndex, setSelectedBizIndex] = useState(0);

  // Dashboard Tab state ('branches' | 'reviews' | 'growth')
  const [activeTab, setActiveTab] = useState<'branches' | 'reviews' | 'growth'>('branches');

  // Copy Link State
  const [copiedLink, setCopiedLink] = useState(false);

  // Global action notification
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Business Modal State
  const [editingBusiness, setEditingBusiness] = useState<IBusiness | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('PK');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Delete Business Modal State
  const [deletingBusiness, setDeletingBusiness] = useState<IBusiness | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Branch Modal State
  const [selectedBizForBranch, setSelectedBizForBranch] = useState<IBusiness | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCountry, setBranchCountry] = useState('PK');
  const [branchCity, setBranchCity] = useState('');
  const [branchRegion, setBranchRegion] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchSuccess, setBranchSuccess] = useState('');
  const [branchError, setBranchError] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [bizRes, claimRes, catRes] = await Promise.all([
      fetchApi<IBusiness[]>('/owner/businesses'),
      fetchApi<IClaimRequest[]>('/owner/claims'),
      fetchApi<ICategory[]>('/categories'),
    ]);

    if (bizRes.success && bizRes.data) {
      setBusinesses(Array.isArray(bizRes.data) ? bizRes.data : (bizRes.data as any).data || []);
    }
    if (claimRes.success && claimRes.data) {
      setClaims(Array.isArray(claimRes.data) ? claimRes.data : (claimRes.data as any).data || []);
    }
    if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
      const apiMap = new Map<string, ICategory>();
      catRes.data.forEach((c) => {
        if (c.slug) apiMap.set(c.slug, c);
      });
      const merged: Array<Partial<ICategory> & { _id?: string; slug: string; name: string }> = INITIAL_CATEGORIES.map(
        (ic) => {
          const fromApi = apiMap.get(ic.slug);
          return fromApi ? { ...ic, ...fromApi } : ic;
        }
      );
      const initialSlugs = new Set(INITIAL_CATEGORIES.map((c) => c.slug));
      catRes.data.forEach((c) => {
        if (!initialSlugs.has(c.slug)) {
          merged.push(c);
        }
      });
      merged.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const activeBusiness: IBusiness | undefined = businesses[selectedBizIndex] || businesses[0];

  // Total branches across all businesses
  const totalBranchesCount = businesses.reduce((acc, b) => {
    const locs = (b as any).locations || [];
    return acc + (locs.length || 1);
  }, 0);

  const getCategoryName = (biz: IBusiness): string => {
    if (biz.primaryCategory?.name) return biz.primaryCategory.name;
    if (Array.isArray(biz.categoryIds) && biz.categoryIds.length > 0) {
      const first = biz.categoryIds[0];
      if (typeof first === 'object' && (first as any)?.name) {
        return (first as any).name;
      }
      const found = categories.find((c) => c._id === String(first) || c.slug === String(first));
      if (found) return found.name;
    }
    return 'General Business';
  };

  const handleOpenEditModal = (biz: IBusiness) => {
    setEditingBusiness(biz);
    setEditName(biz.name || '');
    let initialCatId = '';
    if (Array.isArray(biz.categoryIds) && biz.categoryIds.length > 0) {
      const first = biz.categoryIds[0];
      initialCatId = typeof first === 'object' ? (first as any)._id : String(first);
    } else if (biz.primaryCategory?._id) {
      initialCatId = biz.primaryCategory._id;
    }
    setEditCategoryId(initialCatId);
    setEditDescription(biz.description || '');
    setEditShortDescription(biz.shortDescription || '');
    setEditCountryCode(biz.countryCode || biz.primaryLocation?.countryCode || 'PK');
    setEditCity(biz.primaryLocation?.city || '');
    setEditAddress(biz.primaryLocation?.addressLine1 || '');
    setEditPhone(biz.phone || biz.primaryLocation?.phone || '');
    setEditEmail(biz.contactEmail || biz.primaryLocation?.email || '');
    setEditWebsite(biz.website || '');
    setEditLogoUrl(biz.logoUrl || '');
    setEditFacebook(biz.socialLinks?.facebook || '');
    setEditInstagram(biz.socialLinks?.instagram || '');
    setEditLinkedin(biz.socialLinks?.linkedin || '');
    setEditError('');
    setEditSuccess('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    if (!editName.trim()) {
      setEditError('Business name is required.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    const payload: any = {
      name: editName.trim(),
      description: editDescription.trim(),
      shortDescription: editShortDescription.trim() || editDescription.trim().slice(0, 160),
      countryCode: (editCountryCode || 'PK').toUpperCase(),
      phone: editPhone.trim(),
      contactEmail: editEmail.trim(),
      website: editWebsite.trim(),
      logoUrl: editLogoUrl.trim(),
      socialLinks: {
        facebook: editFacebook.trim() || undefined,
        instagram: editInstagram.trim() || undefined,
        linkedin: editLinkedin.trim() || undefined,
      },
      primaryLocation: {
        addressLine1: editAddress.trim(),
        city: editCity.trim(),
        countryCode: (editCountryCode || 'PK').toUpperCase(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      },
    };

    if (editCategoryId) {
      payload.categoryIds = [editCategoryId];
    }

    const res = await fetchApi<IBusiness>(`/businesses/${editingBusiness._id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    setEditLoading(false);

    if (res.success && res.data) {
      const updated = res.data;
      setEditSuccess('Business listing updated successfully!');
      setActionNotice({
        type: 'success',
        message: `Listing "${editName}" was updated successfully.`,
      });
      // Update local state
      setBusinesses((prev) =>
        prev.map((b) => (b._id === editingBusiness._id ? { ...b, ...updated } : b))
      );
      setTimeout(() => {
        setEditingBusiness(null);
      }, 700);
    } else {
      setEditError(res.message || 'Failed to update business listing.');
    }
  };

  const handleOpenDeleteModal = (biz: IBusiness) => {
    setDeletingBusiness(biz);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingBusiness) return;
    setDeleteLoading(true);
    setDeleteError('');

    const res = await fetchApi(`/businesses/${deletingBusiness._id}`, {
      method: 'DELETE',
    });

    setDeleteLoading(false);

    if (res.success) {
      const deletedId = deletingBusiness._id;
      const deletedName = deletingBusiness.name;
      setBusinesses((prev) => prev.filter((b) => b._id !== deletedId));
      setSelectedBizIndex(0);
      setDeletingBusiness(null);
      setActionNotice({
        type: 'success',
        message: `Listing "${deletedName}" has been permanently deleted.`,
      });
    } else {
      setDeleteError(res.message || 'Failed to delete business listing.');
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/business/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForBranch) return;

    setBranchError('');
    setBranchSuccess('');
    setBranchLoading(true);

    const res = await fetchApi(`/businesses/${selectedBizForBranch._id}/locations`, {
      method: 'POST',
      body: JSON.stringify({
        branchName,
        countryCode: branchCountry,
        region: branchRegion || branchCity,
        city: branchCity,
        addressLine1: branchAddress,
        phone: branchPhone,
      }),
    });

    setBranchLoading(false);

    if (res.success) {
      setBranchSuccess(`Branch "${branchName}" added successfully.`);
      setBranchName('');
      setBranchCity('');
      setBranchRegion('');
      setBranchAddress('');
      setBranchPhone('');
      loadData();
    } else {
      setBranchError(res.message || 'Failed to add branch location.');
    }
  };

  // Get user initials for avatar
  const userInitials = (user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[#1D68F2] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading your Owner Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Welcome & Business Switcher Header (Exact layout from bizbranches.pk) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1D68F2] to-[#1248ab] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-900/20 shrink-0">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.name || 'Business Owner'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1D68F2] border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1D68F2]" />
                  Owner Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="font-medium text-slate-600">
                  {businesses.length} {businesses.length === 1 ? 'Business' : 'Businesses'} Registered
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Multi-business switcher if owner has more than 1 listing */}
            {businesses.length > 1 && (
              <div className="relative">
                <select
                  value={selectedBizIndex}
                  onChange={(e) => setSelectedBizIndex(Number(e.target.value))}
                  className="h-11 px-3.5 pr-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all border border-slate-300 outline-none cursor-pointer"
                >
                  {businesses.map((biz, idx) => (
                    <option key={biz._id} value={idx}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Business</span>
            </Link>

            <Link
              href="/claim-business"
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Claim Listing</span>
            </Link>
          </div>
        </div>

        {/* Empty State: No Listings Registered Yet (Matching bizbranches.pk 100%) */}
        {businesses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-12 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#1D68F2] flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">No Business Listings Linked Yet</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                You haven&apos;t registered or claimed any business listings on BizListPlace. List your business now to start receiving customer reviews, inquiries, and local leads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
              <Link
                href="/add-business"
                className="px-6 py-3.5 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Your Business Free</span>
              </Link>
              <Link
                href="/search"
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Search &amp; Claim Existing Listing</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Stat Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{businesses.length}</div>
                  <div className="text-xs font-semibold text-slate-500">Total Listings</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <GitBranch className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{totalBranchesCount}</div>
                  <div className="text-xs font-semibold text-slate-500">Branch Locations</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {businesses.filter((b) => b.listingStatus === 'published').length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Verified &amp; Published</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {businesses.filter((b) => b.listingStatus === 'pending').length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">Pending Moderation</div>
                </div>
              </div>
            </div>

            {/* Global Action Notification Toast */}
            {actionNotice && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                  actionNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2.5 font-medium">
                  {actionNotice.type === 'success' ? (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{actionNotice.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionNotice(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* My Businesses Section (Exact layout from user's requested specification) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  My Businesses
                </h2>
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs sm:text-sm shadow-xs transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New</span>
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {businesses.map((biz, idx) => {
                  const catName = getCategoryName(biz);
                  const isSelected = idx === selectedBizIndex;

                  return (
                    <div
                      key={biz._id}
                      className={`py-4 sm:py-5 flex items-center justify-between gap-4 transition-all rounded-2xl ${
                        isSelected
                          ? 'bg-blue-50/30 -mx-3 px-3 sm:-mx-4 sm:px-4'
                          : 'hover:bg-slate-50/70 -mx-3 px-3 sm:-mx-4 sm:px-4'
                      }`}
                    >
                      {/* Left: Logo + Info */}
                      <div
                        onClick={() => setSelectedBizIndex(idx)}
                        className="flex items-center gap-3.5 sm:gap-4 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <img
                            src={biz.logoUrl || '/images/biz_list_place_icon.jpg'}
                            alt={biz.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/biz_list_place_icon.jpg';
                            }}
                          />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-[#1D68F2] transition-colors truncate">
                              {biz.name}
                            </span>
                            {isSelected && (
                              <span className="hidden sm:inline-flex text-[10px] font-bold text-[#1D68F2] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                Active in Spotlight
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                              {catName}
                            </span>

                            {biz.listingStatus === 'published' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Published
                              </span>
                            ) : biz.listingStatus === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Action Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Edit Pencil + Delete Trash) */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(biz)}
                          title="Edit Business"
                          className="p-2 sm:p-2.5 text-slate-500 hover:text-[#1D68F2] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(biz)}
                          title="Delete Business"
                          className="p-2 sm:p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Business Spotlight Card */}
            {activeBusiness && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Business Top Meta */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D68F2] to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                        {activeBusiness.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                            {activeBusiness.name}
                          </h2>
                          {activeBusiness.listingStatus === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Published &amp; Verified
                            </span>
                          ) : activeBusiness.listingStatus === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Action Required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 flex-wrap">
                          <span>Slug: <code className="text-slate-700 font-mono">/business/{activeBusiness.slug}</code></span>
                          <span>•</span>
                          <span>Created: {new Date(activeBusiness.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href={`/business/${activeBusiness.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Public Page</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(activeBusiness)}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Business</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(activeBusiness)}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBizForBranch(activeBusiness)}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Branch Location</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Alerts */}
                  {activeBusiness.listingStatus === 'pending' && (
                    <div className="p-4 bg-amber-50/90 border border-amber-200 text-amber-950 rounded-2xl text-xs sm:text-sm flex items-start sm:items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="leading-relaxed">
                        <strong>This listing is currently pending review by our moderation team.</strong> It will be published publicly on BizListPlace once verified.
                      </div>
                    </div>
                  )}

                  {activeBusiness.listingStatus === 'rejected' && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl text-xs sm:text-sm space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Listing Moderation Feedback:
                      </div>
                      <p className="text-rose-900 leading-relaxed">
                        {activeBusiness.rejectionReason ||
                          'Please revise your listing details to ensure accurate company representation and valid operational premises.'}
                      </p>
                    </div>
                  )}

                  {/* Tab Navigation (Exact tabs inspired by bizbranches.pk: branches, reviews, growth) */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('branches')}
                      className={`dash-tab-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'branches'
                          ? 'bg-blue-50 text-[#1D68F2] shadow-xs border border-blue-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <GitBranch className="w-4 h-4" />
                      <span>Branches &amp; Locations ({(activeBusiness.locations || []).length || 1})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('reviews')}
                      className={`dash-tab-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'reviews'
                          ? 'bg-blue-50 text-[#1D68F2] shadow-xs border border-blue-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Reviews &amp; Community ({activeBusiness.reviewCount || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('growth')}
                      className={`dash-tab-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'growth'
                          ? 'bg-blue-50 text-[#1D68F2] shadow-xs border border-blue-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Growth &amp; Direct Share</span>
                    </button>
                  </div>

                  {/* TAB PANE 1: Branches & Locations */}
                  {activeTab === 'branches' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#1D68F2]" />
                          Operational Locations &amp; Branches
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSelectedBizForBranch(activeBusiness)}
                          className="text-xs font-bold text-[#1D68F2] hover:text-[#1756cb] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Branch</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {((activeBusiness.locations && activeBusiness.locations.length > 0)
                          ? activeBusiness.locations
                          : [
                              {
                                _id: `${activeBusiness._id}-hq`,
                                branchName: 'Headquarters',
                                countryCode: activeBusiness.countryCode || 'PK',
                                city: activeBusiness.primaryLocation?.city || 'Primary City',
                                region: activeBusiness.primaryLocation?.region || '',
                                addressLine1: activeBusiness.primaryLocation?.addressLine1 || 'Main Office',
                                phone: activeBusiness.phone,
                                isPrimary: true,
                              } as any,
                            ]
                        ).map((loc: IBusinessLocation, idx: number) => (
                          <div
                            key={loc._id || loc.branchSlug || `${activeBusiness._id}-loc-${idx}`}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span className="text-sm font-extrabold">{loc.branchName}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                {loc.countryCode || 'PK'}
                              </span>
                            </div>
                            <p className="text-slate-600 line-clamp-2">{loc.addressLine1}</p>
                            <div className="text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                              <span>{loc.city}{loc.region ? `, ${loc.region}` : ''}</span>
                              {loc.phone && <span>{loc.phone}</span>}
                            </div>
                          </div>
                        ))}

                        {/* Quick Add Branch Card */}
                        <button
                          type="button"
                          onClick={() => setSelectedBizForBranch(activeBusiness)}
                          className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1D68F2] bg-white hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-[#1D68F2] min-h-[110px] cursor-pointer"
                        >
                          <PlusCircle className="w-5 h-5" />
                          <span className="text-xs font-bold">Add Another Branch</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB PANE 2: Reviews & Community */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="text-center sm:text-left space-y-1">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rating</div>
                          <div className="text-3xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                            <span>{activeBusiness.ratingAverage || '5.0'}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</div>
                          <div className="text-3xl font-black text-slate-900">
                            {activeBusiness.reviewCount || 0}
                          </div>
                        </div>

                        <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response Rate</div>
                          <div className="text-3xl font-black text-[#1D68F2]">100%</div>
                        </div>
                      </div>

                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                        <Star className="w-10 h-10 text-amber-400 mx-auto fill-current" />
                        <h4 className="text-base font-bold text-slate-900">Customer Reviews &amp; Feedback</h4>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                          Share your direct listing link with clients to collect reviews. Positive reviews boost your Google rank and local trust!
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(activeBusiness.slug)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedLink ? 'Review Link Copied!' : 'Copy Review Link for Customers'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB PANE 3: Growth & Direct Share */}
                  {activeTab === 'growth' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-2xl border border-blue-200/80 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1D68F2] text-white flex items-center justify-center shrink-0">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900">Direct Public Share Link</h4>
                            <p className="text-xs text-slate-600">
                              Share your official listing profile link with customers, suppliers, and partners.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                          <input
                            type="text"
                            readOnly
                            value={typeof window !== 'undefined' ? `${window.location.origin}/business/${activeBusiness.slug}` : `/business/${activeBusiness.slug}`}
                            className="w-full h-11 px-4 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-700 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyLink(activeBusiness.slug)}
                            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#1D68F2] hover:bg-[#1756cb] text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
                          >
                            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>

                      {/* SEO Growth Tips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            Rank Higher on Local Search
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Adding accurate branch addresses, business hours, and phone numbers increases your crawl ranking and helps local customers find you quickly.
                          </p>
                        </div>

                        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <ShieldCheck className="w-4 h-4 text-[#1D68F2]" />
                            Verified Company Authority
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Keep your business information updated to maintain your verified owner badge and build long-term trust with buyers.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Submitted Ownership Claims Section */}
            {claims.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1D68F2]" />
                    <span>My Ownership Claims ({claims.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claims.map((claim) => (
                    <div
                      key={claim._id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {(claim.businessId as any)?.name || 'Business Listing'}
                        </h4>
                        <Badge
                          variant={
                            claim.status === 'approved'
                              ? 'verified'
                              : claim.status === 'pending'
                              ? 'pending'
                              : 'rejected'
                          }
                          className="capitalize text-[11px] font-bold"
                        >
                          {claim.status === 'pending' ? 'Pending Approval' : claim.status}
                        </Badge>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                        <div>Verification Email: <strong className="text-slate-800">{claim.businessEmail}</strong></div>
                        <div>Contact Phone: <strong className="text-slate-800">{claim.phone}</strong></div>
                        <div className="pt-1 flex items-center gap-1.5">
                          {claim.emailVerified ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Email Verified
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Email Pending Verification
                            </span>
                          )}
                        </div>
                      </div>

                      {claim.status === 'approved' && (
                        <p className="text-emerald-700 font-semibold text-[11px]">
                          ✓ Ownership approved! This business is now linked to your owner account.
                        </p>
                      )}

                      {claim.status === 'pending' && (
                        <p className="text-slate-500 text-[11px]">
                          Our directory administration team is reviewing your ownership credentials.
                        </p>
                      )}

                      {claim.status === 'rejected' && claim.rejectionReason && (
                        <p className="text-rose-700 text-[11px]">
                          Rejected: {claim.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Branch Location Modal */}
        {selectedBizForBranch && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Add Branch Location
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <strong>{selectedBizForBranch.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBizForBranch(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {branchSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{branchSuccess}</span>
                </div>
              )}

              {branchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{branchError}</span>
                </div>
              )}

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Gulberg Branch, Karachi Downtown"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country *
                    </label>
                    <CountrySelect
                      value={branchCountry}
                      onChange={(c) => {
                        setBranchCountry(c);
                        setBranchCity('');
                      }}
                      placeholder="Select Country"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <CitySelect
                      value={branchCity}
                      onChange={setBranchCity}
                      countryCode={branchCountry}
                      allowCustomInput
                      placeholder={branchCountry ? 'Select or type city...' : 'Select country first'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complete Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="e.g. Office #402, Business Bay, Lahore"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Phone Number
                  </label>
                  <input
                    type="tel"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBizForBranch(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={branchLoading}
                    className="px-5 py-2 text-xs font-bold bg-[#1D68F2] hover:bg-[#1756cb] text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {branchLoading ? 'Adding...' : 'Save Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Business Modal */}
        {editingBusiness && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center shrink-0">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Edit Business Listing
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update information for <strong>{editingBusiness.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Roshan Fabrics"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] bg-white cursor-pointer"
                    >
                      <option value="">Select a Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country *
                    </label>
                    <CountrySelect
                      value={editCountryCode}
                      onChange={(c) => {
                        setEditCountryCode(c);
                        setEditCity('');
                      }}
                      placeholder="Select Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <CitySelect
                      value={editCity}
                      onChange={setEditCity}
                      countryCode={editCountryCode}
                      allowCustomInput
                      placeholder={editCountryCode ? 'Select or type city...' : 'Select country first'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Complete Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Shop #12, Commercial Market, Lahore"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. info@business.com"
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Website
                    </label>
                    <input
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="e.g. https://www.example.com"
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={editLogoUrl}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    placeholder="e.g. https://example.com/logo.png"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Tagline / Summary
                  </label>
                  <input
                    type="text"
                    value={editShortDescription}
                    onChange={(e) => setEditShortDescription(e.target.value)}
                    placeholder="Brief 1-line business summary"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Detailed description of your products, services, and business history..."
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={editFacebook}
                      onChange={(e) => setEditFacebook(e.target.value)}
                      placeholder="facebook.com/..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      placeholder="instagram.com/..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      placeholder="linkedin.com/company/..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBusiness(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 text-xs font-bold bg-[#1D68F2] hover:bg-[#1756cb] text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingBusiness && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  Delete Business Listing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong>{deletingBusiness.name}</strong>? This action cannot be undone. All branches, reviews, and directory listings will be permanently deleted.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingBusiness(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
