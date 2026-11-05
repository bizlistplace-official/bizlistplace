'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { fetchApi } from '@/lib/api';
import {
  IBusiness,
  IClaimRequest,
  IReport,
  IAuditLog,
  IReview,
  IUser,
  INITIAL_CATEGORIES,
  POPULAR_COUNTRIES,
  USER_ROLES,
} from '@bizpockethub/shared';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Star,
  FileCheck2,
  Mail,
  History,
  AlertTriangle,
  Settings,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  LogOut,
  Search,
  Trash2,
  Send,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  UserX,
  Sparkles,
  Check,
  Download,
  BarChart3,
  Globe,
  ArrowRight,
  Menu,
  MoreHorizontal,
  X,
} from 'lucide-react';

export interface IAdminReportsData {
  totals: {
    totalBusinesses: number;
    publishedBusinesses: number;
    pendingBusinesses: number;
    rejectedBusinesses: number;
    suspendedBusinesses: number;
    totalUsers: number;
    totalReviews: number;
    totalClaims: number;
    pendingClaims: number;
  };
  businessesByCategory: Array<{
    _id: string;
    name: string;
    count: number;
  }>;
  businessesByCountry: Array<{
    countryCode: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    countryCode?: string;
    count: number;
  }>;
  businessesByMonth: Array<{
    month: string;
    count: number;
  }>;
  usersByMonth: Array<{
    month: string;
    count: number;
  }>;
  paymentsSummary: {
    totalVerified: number;
    totalPending: number;
    totalAmount: number;
    currency: string;
  };
  pendingAging: {
    submittedToday: number;
    waiting1to3Days: number;
    waiting3to7Days: number;
    waitingOver7Days: number;
    oldestPendingDays: number;
  };
  reviewsSummary: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
}

export interface IAdminSettings {
  _id?: string;
  ownerNotificationEmail: string;
  paymentSettings: {
    enabled: boolean;
    currency: string;
    listingFee: number;
    instructions: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdminStats {
  totalUsers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  publishedBusinesses: number;
  rejectedBusinesses?: number;
  pendingClaims?: number;
  openReports?: number;
  totalReviews: number;
}

export interface ISmtpStatus {
  success: boolean;
  message?: string;
  smtpConfig?: {
    host?: string;
    port?: number;
    secure?: boolean;
    fromUser?: string;
    fromName?: string;
  };
}

export interface IEmailStats {
  total: number;
  today: number;
}

export interface IEmailLogItem {
  _id: string;
  to: string;
  subject: string;
  type: 'manual' | 'spam' | 'unspam' | 'system';
  status: 'sent' | 'failed';
  sentBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
}

export interface IActivityLogItem {
  _id: string;
  actor?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetLabel?: string;
  details?: string;
  createdAt: string;
}

type SidebarSection =
  | 'dashboard'
  | 'businesses'
  | 'users'
  | 'payments'
  | 'reviews'
  | 'claims'
  | 'emails'
  | 'activity'
  | 'reports'
  | 'settings';

type AdminTab =
  | 'pending'
  | 'all'
  | 'payments'
  | 'reviews'
  | 'claims'
  | 'users'
  | 'emails'
  | 'activity';

const SIDEBAR_NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'businesses' as const, label: 'Businesses', icon: Building2 },
  { id: 'users' as const, label: 'Users', icon: Users },
  { id: 'payments' as const, label: 'Payments', icon: CreditCard },
  { id: 'reviews' as const, label: 'Reviews', icon: Star },
  { id: 'claims' as const, label: 'Claims', icon: FileCheck2 },
  { id: 'emails' as const, label: 'Emails', icon: Mail },
  { id: 'activity' as const, label: 'Activity', icon: History },
  { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Navigation State
  const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');

  // Phase 8: Mobile Drawer & Sheet Navigation States
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Phase 8: Escape Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsMoreSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real Data State
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<IBusiness[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<IBusiness[]>([]);
  const [claims, setClaims] = useState<IClaimRequest[]>([]);
  const [reports, setReports] = useState<IReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<ISmtpStatus | null>(null);

  // Loading & Feedback State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search (Phase 9)
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<string>('all');
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('all');
  const [businessCountryFilter, setBusinessCountryFilter] = useState<string>('all');
  const [businessCityFilter, setBusinessCityFilter] = useState<string>('all');

  const [pendingSearch, setPendingSearch] = useState('');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimsFilter, setClaimsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const [reviewSearch, setReviewSearch] = useState('');

  const [emailSearch, setEmailSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState<number>(1);
  const USERS_PER_PAGE = 10;

  // Role & Delete Modals (Phase 2)
  const [makeAdminModalUser, setMakeAdminModalUser] = useState<IUser | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<IUser | null>(null);
  const [deleteConfirmedCheckbox, setDeleteConfirmedCheckbox] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Spam Modal State (Phase 3)
  const [spamTargetUser, setSpamTargetUser] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [spamReasonInput, setSpamReasonInput] = useState('');
  const [isSubmittingSpam, setIsSubmittingSpam] = useState(false);

  // Test Email Tool State
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Phase 5: Email Stats & Logs State
  const [emailStats, setEmailStats] = useState<IEmailStats>({ total: 0, today: 0 });
  const [emailLogs, setEmailLogs] = useState<IEmailLogItem[]>([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [emailLogPage, setEmailLogPage] = useState(1);
  const [emailLogTotalPages, setEmailLogTotalPages] = useState(1);
  const [emailLogTotalCount, setEmailLogTotalCount] = useState(0);

  // Phase 5: Send Email Form State
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Phase 6: Activity Stream State
  const [activityLogs, setActivityLogs] = useState<IActivityLogItem[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [activityActionFilter, setActivityActionFilter] = useState<string>('all');
  const [activityLogPage, setActivityLogPage] = useState<number>(1);
  const [activityLogTotalPages, setActivityLogTotalPages] = useState<number>(1);
  const [activityLogTotalCount, setActivityLogTotalCount] = useState<number>(0);

  // Phase 6: Backup State
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);

  // Phase 7: Reports State
  const [reportsData, setReportsData] = useState<IAdminReportsData | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Phase 7: Settings State
  const [settingsData, setSettingsData] = useState<IAdminSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingEmailSetting, setSavingEmailSetting] = useState(false);
  const [savingPaymentSetting, setSavingPaymentSetting] = useState(false);

  // Settings Form Inputs (from loaded settings only, never hardcoded)
  const [ownerEmailInput, setOwnerEmailInput] = useState('');
  const [paymentFeeEnabled, setPaymentFeeEnabled] = useState(false);
  const [paymentCurrencyInput, setPaymentCurrencyInput] = useState('USD');
  const [paymentFeeAmountInput, setPaymentFeeAmountInput] = useState('0');
  const [paymentInstructionsInput, setPaymentInstructionsInput] = useState('');

  // Master Data Loader
  const loadAdminData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    try {
      const [
        statsRes,
        pendingRes,
        allRes,
        claimsRes,
        reportsRes,
        logsRes,
        reviewsRes,
        usersRes,
        smtpRes,
        emailStatsRes,
        emailLogsRes,
        activityLogsRes,
        settingsRes,
      ] = await Promise.all([
        fetchApi<IAdminStats>('/admin/stats'),
        fetchApi<IBusiness[]>('/admin/businesses/pending'),
        fetchApi<IBusiness[]>('/admin/businesses'),
        fetchApi<IClaimRequest[]>('/admin/claims'),
        fetchApi<IAdminReportsData>('/admin/reports'),
        fetchApi<IAuditLog[]>('/admin/audit-logs'),
        fetchApi<IReview[]>('/admin/reviews'),
        fetchApi<IUser[]>('/admin/users'),
        fetchApi<ISmtpStatus>('/admin/verify-smtp'),
        fetchApi<IEmailStats>('/admin/emails/stats'),
        fetchApi<{ data: IEmailLogItem[]; pagination: any }>('/admin/emails/log?page=1&limit=10'),
        fetchApi<{ data: IActivityLogItem[]; pagination: any }>('/admin/activity-log?page=1&limit=15'),
        fetchApi<IAdminSettings>('/admin/settings'),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (pendingRes.success && Array.isArray(pendingRes.data)) setPendingBusinesses(pendingRes.data);
      if (allRes.success && Array.isArray(allRes.data)) setAllBusinesses(allRes.data);
      if (claimsRes.success && Array.isArray(claimsRes.data)) setClaims(claimsRes.data);
      if (reportsRes.success && reportsRes.data) {
        setReportsData(reportsRes.data as any);
      }
      if (logsRes.success && Array.isArray(logsRes.data)) setAuditLogs(logsRes.data);
      if (reviewsRes.success && Array.isArray(reviewsRes.data)) setReviews(reviewsRes.data);
      if (usersRes.success && Array.isArray(usersRes.data)) setUsersList(usersRes.data);
      if (smtpRes.success && smtpRes.data) setSmtpStatus(smtpRes.data);
      if (emailStatsRes.success && emailStatsRes.data) setEmailStats(emailStatsRes.data);
      if (emailLogsRes.success && Array.isArray(emailLogsRes.data)) {
        setEmailLogs(emailLogsRes.data);
        if (emailLogsRes.pagination) {
          setEmailLogPage(emailLogsRes.pagination.page);
          setEmailLogTotalPages(emailLogsRes.pagination.totalPages);
          setEmailLogTotalCount(emailLogsRes.pagination.total);
        }
      }
      if (activityLogsRes.success && Array.isArray(activityLogsRes.data)) {
        setActivityLogs(activityLogsRes.data);
        if (activityLogsRes.pagination) {
          setActivityLogPage(activityLogsRes.pagination.page);
          setActivityLogTotalPages(activityLogsRes.pagination.totalPages);
          setActivityLogTotalCount(activityLogsRes.pagination.total);
        }
      }
      if (settingsRes.success && settingsRes.data) {
        const s = settingsRes.data as IAdminSettings;
        setSettingsData(s);
        setOwnerEmailInput(s.ownerNotificationEmail || '');
        setPaymentFeeEnabled(!!s.paymentSettings?.enabled);
        setPaymentCurrencyInput(s.paymentSettings?.currency || 'USD');
        setPaymentFeeAmountInput(String(s.paymentSettings?.listingFee ?? 0));
        setPaymentInstructionsInput(s.paymentSettings?.instructions || '');
      }
    } catch (err: any) {
      console.error('Failed to load admin dataset:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Phase 7: Fetch Reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetchApi<IAdminReportsData>('/admin/reports');
      if (res.success && res.data) {
        setReportsData(res.data);
      }
    } catch (err: any) {
      console.error('[FETCH REPORTS ERROR]:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Phase 7: Fetch Settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetchApi<IAdminSettings>('/admin/settings');
      if (res.success && res.data) {
        setSettingsData(res.data);
        setOwnerEmailInput(res.data.ownerNotificationEmail || '');
        setPaymentFeeEnabled(!!res.data.paymentSettings?.enabled);
        setPaymentCurrencyInput(res.data.paymentSettings?.currency || 'USD');
        setPaymentFeeAmountInput(String(res.data.paymentSettings?.listingFee ?? 0));
        setPaymentInstructionsInput(res.data.paymentSettings?.instructions || '');
      }
    } catch (err: any) {
      console.error('[FETCH SETTINGS ERROR]:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Phase 7: Save Owner Notification Email
  const handleSaveNotificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ownerEmailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setActionFeedback({ type: 'error', message: 'Please enter a valid notification email address.' });
      return;
    }

    setSavingEmailSetting(true);
    try {
      const res = await fetchApi<IAdminSettings>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ ownerNotificationEmail: trimmed }),
      });
      if (res.success && res.data) {
        setActionFeedback({ type: 'success', message: 'Owner notification email updated successfully.' });
        await fetchSettings();
      } else {
        setActionFeedback({ type: 'error', message: res.message || 'Failed to update notification email.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err?.message || 'Error updating notification email.' });
    } finally {
      setSavingEmailSetting(false);
    }
  };

  // Phase 7: Save Payment Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(paymentFeeAmountInput);
    if (isNaN(fee) || fee < 0) {
      setActionFeedback({ type: 'error', message: 'Listing fee must be a non-negative number.' });
      return;
    }

    setSavingPaymentSetting(true);
    try {
      const res = await fetchApi<IAdminSettings>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          paymentSettings: {
            enabled: paymentFeeEnabled,
            currency: paymentCurrencyInput.trim().toUpperCase() || 'USD',
            listingFee: fee,
            instructions: paymentInstructionsInput.trim(),
          },
        }),
      });
      if (res.success && res.data) {
        setActionFeedback({ type: 'success', message: 'Payment settings updated successfully.' });
        await fetchSettings();
      } else {
        setActionFeedback({ type: 'error', message: res.message || 'Failed to update payment settings.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err?.message || 'Error updating payment settings.' });
    } finally {
      setSavingPaymentSetting(false);
    }
  };

  // Strict Admin Authorization Check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        loadAdminData();
      }
    }
  }, [user, authLoading, router, loadAdminData]);

  // Escape key cancels modals with no API call
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMakeAdminModalUser(null);
        setDeleteModalUser(null);
        setDeleteConfirmedCheckbox(false);
        setSpamTargetUser(null);
        setSpamReasonInput('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Sign Out
  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  // Business Actions
  const handleApproveBusiness = async (id: string, name: string) => {
    const res = await fetchApi(`/admin/businesses/${id}/approve`, { method: 'PATCH' });
    if (res.success) {
      setActionFeedback({ type: 'success', message: `Listing "${name}" has been approved and published.` });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to approve listing.' });
    }
  };

  const handleRejectBusiness = async (id: string, name: string) => {
    const reason = window.prompt(`Specify rejection reason for "${name}":`);
    if (!reason || !reason.trim()) return;

    const res = await fetchApi(`/admin/businesses/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason.trim() }),
    });
    if (res.success) {
      setActionFeedback({ type: 'success', message: `Listing "${name}" has been marked as rejected.` });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to reject listing.' });
    }
  };

  const handleToggleFeatured = async (id: string, name: string) => {
    const res = await fetchApi(`/admin/businesses/${id}/toggle-featured`, { method: 'PATCH' });
    if (res.success) {
      setActionFeedback({ type: 'success', message: `Updated featured status for "${name}".` });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to toggle featured status.' });
    }
  };

  // Claim Actions
  const handleApproveClaim = async (claimId: string) => {
    const res = await fetchApi(`/admin/claims/${claimId}/approve`, { method: 'PATCH' });
    if (res.success) {
      setActionFeedback({ type: 'success', message: 'Claim approved. Business ownership transferred to claimant.' });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to approve claim.' });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const reason = window.prompt('Specify reason for rejecting this claim request:');
    if (!reason || !reason.trim()) return;

    const res = await fetchApi(`/admin/claims/${claimId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason: reason.trim() }),
    });
    if (res.success) {
      setActionFeedback({ type: 'success', message: 'Claim request has been rejected.' });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to reject claim.' });
    }
  };

