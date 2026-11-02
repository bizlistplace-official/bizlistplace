import {
  UserRole,
  ListingStatus,
  VerificationStatus,
  BusinessType,
  ModerationStatus,
  ClaimStatus,
} from '../constants';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: 'active' | 'suspended';
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBusinessLocation {
  _id?: string;
  businessId: string;
  branchSlug: string;
  branchName: string;
  countryCode: string; // ISO 3166-1 alpha-2
  countryName?: string;
  region: string;
  city: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  isPrimary: boolean;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  openingHours?: Record<string, string>;
  timezone?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  icon?: string;
  description?: string;
  isActive: boolean;
  businessCount?: number;
  subcategories?: string[];
}

export interface IBusiness {
  _id: string;
  name: string;
  slug: string;
  ownerId?: string | IUser;
  description: string;
  shortDescription?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categoryIds: string[] | ICategory[];
  primaryCategory?: ICategory;
  businessType: BusinessType;
  serviceAreas?: string[];
  listingStatus: ListingStatus;
  rejectionReason?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isFeatured: boolean;
  ratingAverage: number;
  reviewCount: number;
  publishedAt?: string | null;
  locations?: IBusinessLocation[];
  primaryLocation?: IBusinessLocation;
  countryCode?: string; // Verified ISO 3166-1 alpha-2 country code (e.g. 'PK', 'US', 'GB')
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  businessId: string | IBusiness;
  userId?: string | IUser | null;
  authorName?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IClaimRequest {
  _id: string;
  businessId: string | IBusiness;
  claimantId: string | IUser;
  businessEmail: string;
  phone: string;
  verificationDocuments?: string[];
  notes?: string;
  status: ClaimStatus;
  rejectionReason?: string;
  reviewedBy?: string | IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IReport {
  _id: string;
  businessId: string | IBusiness;
  reporterId?: string | IUser;
  reason: 'incorrect_info' | 'spam_fraud' | 'closed_down' | 'offensive_content' | 'other';
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId?: string | IUser;
  action: string;
  entityType: 'business' | 'review' | 'user' | 'claim' | 'category';
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ISearchFilters {
  q?: string;
  category?: string;
  country?: string;
  city?: string;
  businessType?: BusinessType;
  verifiedOnly?: boolean;
  sort?: 'relevance' | 'newest' | 'rating' | 'name_asc';
  page?: number;
  limit?: number;
}
