import { Schema, model, Document, Types } from 'mongoose';
import {
  BusinessType,
  ListingStatus,
  VerificationStatus,
  BUSINESS_TYPES,
  LISTING_STATUSES,
  VERIFICATION_STATUSES,
} from '@bizpockethub/shared';

export interface IBusinessDocument extends Document {
  name: string;
  slug: string;
  ownerId?: Types.ObjectId | null;
  description: string;
  shortDescription?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categoryIds: Types.ObjectId[];
  businessType: BusinessType;
  countryCode: string;
  serviceAreas: string[];
  listingStatus: ListingStatus;
  isApproved?: boolean;
  hiddenBySpam?: boolean;
  rejectionReason?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isFeatured: boolean;
  ratingAverage: number;
  reviewCount: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusinessDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 250,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
      default: 'physical',
      index: true,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
      index: true,
      default: 'PK',
    },
    serviceAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    listingStatus: {
      type: String,
      enum: LISTING_STATUSES,
      default: 'pending',
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    hiddenBySpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'unverified',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
BusinessSchema.index(
  {
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    serviceAreas: 'text',
  },
  {
    weights: {
      name: 10,
      shortDescription: 5,
      serviceAreas: 3,
      description: 1,
    },
    name: 'BusinessTextIndex',
  }
);

// Compound indexes for common queries
BusinessSchema.index({ countryCode: 1, listingStatus: 1, isFeatured: -1, createdAt: -1 });
BusinessSchema.index({ countryCode: 1, listingStatus: 1, ratingAverage: -1 });
BusinessSchema.index({ listingStatus: 1, isFeatured: -1, createdAt: -1 });
BusinessSchema.index({ listingStatus: 1, categoryIds: 1 });
BusinessSchema.index({ categoryIds: 1, listingStatus: 1, isFeatured: -1, createdAt: -1 });
BusinessSchema.index({ categoryIds: 1, listingStatus: 1, ratingAverage: -1 });
BusinessSchema.index({ listingStatus: 1, verificationStatus: 1, createdAt: -1 });
BusinessSchema.index({ listingStatus: 1, ratingAverage: -1 });

export const Business = model<IBusinessDocument>('Business', BusinessSchema);