  // Review Actions
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    const res = await fetchApi(`/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.success) {
      setActionFeedback({ type: 'success', message: 'Customer review deleted.' });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to delete review.' });
    }
  };

  // User Actions
  const handleToggleUserStatus = async (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${nextStatus} the account for "${name}"?`)) return;

    const res = await fetchApi(`/admin/users/${id}/toggle-status`, { method: 'PATCH' });
    if (res.success) {
      setActionFeedback({ type: 'success', message: `Account status updated for "${name}".` });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to update user account status.' });
    }
  };

  // Make Admin Action (confirmed via modal)
  const handleConfirmMakeAdmin = async () => {
    if (!makeAdminModalUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await fetchApi(`/admin/users/${makeAdminModalUser._id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `Full administrative access granted to "${makeAdminModalUser.name}".`,
        });
        setMakeAdminModalUser(null);
        loadAdminData(true);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to update user role to administrator.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error executing administrative role update.',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Make Sub-Admin Action (runs immediately with no dialog change)
  const handleMakeSubAdmin = async (targetUser: IUser) => {
    try {
      const res = await fetchApi(`/admin/users/${targetUser._id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'sub_admin' }),
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `User "${targetUser.name}" has been granted Sub-Admin privileges.`,
        });
        loadAdminData(true);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to update user role to sub-admin.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error updating user role.',
      });
    }
  };

  // Delete User Action (confirmed via dialog with required checkbox)
  const handleConfirmDeleteUser = async () => {
    if (!deleteModalUser || !deleteConfirmedCheckbox) return;
    setIsDeletingUser(true);
    try {
      const res = await fetchApi(`/admin/users/${deleteModalUser._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: res.message || `User "${deleteModalUser.name}" and associated records deleted permanently.`,
        });
        setDeleteModalUser(null);
        setDeleteConfirmedCheckbox(false);
        loadAdminData(true);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to delete user account.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error executing user deletion.',
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Flag User as Spam (Phase 3)
  const handleConfirmSpamUser = async () => {
    if (!spamTargetUser || !spamReasonInput.trim()) return;
    if (spamReasonInput.trim().length > 200) {
      setActionFeedback({ type: 'error', message: 'Spam reason must be 200 characters or fewer.' });
      return;
    }

    setIsSubmittingSpam(true);
    try {
      const res = await fetchApi(`/admin/users/${spamTargetUser.id}/spam`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: spamReasonInput.trim() }),
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `User "${spamTargetUser.name}" has been flagged as spam and their approved listings hidden.`,
        });
        setSpamTargetUser(null);
        setSpamReasonInput('');
        loadAdminData(true);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to flag user as spam.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error flagging user as spam.',
      });
    } finally {
      setIsSubmittingSpam(false);
    }
  };

  // Un-spam User (Phase 3)
  const handleUnspamUser = async (userId: string, userName: string) => {
    try {
      const res = await fetchApi(`/admin/users/${userId}/unspam`, {
        method: 'PATCH',
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: `User "${userName}" has been un-spammed and their hidden listings restored.`,
        });
        loadAdminData(true);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to un-spam user.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error un-spamming user.',
      });
    }
  };

  // Report Actions
  const handleResolveReport = async (id: string) => {
    const res = await fetchApi(`/admin/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved' }),
    });
    if (res.success) {
      setActionFeedback({ type: 'success', message: 'Report status updated to resolved.' });
      loadAdminData(true);
    } else {
      setActionFeedback({ type: 'error', message: res.message || 'Failed to resolve report.' });
    }
  };

  // Email Test Dispatch
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) return;

    setSendingTestEmail(true);
    try {
      const res = await fetchApi('/admin/test-email', {
        method: 'POST',
        body: JSON.stringify({ toEmail: testEmailRecipient.trim() }),
      });
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message || `Test email dispatched to ${testEmailRecipient}.` });
        setTestEmailRecipient('');
      } else {
        setActionFeedback({ type: 'error', message: res.message || 'Failed to send test email.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err?.message || 'Error executing email test.' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Phase 5: Email Handlers
  const loadEmailLogs = useCallback(async (pageToLoad = 1) => {
    setEmailLogsLoading(true);
    try {
      const res = await fetchApi<{
        data: IEmailLogItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/admin/emails/log?page=${pageToLoad}&limit=10`);
      if (res?.success && res.data) {
        setEmailLogs(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) {
          setEmailLogPage(res.pagination.page);
          setEmailLogTotalPages(res.pagination.totalPages);
          setEmailLogTotalCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setEmailLogsLoading(false);
    }
  }, []);

  const loadEmailStats = useCallback(async () => {
    try {
      const res = await fetchApi<IEmailStats>('/admin/emails/stats');
      if (res?.success && res.data) {
        setEmailStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load email stats:', err);
    }
  }, []);

  const handleEmailLogPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > emailLogTotalPages) return;
    loadEmailLogs(newPage);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTo = emailTo.trim();
    const trimmedSubject = emailSubject.trim();
    const trimmedMessage = emailMessage.trim();

    if (!trimmedTo || !trimmedSubject || !trimmedMessage) {
      setActionFeedback({ type: 'error', message: 'All email fields (To, Subject, Message) are required.' });
      return;
    }
    if (trimmedSubject.length > 200) {
      setActionFeedback({ type: 'error', message: 'Subject must not exceed 200 characters.' });
      return;
    }
    if (trimmedMessage.length > 5000) {
      setActionFeedback({ type: 'error', message: 'Message must not exceed 5000 characters.' });
      return;
    }
    if (trimmedTo.includes(',') || trimmedTo.includes(';') || /\s/.test(trimmedTo)) {
      setActionFeedback({ type: 'error', message: 'Only a single recipient email address is permitted. Bulk sending is disabled.' });
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetchApi('/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: trimmedTo,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: res.message || `Email successfully dispatched to ${trimmedTo}.`,
        });
        setEmailTo('');
        setEmailSubject('');
        setEmailMessage('');
        loadEmailStats();
        loadEmailLogs(1);
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message || 'Failed to dispatch email.',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error occurred while dispatching email.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Phase 6: Activity Stream & Backup Handlers
  const loadActivityLogs = useCallback(async (pageToLoad = 1, filterAction = activityActionFilter) => {
    setActivityLogsLoading(true);
    try {
      const actionQuery = filterAction && filterAction !== 'all' ? `&action=${encodeURIComponent(filterAction)}` : '';
      const res = await fetchApi<{
        data: IActivityLogItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/admin/activity-log?page=${pageToLoad}&limit=15${actionQuery}`);

      if (res?.success && res.data) {
        setActivityLogs(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) {
          setActivityLogPage(res.pagination.page);
          setActivityLogTotalPages(res.pagination.totalPages);
          setActivityLogTotalCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setActivityLogsLoading(false);
    }
  }, [activityActionFilter]);

  const handleActivityFilterChange = (newAction: string) => {
    setActivityActionFilter(newAction);
    setActivityLogPage(1);
    loadActivityLogs(1, newAction);
  };

  const handleActivityPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > activityLogTotalPages) return;
    loadActivityLogs(newPage, activityActionFilter);
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('biz_auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/admin/export`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let errMsg = 'Failed to generate backup.';
        try {
          const errJson = await res.json();
          errMsg = errJson.message || errMsg;
        } catch {}
        setActionFeedback({ type: 'error', message: errMsg });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `bizlistplace-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setActionFeedback({
        type: 'success',
        message: 'Database backup downloaded successfully.',
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error occurred while downloading backup.',
      });
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  // Sorted Pending Businesses (oldest first: createdAt ascending, with client-side search)
  const sortedPendingBusinesses = useMemo(() => {
    const q = pendingSearch.trim().toLowerCase();
    const sorted = [...pendingBusinesses].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (!q) return sorted;
    return sorted.filter((biz) => {
      const owner = (biz.ownerId as any) || {};
      const nameMatch = biz.name?.toLowerCase().includes(q);
      const slugMatch = biz.slug?.toLowerCase().includes(q);
      const ownerNameMatch = owner.name?.toLowerCase().includes(q);
      const ownerEmailMatch = owner.email?.toLowerCase().includes(q);
      const descMatch = biz.description?.toLowerCase().includes(q);
      return nameMatch || slugMatch || ownerNameMatch || ownerEmailMatch || descMatch;
    });
  }, [pendingBusinesses, pendingSearch]);

  // Available cities based on selected country
  const availableCities = useMemo(() => {
    if (businessCountryFilter === 'all') {
      const citySet = new Set<string>();
      POPULAR_COUNTRIES.forEach((c) => {
        c.popularCities.forEach((pc) => citySet.add(pc.name));
      });
      return Array.from(citySet).sort();
    }
    const country = POPULAR_COUNTRIES.find(
      (c) => c.code.toUpperCase() === businessCountryFilter.toUpperCase()
    );
    return country ? country.popularCities.map((pc) => pc.name).sort() : [];
  }, [businessCountryFilter]);

  // Filtered All Businesses (search + category + country + city + status)
  const filteredAllBusinesses = useMemo(() => {
    const q = businessSearch.trim().toLowerCase();
    return allBusinesses.filter((biz) => {
      const matchesSearch =
        !q ||
        biz.name?.toLowerCase().includes(q) ||
        biz.slug?.toLowerCase().includes(q) ||
        biz.description?.toLowerCase().includes(q) ||
        biz.contactEmail?.toLowerCase().includes(q);

      const matchesStatus =
        businessStatusFilter === 'all' || biz.listingStatus === businessStatusFilter;

      const matchesCategory =
        businessCategoryFilter === 'all' ||
        biz.categoryIds?.some((c: any) => {
          if (!c) return false;
          if (typeof c === 'string') return c === businessCategoryFilter;
          return (
            c.slug === businessCategoryFilter ||
            c.name?.toLowerCase() === businessCategoryFilter.toLowerCase()
          );
        });

      const matchesCountry =
        businessCountryFilter === 'all' ||
        (biz.countryCode && biz.countryCode.toUpperCase() === businessCountryFilter.toUpperCase());

      const matchesCity =
        businessCityFilter === 'all' ||
        ((biz as any).city && (biz as any).city.toLowerCase() === businessCityFilter.toLowerCase()) ||
        (biz.serviceAreas &&
          biz.serviceAreas.some((sa: string) =>
            sa.toLowerCase().includes(businessCityFilter.toLowerCase())
          ));

      return matchesSearch && matchesStatus && matchesCategory && matchesCountry && matchesCity;
    });
  }, [
    allBusinesses,
    businessSearch,
    businessStatusFilter,
    businessCategoryFilter,
    businessCountryFilter,
    businessCityFilter,
  ]);

  // Filtered Claims (client-side search & status filter)
  const filteredClaims = useMemo(() => {
    const q = claimSearch.trim().toLowerCase();
    return claims.filter((claim) => {
      const matchesStatus = claimsFilter === 'all' || claim.status === claimsFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const bizName = (claim.businessId as any)?.name?.toLowerCase() || '';
      const claimantName = (claim.fullName || (claim.claimantId as any)?.name || '').toLowerCase();
      const claimantEmail = (claim.businessEmail || (claim.claimantId as any)?.email || '').toLowerCase();
      const phone = (claim.phone || '').toLowerCase();
      const notes = (claim.notes || '').toLowerCase();
      return (
        bizName.includes(q) ||
        claimantName.includes(q) ||
        claimantEmail.includes(q) ||
        phone.includes(q) ||
        notes.includes(q)
      );
    });
  }, [claims, claimsFilter, claimSearch]);

  // Filtered Reviews (client-side search)
  const filteredReviews = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => {
      const bizName = (r.businessId as any)?.name?.toLowerCase() || '';
      const author = (r.authorName || (r.userId as any)?.name || '').toLowerCase();
      const title = (r.title || '').toLowerCase();
      const content = (r.content || '').toLowerCase();
      return (
        bizName.includes(q) ||
        author.includes(q) ||
        title.includes(q) ||
        content.includes(q)
      );
    });
  }, [reviews, reviewSearch]);

  // Filtered Email Logs (client-side search)
  const filteredEmailLogs = useMemo(() => {
    const q = emailSearch.trim().toLowerCase();
    if (!q) return emailLogs;
    return emailLogs.filter((log) => {
      return (
        log.to?.toLowerCase().includes(q) ||
        log.subject?.toLowerCase().includes(q) ||
        log.type?.toLowerCase().includes(q) ||
        log.status?.toLowerCase().includes(q)
      );
    });
  }, [emailLogs, emailSearch]);

  // Filtered Activity Logs (client-side search)
  const filteredActivityLogs = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return activityLogs;
    return activityLogs.filter((log) => {
      const actor = (log.actorName || log.actor?.name || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const targetType = (log.targetType || '').toLowerCase();
      const targetLabel = (log.targetLabel || log.targetId || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      return (
        actor.includes(q) ||
        action.includes(q) ||
        targetType.includes(q) ||
        targetLabel.includes(q) ||
        details.includes(q)
      );
    });
  }, [activityLogs, activitySearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        !userSearch.trim() ||
        u.name.toLowerCase().includes(userSearch.toLowerCase().trim()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase().trim());

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

  // Sidebar selection handler
  const handleSidebarClick = (section: SidebarSection) => {
    setActiveSection(section);
    setIsMobileDrawerOpen(false);
    setIsMoreSheetOpen(false);
    if (section === 'dashboard') {
      setActiveTab('pending');
    } else if (section === 'businesses') {
      setActiveTab('all');
    } else if (section === 'users') {
      setActiveTab('users');
    } else if (section === 'payments') {
      setActiveTab('payments');
    } else if (section === 'reviews') {
      setActiveTab('reviews');
    } else if (section === 'claims') {
      setActiveTab('claims');
    } else if (section === 'emails') {
      setActiveTab('emails');
    } else if (section === 'activity') {
      setActiveTab('activity');
    } else if (section === 'reports') {
      if (!reportsData) fetchReports();
    } else if (section === 'settings') {
      if (!settingsData) fetchSettings();
    }
  };

  // 1. Loading Guard
  if (authLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-[#1D68F2] animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Authenticating administrator access...
        </p>
      </div>
    );
  }

  // 2. Non-Admin Security Gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[550px] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You must be signed in with an authorized administrative account to access the administrative portal. Non-administrator access is restricted.
          </p>
          <div className="pt-2">
            <Link
              href="/login?redirect=/admin"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#1D68F2] text-white text-xs font-bold hover:bg-[#1557D0] transition-colors"
            >
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 pb-24 md:pb-8 w-full max-w-full overflow-x-hidden">
      <div className="md:grid md:grid-cols-[72px_1fr] lg:grid-cols-[240px_1fr] gap-4 lg:gap-6 items-start">
        {/* ========================================================= */}
        {/* DESKTOP & TABLET SIDEBAR                                  */}
        {/* ========================================================= */}
        <aside className="hidden md:flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-2.5 lg:p-4 sticky top-24 min-h-[580px]">
          <div className="space-y-6">
            {/* Sidebar Brand Header */}
            <div className="flex items-center justify-center lg:justify-start gap-3 px-1 lg:px-2 py-2 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0" title="Admin Portal">
                <Shield className="w-4 h-4" />
              </div>
              <div className="hidden lg:block min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate">Admin Portal</h2>
                <p className="text-[11px] text-slate-400 font-medium truncate">Directory Governance</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {SIDEBAR_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => handleSidebarClick(item.id)}
                    className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="hidden lg:inline truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Action: View Website */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="View Website"
              className="flex items-center justify-center lg:justify-between px-2 lg:px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1D68F2] hover:bg-blue-50/80 transition-all group min-h-[44px]"
            >
              <span className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#1D68F2] shrink-0" />
                <span className="hidden lg:inline">View Website</span>
              </span>
              <ArrowUpRight className="hidden lg:inline w-3.5 h-3.5 text-slate-400 group-hover:text-[#1D68F2] shrink-0" />
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN ADMIN CONTENT PANE                                   */}
        {/* ========================================================= */}
        <div className="space-y-6 min-w-0">
          {/* TOP AREA: Admin Name, Role, Refresh & Sign Out */}
          <header className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
                aria-label="Open admin navigation menu"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    Administrative Session
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
                  {activeSection === 'reports'
                    ? 'Platform Reports & Analytics'
                    : activeSection === 'settings'
                    ? 'Platform & Payment Settings'
                    : 'Moderation & Governance'}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Admin Identity Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs min-h-[44px]">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="text-left min-w-0">
                  <div className="font-bold text-slate-800 leading-tight truncate max-w-[120px] sm:max-w-[140px]">
                    {user.name}
                  </div>
                  <span className="inline-block text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Administrator
                  </span>
                </div>
              </div>

              {/* Download Backup Action (Phase 6, main admin only) */}
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isDownloadingBackup}
                  title="Download full JSON database snapshot"
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs min-h-[44px]"
                >
                  {isDownloadingBackup ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="hidden sm:inline">Preparing backup…</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download Backup</span>
                    </>
                  )}
                </button>
              )}

              {/* Refresh Action */}
              <button
                type="button"
                onClick={() => loadAdminData(false)}
                disabled={refreshing}
                title="Refresh real metrics"
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#1D68F2]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Sign Out Action */}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* Action Feedback Notification */}
          {actionFeedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in-0 duration-150 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              <span>{actionFeedback.message}</span>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="font-bold px-2 py-0.5 rounded hover:bg-black/5"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* DASHBOARD VIEW: 5 REAL STAT CARDS                         */}
          {/* ========================================================= */}
          {activeSection !== 'reports' && activeSection !== 'settings' && (
            <>
              {/* 5 Real Stat Cards */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {/* 1. Total Users */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total Users
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats ? stats.totalUsers : <span className="text-slate-300 animate-pulse">--</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Registered accounts</p>
                </div>

                {/* 2. Total Businesses */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total Businesses
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats ? stats.totalBusinesses : <span className="text-slate-300 animate-pulse">--</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">All directory listings</p>
                </div>

                {/* 3. Pending */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      Pending
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-600">
                    {stats ? stats.pendingBusinesses : <span className="text-slate-300 animate-pulse">--</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Awaiting review</p>
                </div>

                {/* 4. Approved */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      Approved
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {stats ? stats.publishedBusinesses : <span className="text-slate-300 animate-pulse">--</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Published & live</p>
                </div>

                {/* 5. Reviews */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs space-y-2 col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                      Reviews
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats ? stats.totalReviews : <span className="text-slate-300 animate-pulse">--</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Customer reviews</p>
                </div>
              </section>

              {/* ===================================================== */}
              {/* 8 TABS IN EXACT SPECIFIED ORDER                       */}
              {/* 1. Pending                                            */}
              {/* 2. All Businesses                                     */}
              {/* 3. Payments                                           */}
              {/* 4. Reviews                                            */}
              {/* 5. Claim Requests                                     */}
              {/* 6. Users                                              */}
              {/* 7. Emails                                             */}
              {/* 8. Activity                                           */}
              {/* ===================================================== */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-6">
                {/* Tab Navigation Strip */}
                <div className="border-b border-slate-100 flex items-center gap-2 sm:gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none pb-2 text-xs font-bold w-full max-w-full">
                  {[
                    { id: 'pending' as const, label: 'Pending', count: pendingBusinesses.length },
                    { id: 'all' as const, label: 'All Businesses', count: allBusinesses.length },
                    { id: 'payments' as const, label: 'Payments', count: 0 },
                    { id: 'reviews' as const, label: 'Reviews', count: reviews.length },
                    { id: 'claims' as const, label: 'Claim Requests', count: claims.length },
                    { id: 'users' as const, label: 'Users', count: usersList.length },
                    { id: 'emails' as const, label: 'Emails', count: null },
                    { id: 'activity' as const, label: 'Activity', count: auditLogs.length },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[44px] ${
                          isActive
                            ? 'border-[#1D68F2] text-[#1D68F2]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== null && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-[#1D68F2]/10 text-[#1D68F2]' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* --------------------------------------------------- */}
                {/* TAB 1: PENDING                                      */}
                {/* --------------------------------------------------- */}
                {activeTab === 'pending' && (
                  <div className="space-y-4">
                    {/* Pending Search Input */}
                    <div className="relative max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={pendingSearch}
                        onChange={(e) => setPendingSearch(e.target.value)}
                        placeholder="Search pending submissions..."
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                      />
                    </div>

                    {sortedPendingBusinesses.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <div className="font-bold text-slate-800 text-sm">
                          {pendingSearch.trim() ? 'No Matching Submissions' : 'No Pending Submissions'}
                        </div>
                        <p className="text-slate-500">
                          {pendingSearch.trim()
                            ? 'No pending listings match your current search query.'
                            : 'There are currently no listings waiting in the moderation review queue.'}
                        </p>
                      </div>
                    ) : (
                      sortedPendingBusinesses.map((biz) => {
                        const owner = (biz.ownerId as any) || {};
                        const isOwnerSpam = Boolean(owner.isSpam);
                        const isMainAdmin = user?.role === 'admin';

                        // Waiting days badge calculation
                        const createdMs = new Date(biz.createdAt).getTime();
                        const diffDays = Math.floor((Date.now() - createdMs) / (1000 * 60 * 60 * 24));
                        let waitingText = 'Submitted today';
                        let waitingClass = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (diffDays >= 1) {
                          waitingText = `Waiting ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
                          if (diffDays >= 7) {
                            waitingClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                          } else if (diffDays >= 3) {
                            waitingClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
                          } else {
                            waitingClass = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
                          }
                        }

                        // Payment status badge
                        const pStatus = ((biz as any).paymentStatus || 'none').toLowerCase();
                        const paymentVariant =
                          pStatus === 'verified'
                            ? 'verified'
                            : pStatus === 'pending'
                            ? 'pending'
                            : pStatus === 'rejected'
                            ? 'rejected'
                            : 'outline';

                        return (
                          <div
                            key={biz._id}
                            className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                              isOwnerSpam ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-bold text-slate-900">{biz.name}</h3>

                                  {/* Waiting Days Badge */}
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${waitingClass}`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>{waitingText}</span>
                                  </span>

                                  {/* Payment Status Badge */}
                                  <Badge variant={paymentVariant} className="capitalize text-[11px] font-bold">
                                    Payment: {pStatus === 'none' ? 'None' : pStatus}
                                  </Badge>

                                  {/* Spam Badge */}
                                  {isOwnerSpam && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Spam: {owner.spamReason || 'Flagged'}</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500">
                                  Submitted by:{' '}
                                  <strong className="text-slate-700">
                                    {owner.name || 'User'}
                                  </strong>{' '}
                                  ({owner.email || 'N/A'}) • {new Date(biz.createdAt).toLocaleString()}
                                </p>
                              </div>

                              {/* Action Buttons: Approve, Reject, Edit, Spam/Un-spam */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Approve & Publish Button */}
                                <button
                                  type="button"
                                  disabled={isOwnerSpam}
                                  onClick={() => handleApproveBusiness(biz._id, biz.name)}
                                  className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs min-h-[44px] ${
                                    isOwnerSpam
                                      ? 'bg-slate-300 cursor-not-allowed opacity-60'
                                      : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                                  }`}
                                  title={isOwnerSpam ? 'Cannot approve: User is flagged as spam' : 'Approve & Publish'}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve &amp; Publish</span>
                                </button>

                                {/* Reject Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRejectBusiness(biz._id, biz.name)}
                                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>

                                {/* Edit Button */}
                                <Link
                                  href={`/add-business?edit=${biz._id}`}
                                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[44px]"
                                >
                                  <span>Edit</span>
                                </Link>

                                {/* Spam / Un-spam Button (Main Admin Only) */}
                                {isMainAdmin && owner._id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isOwnerSpam) {
                                        handleUnspamUser(owner._id, owner.name);
                                      } else {
                                        setSpamTargetUser({
                                          id: owner._id,
                                          name: owner.name,
                                          email: owner.email,
                                        });
                                        setSpamReasonInput('');
                                      }
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border min-h-[44px] ${
                                      isOwnerSpam
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                    }`}
                                    title={isOwnerSpam ? 'Remove spam flag from owner' : 'Flag user as spam'}
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>{isOwnerSpam ? 'Un-spam' : 'Spam'}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed">
                              {biz.description}
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                              {biz.website && (
                                <span>
                                  Website:{' '}
                                  <a
                                    href={biz.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#1D68F2] hover:underline"
                                  >
                                    {biz.website}
                                  </a>
                                </span>
                              )}
                              {biz.contactEmail && <span>Email: {biz.contactEmail}</span>}
                              {biz.phone && <span>Phone: {biz.phone}</span>}
                              {biz.countryCode && (
                                <span className="font-bold text-slate-700">Country: {biz.countryCode}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 2: ALL BUSINESSES                               */}
                {/* --------------------------------------------------- */}
                {activeTab === 'all' && (
                  <div className="space-y-4">
                    {/* Search & Filter Toolbar (Search + Category + Country + City + Status) */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={businessSearch}
                            onChange={(e) => setBusinessSearch(e.target.value)}
                            placeholder="Search name, slug, email..."
                            className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                          />
                        </div>

                        {/* Category Dropdown */}
                        <select
                          value={businessCategoryFilter}
                          onChange={(e) => setBusinessCategoryFilter(e.target.value)}
                          className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                        >
                          <option value="all">All Categories</option>
                          {INITIAL_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        {/* Country Dropdown */}
                        <select
                          value={businessCountryFilter}
                          onChange={(e) => {
                            setBusinessCountryFilter(e.target.value);
                            setBusinessCityFilter('all');
                          }}
                          className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                        >
                          <option value="all">All Countries</option>
                          {POPULAR_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>

                        {/* City Dropdown (client-side) */}
                        <select
                          value={businessCityFilter}
                          onChange={(e) => setBusinessCityFilter(e.target.value)}
                          className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                        >
                          <option value="all">All Cities</option>
                          {availableCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                          Status:
                        </span>
                        {['all', 'published', 'pending', 'rejected', 'suspended'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setBusinessStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                              businessStatusFilter === status
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Directory Listings: Mobile Stacked Cards & Desktop Table */}
                    {filteredAllBusinesses.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs">
                        No businesses found matching the current search criteria.
                      </div>
                    ) : (
                      <>
                        {/* Mobile Stacked Cards (< 768px) */}
                        <div className="md:hidden space-y-3">
                          {filteredAllBusinesses.map((biz) => (
                            <div
                              key={biz._id}
                              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <Link
                                    href={`/business/${biz.slug}`}
                                    className="font-bold text-slate-900 hover:text-[#1D68F2] text-sm break-words"
                                  >
                                    {biz.name}
                                  </Link>
                                  <div className="text-[11px] text-slate-400 font-mono truncate">/{biz.slug}</div>
                                </div>
                                <Badge
                                  variant={
                                    biz.listingStatus === 'published'
                                      ? 'verified'
                                      : biz.listingStatus === 'pending'
                                      ? 'pending'
                                      : 'rejected'
                                  }
                                  className="capitalize font-bold text-[10px] shrink-0"
                                >
                                  {biz.listingStatus}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-600">
                                <div>
                                  <span className="text-slate-400">Verification: </span>
                                  <span className="capitalize font-medium text-slate-700">
                                    {biz.verificationStatus || 'unverified'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatured(biz._id, biz.name)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center cursor-pointer ${
                                    biz.isFeatured
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {biz.isFeatured ? 'Featured ★' : 'Standard'}
                                </button>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                                <Link
                                  href={`/business/${biz.slug}`}
                                  className="min-h-[44px] px-3 flex items-center font-bold text-[#1D68F2] hover:underline"
                                >
                                  Inspect Profile ↗
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop & Tablet Table (>= 768px) */}
                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="p-3.5">Company Name</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5">Verification</th>
                                <th className="p-3.5">Featured</th>
                                <th className="p-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredAllBusinesses.map((biz) => (
                                <tr key={biz._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3.5">
                                    <Link
                                      href={`/business/${biz.slug}`}
                                      className="font-bold text-slate-900 hover:text-[#1D68F2]"
                                    >
                                      {biz.name}
                                    </Link>
                                    <div className="text-[11px] text-slate-400 font-mono">/{biz.slug}</div>
                                  </td>
                                  <td className="p-3.5">
                                    <Badge
                                      variant={
                                        biz.listingStatus === 'published'
                                          ? 'verified'
                                          : biz.listingStatus === 'pending'
                                          ? 'pending'
                                          : 'rejected'
                                      }
                                      className="capitalize font-bold text-[11px]"
                                    >
                                      {biz.listingStatus}
                                    </Badge>
                                  </td>
                                  <td className="p-3.5 capitalize font-medium text-slate-700">
                                    {biz.verificationStatus || 'unverified'}
                                  </td>
                                  <td className="p-3.5">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeatured(biz._id, biz.name)}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                        biz.isFeatured
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                    >
                                      {biz.isFeatured ? 'Featured ★' : 'Standard'}
                                    </button>
                                  </td>
                                  <td className="p-3.5 text-right">
                                    <Link
                                      href={`/business/${biz.slug}`}
                                      className="font-bold text-[#1D68F2] hover:underline"
                                    >
                                      Inspect Profile ↗
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 3: PAYMENTS                                     */}
                {/* --------------------------------------------------- */}
                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    {/* Search & Status Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={paymentSearch}
                          onChange={(e) => setPaymentSearch(e.target.value)}
                          placeholder="Search payment records..."
                          className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                        />
                      </div>

                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    <div className="p-12 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 text-sm">No Payment Records Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                          There are currently no transactions or payment gateway records logged in the directory database. All listings and verification tiers are operating without charge.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 4: REVIEWS                                      */}
                {/* --------------------------------------------------- */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Reviews Search Input */}
                    <div className="relative max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        placeholder="Search reviews by business, author, or content..."
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                      />
                    </div>

                    {filteredReviews.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs space-y-2">
                        <Star className="w-8 h-8 text-amber-400 mx-auto" />
                        <div className="font-bold text-slate-800 text-sm">
                          {reviewSearch.trim() ? 'No Matching Reviews' : 'No Customer Reviews Found'}
                        </div>
                        <p className="text-slate-500">
                          {reviewSearch.trim()
                            ? 'No customer reviews match your search query.'
                            : 'Reviews submitted by users for businesses will appear here for moderation.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Mobile Stacked Reviews (< 768px) */}
                        <div className="md:hidden space-y-3">
                          {filteredReviews.map((r) => (
                            <div
                              key={r._id}
                              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-sm">
                                    {(r.businessId as any)?.name || 'Listing'}
                                  </div>
                                  <div className="text-slate-500 text-[11px] mt-0.5">
                                    By {r.authorName || (r.userId as any)?.name || 'Anonymous User'}
                                  </div>
                                </div>
                                <span className="font-bold text-amber-600 flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
                                  ★ {r.rating} / 5
                                </span>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                <div className="font-semibold text-slate-800">{r.title}</div>
                                <div className="text-[11px] text-slate-600 leading-relaxed">{r.content}</div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[11px] capitalize font-medium text-slate-500">
                                  Status: {r.moderationStatus}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(r._id)}
                                  className="min-h-[44px] px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop & Tablet Table (>= 768px) */}
                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="p-3.5">Business</th>
                                <th className="p-3.5">Author</th>
                                <th className="p-3.5">Rating</th>
                                <th className="p-3.5">Review Summary</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredReviews.map((r) => (
                                <tr key={r._id} className="hover:bg-slate-50/50">
                                  <td className="p-3.5 font-bold text-slate-800">
                                    {(r.businessId as any)?.name || 'Listing'}
                                  </td>
                                  <td className="p-3.5 text-slate-600">
                                    {r.authorName || (r.userId as any)?.name || 'Anonymous User'}
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-bold text-amber-600 flex items-center gap-1">
                                      ★ {r.rating} / 5
                                    </span>
                                  </td>
                                  <td className="p-3.5 max-w-xs">
                                    <div className="font-semibold text-slate-800 truncate">{r.title}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{r.content}</div>
                                  </td>
                                  <td className="p-3.5 capitalize font-medium text-slate-700">
                                    {r.moderationStatus}
                                  </td>
                                  <td className="p-3.5 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReview(r._id)}
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete Review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 5: CLAIM REQUESTS                               */}
                {/* --------------------------------------------------- */}
                {activeTab === 'claims' && (
                  <div className="space-y-5">
                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={claimSearch}
                          onChange={(e) => setClaimSearch(e.target.value)}
                          placeholder="Search claims by business, claimant, email..."
                          className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                        />
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { id: 'all' as const, label: 'All Claims', count: claims.length },
                          {
                            id: 'pending' as const,
                            label: 'Pending Review',
                            count: claims.filter((c) => c.status === 'pending').length,
                          },
                          {
                            id: 'approved' as const,
                            label: 'Approved',
                            count: claims.filter((c) => c.status === 'approved').length,
                          },
                          {
                            id: 'rejected' as const,
                            label: 'Rejected',
                            count: claims.filter((c) => c.status === 'rejected').length,
                          },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setClaimsFilter(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              claimsFilter === f.id
                                ? 'bg-[#1D68F2] text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{f.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                claimsFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {f.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredClaims.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs space-y-2">
                        <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="font-bold text-slate-800 text-sm">
                          {claimSearch.trim() ? 'No Matching Claim Requests' : 'No Claim Requests'}
                        </div>
                        <p className="text-slate-500">
                          {claimSearch.trim()
                            ? 'No ownership claims match your current search query.'
                            : 'Ownership claim requests submitted by business representatives will appear here.'}
                        </p>
                      </div>
                    ) : (
                      filteredClaims.map((claim) => (
                        <div
                          key={claim._id}
                          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <Link
                                  href={`/business/${(claim.businessId as any)?.slug || ''}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-base text-slate-900 hover:text-[#1D68F2] flex items-center gap-1"
                                >
                                  <span>{(claim.businessId as any)?.name || 'Listing'}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                </Link>
                                  <Badge
                                    variant={
                                      claim.status === 'approved'
                                        ? 'verified'
                                        : claim.status === 'pending'
                                        ? 'pending'
                                        : 'rejected'
                                    }
                                    className="capitalize font-bold text-[11px]"
                                  >
                                    {claim.status === 'pending' ? 'Pending Review' : claim.status}
                                  </Badge>
                                </div>
                                <p className="text-slate-500 text-xs">
                                  Claimant: <strong className="text-slate-800">{claim.fullName || (claim.claimantId as any)?.name || 'Claimant'}</strong> • Account: {(claim.claimantId as any)?.email}
                                </p>
                              </div>

                              <div>
                                {claim.emailVerified ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold text-[11px]">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Email Verified</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold text-[11px]">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Pending Verification</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Verification Email
                                </span>
                                <strong className="text-slate-800 text-xs">{claim.businessEmail}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Contact Phone
                                </span>
                                <strong className="text-slate-800 text-xs">{claim.phone}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Option
                                </span>
                                <span className="capitalize font-semibold text-slate-700 text-xs">
                                  {claim.verificationOption?.replace('_', ' ') || 'Corporate Email'}
                                </span>
                              </div>
                              {claim.notes && (
                                <div className="sm:col-span-3 pt-2 border-t border-slate-200/60">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Proof Notes
                                  </span>
                                  <p className="text-slate-700 text-xs mt-0.5">{claim.notes}</p>
                                </div>
                              )}
                            </div>

                            {claim.status === 'pending' && (
                              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleApproveClaim(claim._id)}
                                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve Claim &amp; Transfer Ownership</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectClaim(claim._id)}
                                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject Claim</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 6: USERS DIRECTORY                              */}
                {/* --------------------------------------------------- */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    {/* User Search & Role Filter Dropdown */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setUserPage(1);
                          }}
                          placeholder="Search users by name or email..."
                          className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={userRoleFilter}
                          onChange={(e) => {
                            setUserRoleFilter(e.target.value);
                            setUserPage(1);
                          }}
                          className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                        >
                          <option value="all">All Roles</option>
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role === 'user'
                                ? 'User'
                                : role === 'business_owner'
                                ? 'Business Owner'
                                : role === 'admin'
                                ? 'Admin'
                                : 'Sub-Admin'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-slate-500 text-xs">
                        No registered user accounts found matching your criteria.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Mobile Stacked Users (< 768px) */}
                        <div className="md:hidden space-y-3">
                          {paginatedUsers.map((u) => {
                            const isSelf = u._id === user._id;
                            return (
                              <div
                                key={u._id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs text-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                    <div className="text-[11px] text-slate-500 font-mono break-all">{u.email}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Joined {new Date(u.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                      u.role === 'admin'
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                        : u.role === 'sub_admin'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : u.role === 'business_owner'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    {u.role.replace('_', ' ')}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Businesses</span>
                                    <span className="font-mono font-bold text-slate-800">{u.businessCount ?? 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Reviews</span>
                                    <span className="font-mono font-bold text-slate-800">{u.reviewCount ?? 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
                                    <span
                                      className={`capitalize font-bold text-[11px] ${
                                        u.accountStatus === 'active' ? 'text-emerald-700' : 'text-rose-700'
                                      }`}
                                    >
                                      {u.accountStatus || 'active'}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                                  {isSelf ? (
                                    <span className="text-[11px] font-bold text-slate-400 italic px-2 py-1">
                                      Current Account
                                    </span>
                                  ) : (
                                    <>
                                      {u.role !== 'admin' && (
                                        <button
                                          type="button"
                                          onClick={() => setMakeAdminModalUser(u)}
                                          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                          title="Grant Full Admin Access"
                                        >
                                          Make Admin
                                        </button>
                                      )}
                                      {u.role !== 'sub_admin' && u.role !== 'admin' && (
                                        <button
                                          type="button"
                                          onClick={() => handleMakeSubAdmin(u)}
                                          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                          title="Assign Sub-Admin Privileges"
                                        >
                                          Make Sub-Admin
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleUserStatus(u._id, u.name, u.accountStatus || 'active')}
                                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                          u.accountStatus === 'suspended'
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                        }`}
                                      >
                                        {u.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteModalUser(u);
                                          setDeleteConfirmedCheckbox(false);
                                        }}
                                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                                        title="Permanently Delete User"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop & Tablet Table (>= 768px) */}
                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90">
                          <table className="w-full text-left text-xs min-w-[760px]">
                            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="p-3.5">User Details</th>
                                <th className="p-3.5">Role</th>
                                <th className="p-3.5 text-center">Businesses</th>
                                <th className="p-3.5 text-center">Reviews</th>
                                <th className="p-3.5">Account Status</th>
                                <th className="p-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paginatedUsers.map((u) => {
                                const isSelf = u._id === user._id;
                                return (
                                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3.5">
                                      <div className="font-bold text-slate-900">{u.name}</div>
                                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        Joined {new Date(u.createdAt).toLocaleDateString()}
                                      </div>
                                    </td>
                                    <td className="p-3.5">
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                          u.role === 'admin'
                                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                            : u.role === 'sub_admin'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : u.role === 'business_owner'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}
                                      >
                                        {u.role.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-center font-bold text-slate-800">
                                      <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                                        {u.businessCount ?? 0}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-center font-bold text-slate-800">
                                      <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                                        {u.reviewCount ?? 0}
                                      </span>
                                    </td>
                                    <td className="p-3.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                          u.accountStatus === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                                        }`}
                                      >
                                        {u.accountStatus || 'active'}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                        {isSelf ? (
                                          <span className="text-[11px] font-bold text-slate-400 italic px-2 py-1">
                                            Current Account
                                          </span>
                                        ) : (
                                          <>
                                            {u.role !== 'admin' && (
                                              <button
                                                type="button"
                                                onClick={() => setMakeAdminModalUser(u)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                                title="Grant Full Admin Access"
                                              >
                                                Make Admin
                                              </button>
                                            )}

                                            {u.role !== 'sub_admin' && u.role !== 'admin' && (
                                              <button
                                                type="button"
                                                onClick={() => handleMakeSubAdmin(u)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                                title="Assign Sub-Admin Privileges"
                                              >
                                                Make Sub-Admin
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleToggleUserStatus(u._id, u.name, u.accountStatus || 'active')
                                              }
                                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                u.accountStatus === 'suspended'
                                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                              }`}
                                            >
                                              {u.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => {
                                                setDeleteModalUser(u);
                                                setDeleteConfirmedCheckbox(false);
                                              }}
                                              className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                                              title="Permanently Delete User"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Delete</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Bar */}
                        {totalUserPages > 1 && (
                          <div className="flex items-center justify-between px-2 py-2 text-xs text-slate-500">
                            <div>
                              Showing {(userPage - 1) * USERS_PER_PAGE + 1}–
                              {Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} of{' '}
                              {filteredUsers.length} users
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={userPage <= 1}
                                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Previous
                              </button>
                              <span className="font-semibold text-slate-700">
                                Page {userPage} of {totalUserPages}
                              </span>
                              <button
                                type="button"
                                disabled={userPage >= totalUserPages}
                                onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 7: EMAILS                                       */}
                {/* --------------------------------------------------- */}
                {activeTab === 'emails' && (
                  <div className="space-y-6">
                    {user?.role !== 'admin' ? (
                      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                        <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800">Main Administrator Access Only</h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">
                          In-panel email management, counters, and dispatch privileges are restricted to primary directory administrators.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Two Counter Cards (Phase 5) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Total emails sent
                              </span>
                              <span className="text-2xl font-black text-slate-900 mt-1 block">
                                {emailStats.total}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5 block">
                                All-time confirmed transmissions
                              </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D68F2] flex items-center justify-center">
                              <Mail className="w-6 h-6" />
                            </div>
                          </div>

                          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Sent today
                              </span>
                              <span className="text-2xl font-black text-slate-900 mt-1 block">
                                {emailStats.today}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5 block">
                                Dispatched since 00:00 UTC
                              </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Clock className="w-6 h-6" />
                            </div>
                          </div>
                        </div>

                        {/* Send Email Form (Phase 5) */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                          <div className="border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-sm text-slate-900">Send Email</h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              Dispatch an in-panel notification directly to any directory user, owner, or partner.
                            </p>
                          </div>

                          <form onSubmit={handleSendEmail} className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email-to-input">
                                To (Recipient Email) *
                              </label>
                              <input
                                id="email-to-input"
                                type="email"
                                required
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder="recipient@example.com"
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                              />
                              <span className="text-[11px] text-slate-400 mt-1 block">
                                Single email address only. Bulk sending is disabled.
                              </span>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-700" htmlFor="email-subject-input">
                                  Subject *
                                </label>
                                <span className={`text-[11px] font-mono ${emailSubject.length > 200 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  {emailSubject.length}/200
                                </span>
                              </div>
                              <input
                                id="email-subject-input"
                                type="text"
                                required
                                maxLength={200}
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter subject line (max 200 characters)..."
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-700" htmlFor="email-message-input">
                                  Message *
                                </label>
                                <span className={`text-[11px] font-mono ${emailMessage.length > 5000 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  {emailMessage.length}/5000
                                </span>
                              </div>
                              <textarea
                                id="email-message-input"
                                required
                                rows={5}
                                maxLength={5000}
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder="Type your message in clear, professional English..."
                                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2] resize-y"
                              />
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="submit"
                                disabled={
                                  isSendingEmail ||
                                  !emailTo.trim() ||
                                  !emailSubject.trim() ||
                                  !emailMessage.trim() ||
                                  emailSubject.length > 200 ||
                                  emailMessage.length > 5000
                                }
                                className="px-6 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-[#1557D0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                              >
                                {isSendingEmail ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Email</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Sent-Email Log Table (Phase 5) */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">Sent Email Log</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Chronological record of recent transmissions (newest first).
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={emailSearch}
                                  onChange={(e) => setEmailSearch(e.target.value)}
                                  placeholder="Search email logs..."
                                  className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  loadEmailStats();
                                  loadEmailLogs(emailLogPage);
                                }}
                                disabled={emailLogsLoading}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${emailLogsLoading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                              </button>
                            </div>
                          </div>

                          {emailLogsLoading && emailLogs.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span>Loading email logs...</span>
                            </div>
                          ) : filteredEmailLogs.length === 0 ? (
                            <div className="p-12 text-center text-xs text-slate-400">
                              {emailSearch.trim() ? 'No matching email logs found.' : 'No emails logged yet.'}
                            </div>
                          ) : (
                            <>
                              {/* Mobile Stacked Email Cards (< 768px) */}
                              <div className="md:hidden space-y-3 p-4">
                                {filteredEmailLogs.map((log) => (
                                  <div
                                    key={log._id}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs text-xs w-full"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                          Recipient
                                        </span>
                                        <div className="font-mono font-medium text-slate-900 break-all text-xs">
                                          {log.to}
                                        </div>
                                      </div>
                                      {log.status === 'sent' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>Sent</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 shrink-0">
                                          <XCircle className="w-3 h-3 text-rose-600" />
                                          <span>Failed</span>
                                        </span>
                                      )}
                                    </div>

                                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Subject
                                      </span>
                                      <div className="font-semibold text-slate-800 break-words">{log.subject}</div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-slate-400">Type:</span>
                                        <span className="capitalize px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                                          {log.type || 'manual'}
                                        </span>
                                      </div>
                                      <div className="font-mono text-slate-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Desktop Table (>= 768px) */}
                              <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                                      <th className="py-3 px-4">To</th>
                                      <th className="py-3 px-4">Subject</th>
                                      <th className="py-3 px-4">Type</th>
                                      <th className="py-3 px-4">Status</th>
                                      <th className="py-3 px-4">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredEmailLogs.map((log) => (
                                      <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                                          {log.to}
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate" title={log.subject}>
                                          {log.subject}
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className="capitalize px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                                            {log.type || 'manual'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          {log.status === 'sent' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                              <span>Sent</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
                                              <XCircle className="w-3 h-3 text-rose-600" />
                                              <span>Failed</span>
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                          {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination */}
                              <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                  Page {emailLogPage} of {emailLogTotalPages} ({emailLogTotalCount} total records)
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEmailLogPageChange(emailLogPage - 1)}
                                    disabled={emailLogPage <= 1 || emailLogsLoading}
                                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                                  >
                                    Previous
                                  </button>
                                  <button
                                    onClick={() => handleEmailLogPageChange(emailLogPage + 1)}
                                    disabled={emailLogPage >= emailLogTotalPages || emailLogsLoading}
                                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* SMTP Gateway Overview Card */}
                        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-slate-900">SMTP Gateway Configuration</h3>
                                <p className="text-xs text-slate-500">Real-time status of directory notification transport</p>
                              </div>
                            </div>

                            {smtpStatus && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                  smtpStatus.success
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    smtpStatus.success ? 'bg-emerald-600' : 'bg-rose-600'
                                  }`}
                                />
                                <span>{smtpStatus.success ? 'Connected & Verified' : 'Gateway Issue'}</span>
                              </span>
                            )}
                          </div>

                          {smtpStatus?.smtpConfig && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Host</span>
                                <strong className="text-slate-800">{smtpStatus.smtpConfig.host || 'N/A'}</strong>
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Port</span>
                                <strong className="text-slate-800">{smtpStatus.smtpConfig.port || 587}</strong>
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From Address</span>
                                <strong className="text-slate-800 truncate block">{smtpStatus.smtpConfig.fromUser || 'Configured'}</strong>
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Name</span>
                                <strong className="text-slate-800 truncate block">{smtpStatus.smtpConfig.fromName || 'Biz List Place'}</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------- */}
                {/* TAB 8: ACTIVITY (Phase 6)                           */}
                {/* --------------------------------------------------- */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {user?.role !== 'admin' ? (
                      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                        <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800">Main Administrator Access Only</h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">
                          The administrative activity stream and audit records are restricted to primary directory administrators.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                        {/* Header & Filter Controls */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">Activity Log</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Audited stream of administrative actions and moderation events.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Activity Search Input */}
                            <div className="relative w-full sm:w-56">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={activitySearch}
                                onChange={(e) => setActivitySearch(e.target.value)}
                                placeholder="Search logs..."
                                className="w-full text-xs pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#1D68F2]"
                              />
                            </div>

                            {/* Action-Filter Dropdown */}
                            <select
                              value={activityActionFilter}
                              onChange={(e) => handleActivityFilterChange(e.target.value)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68F2] cursor-pointer"
                            >
                              <option value="all">All Actions</option>
                              <option value="approve_business">Approve Business</option>
                              <option value="reject_business">Reject Business</option>
                              <option value="delete_business">Delete Business</option>
                              <option value="suspend_business">Suspend Business</option>
                              <option value="toggle_featured">Toggle Featured</option>
                              <option value="verify_business">Verify Business</option>
                              <option value="change_role">Change Role</option>
                              <option value="delete_user">Delete User</option>
                              <option value="toggle_status">Toggle User Status</option>
                              <option value="spam_user">Spam User</option>
                              <option value="unspam_user">Un-spam User</option>
                              <option value="approve_claim">Approve Claim</option>
                              <option value="reject_claim">Reject Claim</option>
                              <option value="delete_review">Delete Review</option>
                              <option value="resolve_report">Resolve Report</option>
                            </select>

                            <button
                              onClick={() => loadActivityLogs(activityLogPage, activityActionFilter)}
                              disabled={activityLogsLoading}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${activityLogsLoading ? 'animate-spin' : ''}`} />
                              <span>Refresh</span>
                            </button>
                          </div>
                        </div>

                        {/* Log Content: Mobile Cards & Desktop Table */}
                        {activityLogsLoading && activityLogs.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Loading activity stream...</span>
                          </div>
                        ) : filteredActivityLogs.length === 0 ? (
                          <div className="p-12 text-center text-xs text-slate-400 space-y-1">
                            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <div className="font-bold text-slate-700">
                              {activitySearch.trim() ? 'No matching activity logs' : 'No activity logs recorded'}
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              {activitySearch.trim()
                                ? 'No logged events match your current search criteria.'
                                : 'Administrative actions will be displayed in this chronological audit log.'}
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Mobile Stacked Activity Cards (< 768px) */}
                            <div className="md:hidden space-y-3 p-4">
                              {filteredActivityLogs.map((log) => (
                                <div
                                  key={log._id}
                                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs text-xs w-full"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                        Administrator
                                      </span>
                                      <div className="font-bold text-slate-900 break-words">
                                        {log.actorName || log.actor?.name || 'Administrator'}
                                      </div>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                      {log.action}
                                    </span>
                                  </div>

                                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 break-words">
                                      <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {log.targetType}:
                                      </span>
                                      <span className="font-semibold text-slate-900">
                                        {log.targetLabel || log.targetId || '-'}
                                      </span>
                                    </div>
                                    {log.details && (
                                      <p className="text-[11px] text-slate-600 break-words leading-relaxed pt-0.5">
                                        {log.details}
                                      </p>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                    <span>Recorded</span>
                                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Desktop Table (>= 768px) */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Admin</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Target</th>
                                    <th className="py-3 px-4">Details</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {filteredActivityLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                      </td>
                                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                                        {log.actorName || log.actor?.name || 'Administrator'}
                                      </td>
                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                          {log.action}
                                        </span>
                                      </td>
                                      <td
                                        className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate"
                                        title={log.targetLabel || log.targetId}
                                      >
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">
                                          {log.targetType}:
                                        </span>
                                        <span>{log.targetLabel || log.targetId || '-'}</span>
                                      </td>
                                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={log.details}>
                                        {log.details || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                              <span>
                                Page {activityLogPage} of {activityLogTotalPages} ({activityLogTotalCount} total records)
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleActivityPageChange(activityLogPage - 1)}
                                  disabled={activityLogPage <= 1 || activityLogsLoading}
                                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                                >
                                  Previous
                                </button>
                                <button
                                  onClick={() => handleActivityPageChange(activityLogPage + 1)}
                                  disabled={activityLogPage >= activityLogTotalPages || activityLogsLoading}
                                  className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* SIDEBAR VIEW: REPORTS                                     */}
          {/* ========================================================= */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              {/* Header Card with Refetch Button */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#1D68F2]" />
                    <span>Directory Performance &amp; Aggregate Reports</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live aggregate counts, geographic demographics, categorical breakdown, and pending queue aging.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchReports}
                  disabled={reportsLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reportsLoading ? 'animate-spin text-[#1D68F2]' : 'text-slate-500'}`} />
                  <span>{reportsLoading ? 'Refetching...' : 'Refetch Reports'}</span>
                </button>
              </div>

              {reportsLoading && !reportsData ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-xs text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#1D68F2] animate-spin mx-auto" />
                  <p className="font-semibold text-slate-700">Calculating directory aggregates...</p>
                </div>
              ) : !reportsData ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-xs text-slate-500">
                  No reporting data loaded. Click Refetch Reports above.
                </div>
              ) : (
                <>
                  {/* Block 1: Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Businesses</span>
                      <strong className="text-xl font-black text-slate-900">{reportsData.totals.totalBusinesses}</strong>
                      <p className="text-[11px] text-slate-500">Total registered</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published</span>
                      <strong className="text-xl font-black text-emerald-600">{reportsData.totals.publishedBusinesses}</strong>
                      <p className="text-[11px] text-slate-500">Active in directory</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
                      <strong className="text-xl font-black text-amber-600">{reportsData.totals.pendingBusinesses}</strong>
                      <p className="text-[11px] text-slate-500">Awaiting approval</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rejected / Suspended</span>
                      <strong className="text-xl font-black text-rose-600">
                        {reportsData.totals.rejectedBusinesses + reportsData.totals.suspendedBusinesses}
                      </strong>
                      <p className="text-[11px] text-slate-500">
                        {reportsData.totals.rejectedBusinesses} rejected, {reportsData.totals.suspendedBusinesses} suspended
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
                      <strong className="text-xl font-black text-blue-600">{reportsData.totals.totalUsers}</strong>
                      <p className="text-[11px] text-slate-500">All user accounts</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reviews &amp; Claims</span>
                      <strong className="text-xl font-black text-purple-600">{reportsData.totals.totalReviews}</strong>
                      <p className="text-[11px] text-slate-500">
                        {reportsData.totals.totalClaims} claims ({reportsData.totals.pendingClaims} pending)
                      </p>
                    </div>
                  </div>

                  {/* Block 2: Category Distribution (Plain CSS Bars) */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Businesses by Category</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Distribution of listings across business categories.</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {reportsData.businessesByCategory.length} recorded
                      </span>
                    </div>

                    {reportsData.businessesByCategory.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                        No category distribution data recorded.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {(() => {
                          const maxCount = Math.max(...reportsData.businessesByCategory.map((c) => c.count), 1);
                          return reportsData.businessesByCategory.map((cat) => {
                            const percent = Math.min(100, Math.round((cat.count / maxCount) * 100));
                            const share = Math.round((cat.count / (reportsData.totals.totalBusinesses || 1)) * 100);
                            return (
                              <div key={cat._id} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-800">{cat.name}</span>
                                  <span className="font-mono text-slate-500">
                                    <strong className="text-slate-800">{cat.count}</strong> listings ({share}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-[#1D68F2] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Block 3: Geographic Distribution (Country & Cities) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Businesses by Country */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Businesses by Country</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Country ISO distribution of registered entities.</p>
                        </div>
                        <Globe className="w-4 h-4 text-emerald-600" />
                      </div>

                      {reportsData.businessesByCountry.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                          No country distribution data recorded.
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {(() => {
                            const maxCountry = Math.max(...reportsData.businessesByCountry.map((c) => c.count), 1);
                            return reportsData.businessesByCountry.map((c) => {
                              const percent = Math.min(100, Math.round((c.count / maxCountry) * 100));
                              const share = Math.round((c.count / (reportsData.totals.totalBusinesses || 1)) * 100);
                              return (
                                <div key={c.countryCode} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 uppercase tracking-wider">{c.countryCode}</span>
                                    <span className="font-mono text-slate-500">
                                      <strong className="text-slate-800">{c.count}</strong> ({share}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Top Cities */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Top Cities</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Branch locations by metropolitan area.</p>
                        </div>
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>

                      {reportsData.topCities.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                          No city location records available.
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {(() => {
                            const maxCity = Math.max(...reportsData.topCities.map((c) => c.count), 1);
                            return reportsData.topCities.map((item) => {
                              const percent = Math.min(100, Math.round((item.count / maxCity) * 100));
                              return (
                                <div key={`${item.city}-${item.countryCode}`} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800">
                                      {item.city} {item.countryCode ? <span className="text-slate-400 font-normal uppercase">({item.countryCode})</span> : ''}
                                    </span>
                                    <span className="font-mono text-slate-500">
                                      <strong className="text-slate-800">{item.count}</strong> branch{item.count > 1 ? 'es' : ''}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className="bg-purple-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block 4: Month Tables (Last 12 Months) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Businesses by Month */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-sm text-slate-900">Businesses Added by Month</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Directory listings created in the last 12 months.</p>
                      </div>

                      {reportsData.businessesByMonth.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                          No business submissions recorded in the last 12 months.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                              <tr>
                                <th className="px-3 py-2.5">Month</th>
                                <th className="px-3 py-2.5 text-right">Listings Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {reportsData.businessesByMonth.map((row) => (
                                <tr key={row.month} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-3 py-2 font-mono font-bold text-slate-800">{row.month}</td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-700">+{row.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Users by Month */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-sm text-slate-900">User Registrations by Month</h4>
                        <p className="text-xs text-slate-500 mt-0.5">New user accounts registered in the last 12 months.</p>
                      </div>

                      {reportsData.usersByMonth.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50/60 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                          No user registrations recorded in the last 12 months.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                              <tr>
                                <th className="px-3 py-2.5">Month</th>
                                <th className="px-3 py-2.5 text-right">Accounts Created</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {reportsData.usersByMonth.map((row) => (
                                <tr key={row.month} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-3 py-2 font-mono font-bold text-slate-800">{row.month}</td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-700">+{row.count}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block 5: Pending Aging Analysis */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Pending Listings Aging Analysis</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Queue dwell time for business submissions awaiting moderation.</p>
                      </div>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Today</span>
                        <strong className="text-lg font-black text-emerald-600">{reportsData.pendingAging.submittedToday}</strong>
                        <p className="text-[10px] text-slate-500">&lt; 24 hours</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1–3 Days</span>
                        <strong className="text-lg font-black text-blue-600">{reportsData.pendingAging.waiting1to3Days}</strong>
                        <p className="text-[10px] text-slate-500">Normal wait</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">3–7 Days</span>
                        <strong className="text-lg font-black text-amber-700">{reportsData.pendingAging.waiting3to7Days}</strong>
                        <p className="text-[10px] text-amber-600">Needs attention</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">7+ Days</span>
                        <strong className="text-lg font-black text-rose-700">{reportsData.pendingAging.waitingOver7Days}</strong>
                        <p className="text-[10px] text-rose-600">Urgent backlog</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oldest Pending</span>
                        <strong className="text-lg font-black text-slate-900">
                          {reportsData.pendingAging.oldestPendingDays > 0 ? `${reportsData.pendingAging.oldestPendingDays}d` : '0d'}
                        </strong>
                        <p className="text-[10px] text-slate-500">
                          {reportsData.totals.pendingBusinesses === 0 ? 'Queue clear' : 'Max wait time'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Block 6: Payments Summary & Reviews Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payments Summary */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Payments &amp; Revenue Summary</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Real fee collection statistics and receipt statuses.</p>
                        </div>
                        <CreditCard className="w-4 h-4 text-[#1D68F2]" />
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified</span>
                          <strong className="text-base font-black text-slate-900">{reportsData.paymentsSummary.totalVerified}</strong>
                          <p className="text-[10px] text-slate-500">Receipts approved</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                          <strong className="text-base font-black text-amber-600">{reportsData.paymentsSummary.totalPending}</strong>
                          <p className="text-[10px] text-slate-500">In review queue</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                          <strong className="text-base font-black text-emerald-600">
                            {reportsData.paymentsSummary.currency} {reportsData.paymentsSummary.totalAmount}
                          </strong>
                          <p className="text-[10px] text-slate-500">Processed funds</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs text-slate-500">
                        Listing fee requirement is currently configured as{' '}
                        <strong className="text-slate-800">
                          {settingsData?.paymentSettings?.enabled ? 'Active / Enabled' : 'Disabled / Free Listings'}
                        </strong>
                        .
                      </div>
                    </div>

                    {/* Customer Reviews Summary */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Customer Reviews Summary</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Rating scores and satisfaction distribution across listings.</p>
                        </div>
                        <Star className="w-4 h-4 text-amber-500" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 rounded-2xl bg-amber-50 border border-amber-200/70 min-w-[90px]">
                          <strong className="text-2xl font-black text-amber-700 block">{reportsData.reviewsSummary.averageRating}</strong>
                          <div className="flex justify-center text-amber-500 my-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= Math.round(reportsData.reviewsSummary.averageRating) ? 'fill-current' : 'text-amber-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-amber-800 font-bold">Average Rating</span>
                        </div>

                        <div className="flex-1 space-y-1.5 text-xs">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = reportsData.reviewsSummary.ratingDistribution[stars] || 0;
                            const pct = Math.round((count / (reportsData.reviewsSummary.totalReviews || 1)) * 100);
                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="w-6 text-[11px] font-bold text-slate-600">{stars} ★</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-8 text-right font-mono text-[11px] text-slate-500">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SIDEBAR VIEW: SETTINGS                                    */}
          {/* ========================================================= */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span>Platform &amp; Governance Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage directory notification addresses, listing fee requirements, system backups, and quick tools.
                </p>
              </div>

              {settingsLoading && !settingsData ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-xs text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#1D68F2] animate-spin mx-auto" />
                  <p className="font-semibold text-slate-700">Loading system settings...</p>
                </div>
              ) : (
                <>
                  {/* Setting 1: Owner Notification Email */}
                  <form
                    onSubmit={handleSaveNotificationEmail}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Owner Notification Email</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Directory alerts for newly submitted listings, contact inquiries, and moderation notices are sent to this address.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Administrative Alert Email Address
                      </label>
                      <input
                        type="email"
                        value={ownerEmailInput}
                        onChange={(e) => setOwnerEmailInput(e.target.value)}
                        placeholder="admin@example.com"
                        required
                        className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all bg-white"
                      />
                      <p className="text-[11px] text-slate-400">
                        Loaded from active platform settings. Never hardcoded.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingEmailSetting}
                        className="px-5 py-2.5 rounded-xl bg-[#1D68F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingEmailSetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Notification Email</span>
                      </button>
                    </div>
                  </form>

                  {/* Setting 2: Payment & Listing Fee Settings */}
                  <form
                    onSubmit={handleSavePaymentSettings}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Payment &amp; Listing Fee Configuration</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure listing submission requirements, verification fees, and payment guidelines.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Enabled Toggle */}
                      <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={paymentFeeEnabled}
                          onChange={(e) => setPaymentFeeEnabled(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-[#1D68F2] focus:ring-[#1D68F2] border-slate-300"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">
                            Enable Listing Fee Requirement
                          </span>
                          <span className="text-[11px] text-slate-500">
                            When enabled, newly submitted businesses must provide payment proof before directory moderation and publication.
                          </span>
                        </div>
                      </label>

                      {/* Currency and Fee Amount */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Currency Code</label>
                          <input
                            type="text"
                            value={paymentCurrencyInput}
                            onChange={(e) => setPaymentCurrencyInput(e.target.value.toUpperCase())}
                            maxLength={5}
                            placeholder="USD"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all uppercase bg-white"
                          />
                          <p className="text-[11px] text-slate-400">e.g. USD, PKR, EUR, GBP</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Listing Fee Amount</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentFeeAmountInput}
                            onChange={(e) => setPaymentFeeAmountInput(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all bg-white"
                          />
                          <p className="text-[11px] text-slate-400">Standard fee per business submission</p>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          Payment Instructions &amp; Bank Details
                        </label>
                        <textarea
                          rows={3}
                          value={paymentInstructionsInput}
                          onChange={(e) => setPaymentInstructionsInput(e.target.value)}
                          placeholder="Provide bank account details, wire instructions, or receipt upload guidance for business owners..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1D68F2]/20 focus:border-[#1D68F2] transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPaymentSetting}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingPaymentSetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Payment Settings</span>
                      </button>
                    </div>
                  </form>

                  {/* Setting 3: System Backup */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Download className="w-4 h-4 text-indigo-600" />
                          <span>Database &amp; System Backup</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Export a clean, point-in-time JSON backup of all registered businesses, users, reviews, and audit logs.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                      <div>
                        <span className="font-bold text-xs text-indigo-950 block">One-Click Platform Backup</span>
                        <p className="text-[11px] text-indigo-800/80 mt-0.5">
                          Generates a sanitized snapshot omitting user password hashes and authentication tokens.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadBackup}
                        disabled={isDownloadingBackup}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isDownloadingBackup ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloadingBackup ? 'Generating Backup...' : 'Download Backup (JSON)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Setting 4: Quick Navigation to Governance Tools */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900">Governance &amp; Diagnostic Shortcuts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Direct links to operational management panels.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <strong className="text-xs font-bold text-slate-900">In-Panel Email Center</strong>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Review sent communication logs, delivery counters, and dispatch direct notifications.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSidebarClick('emails')}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Open Emails Tab</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-purple-600" />
                            <strong className="text-xs font-bold text-slate-900">Administrative Activity Stream</strong>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Inspect immutable timeline of moderation decisions, role assignments, and listing changes.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSidebarClick('activity')}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>Open Activity Tab</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Setting 5: Sign Out Session */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Administrator Session</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Active session details and security exit.</p>
                      </div>
                      <LogOut className="w-4 h-4 text-rose-500" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{user?.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] font-bold uppercase">
                            {user?.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Admin Portal</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* MAKE ADMIN CONFIRMATION MODAL                           */}
      {/* ======================================================= */}
      {makeAdminModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMakeAdminModalUser(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Are you sure? This grants FULL admin access.
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This user will get full control, including payments, users and permissions.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Target User:</span>
                <span className="font-bold text-slate-900">{makeAdminModalUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono text-slate-700">{makeAdminModalUser.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMakeAdminModalUser(null)}
                disabled={isUpdatingRole}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMakeAdmin}
                disabled={isUpdatingRole}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1D68F2] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isUpdatingRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* DELETE USER CONFIRMATION MODAL                          */}
      {/* ======================================================= */}
      {deleteModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteModalUser(null);
              setDeleteConfirmedCheckbox(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete User Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This action cannot be undone and will permanently erase this user.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">User Name:</span>
                <span className="font-bold text-slate-900">{deleteModalUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono text-slate-700">{deleteModalUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Associated Businesses:</span>
                <span className="font-bold text-slate-900">{deleteModalUser.businessCount ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Submitted Reviews:</span>
                <span className="font-bold text-slate-900">{deleteModalUser.reviewCount ?? 0}</span>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Permanent Deletion Notice
              </p>
              <p className="text-[11px] leading-relaxed text-rose-700">
                Deleting permanently removes the user, all their businesses and all their reviews, with no undo.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteConfirmedCheckbox}
                onChange={(e) => setDeleteConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">
                I understand this cannot be undone
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalUser(null);
                  setDeleteConfirmedCheckbox(false);
                }}
                disabled={isDeletingUser}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={!deleteConfirmedCheckbox || isDeletingUser}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SPAM USER CONFIRMATION MODAL (Phase 3)                  */}
      {/* ======================================================= */}
      {spamTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSpamTargetUser(null);
              setSpamReasonInput('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Flag User as Spam</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce directory spam protections on this account.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">User Name:</span>
                <span className="font-bold text-slate-900">{spamTargetUser.name}</span>
              </div>
              {spamTargetUser.email && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="font-mono text-slate-700">{spamTargetUser.email}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                Spam Enforcement Notice
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Flagging this user as spam will hide all their approved businesses and prevent them from submitting or approving any new listings. No data will be deleted.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <label htmlFor="spam-reason-input">Reason for spam flag *</label>
                <span className="text-slate-400 font-mono text-[11px]">
                  {spamReasonInput.length}/200
                </span>
              </div>
              <textarea
                id="spam-reason-input"
                rows={3}
                maxLength={200}
                value={spamReasonInput}
                onChange={(e) => setSpamReasonInput(e.target.value)}
                placeholder="Briefly state why this user is being flagged as spam..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSpamTargetUser(null);
                  setSpamReasonInput('');
                }}
                disabled={isSubmittingSpam}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSpamUser}
                disabled={!spamReasonInput.trim() || spamReasonInput.trim().length > 200 || isSubmittingSpam}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingSpam && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Spam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (under 768px)                   */}
      {/* ======================================================= */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMobileDrawerOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Admin Portal</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Directory Governance</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {SIDEBAR_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer min-h-[44px] ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1D68F2] hover:bg-blue-50/80 transition-all min-h-[44px]"
              >
                <span className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>View Website</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-all min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MOBILE BOTTOM TAB BAR (under 768px, md:hidden)          */}
      {/* ======================================================= */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex items-center justify-around md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => handleSidebarClick('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeSection === 'dashboard'
              ? 'text-[#1D68F2] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeSection === 'dashboard' ? 'text-[#1D68F2]' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>

        {/* 2. Businesses */}
        <button
          type="button"
          onClick={() => handleSidebarClick('businesses')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeSection === 'businesses'
              ? 'text-[#1D68F2] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Building2 className={`w-5 h-5 ${activeSection === 'businesses' ? 'text-[#1D68F2]' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Businesses</span>
        </button>

        {/* 3. Payments */}
        <button
          type="button"
          onClick={() => handleSidebarClick('payments')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeSection === 'payments'
              ? 'text-[#1D68F2] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <CreditCard className={`w-5 h-5 ${activeSection === 'payments' ? 'text-[#1D68F2]' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Payments</span>
        </button>

        {/* 4. More */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            isMoreSheetOpen ||
            ['users', 'reviews', 'claims', 'emails', 'activity', 'reports', 'settings'].includes(activeSection)
              ? 'text-[#1D68F2] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <MoreHorizontal
            className={`w-5 h-5 ${
              isMoreSheetOpen ||
              ['users', 'reviews', 'claims', 'emails', 'activity', 'reports', 'settings'].includes(activeSection)
                ? 'text-[#1D68F2]'
                : 'text-slate-400'
            }`}
          />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* ======================================================= */}
      {/* MOBILE "MORE" BOTTOM SHEET (under 768px)                */}
      {/* ======================================================= */}
      {isMoreSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/50 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMoreSheetOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More navigation options"
            className="w-full bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 space-y-4"
          >
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">More Administrative Sections</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close more options menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Remaining Tabs Navigation Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'users' as const, label: 'Users', icon: Users },
                { id: 'reviews' as const, label: 'Reviews', icon: Star },
                { id: 'claims' as const, label: 'Claims', icon: FileCheck2 },
                { id: 'emails' as const, label: 'Emails', icon: Mail },
                { id: 'activity' as const, label: 'Activity', icon: History },
                { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
                { id: 'settings' as const, label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSidebarClick(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all text-left min-h-[44px] cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: View Website & Sign Out */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMoreSheetOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1D68F2] hover:bg-blue-50/80 transition-all min-h-[44px]"
              >
                <span className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>View Website</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-all min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
