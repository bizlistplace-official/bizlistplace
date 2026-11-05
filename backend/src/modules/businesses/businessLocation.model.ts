import { Schema, model, Document, Types } from 'mongoose';

export interface IBusinessLocationDocument extends Document {
  businessId: Types.ObjectId;
  branchSlug: string;
  branchName: string;
  countryCode: string;
  countryName?: string;
  region: string;
  city: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  isPrimary: boolean;
  phone?: string;
  email?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  openingHours?: Record<string, string>;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessLocationSchema = new Schema<IBusinessLocationDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    branchSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
      index: true,
    },
    countryName: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
    openingHours: {
      type: Map,
      of: String,
      default: {},
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BusinessLocationSchema.index({ businessId: 1, branchSlug: 1 }, { unique: true });
BusinessLocationSchema.index({ countryCode: 1, city: 1 });
BusinessLocationSchema.index({ countryCode: 1, businessId: 1 });
BusinessLocationSchema.index({ businessId: 1, isPrimary: -1 });
BusinessLocationSchema.index({ coordinates: '2dsphere' }, { sparse: true });

export const BusinessLocation = model<IBusinessLocationDocument>(
  'BusinessLocation',
  BusinessLocationSchema
);
