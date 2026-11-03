import { Schema, model, Document, Types } from 'mongoose';
import { ClaimStatus, CLAIM_STATUSES } from '@bizpockethub/shared';

export interface IClaimDocument extends Document {
  businessId: Types.ObjectId;
  claimantId: Types.ObjectId;
  fullName: string;
  verificationOption: 'registered_email' | 'corporate_email' | 'alternative_proof';
  businessEmail: string;
  phone: string;
  verificationDocuments: string[];
  notes?: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date | null;
  otpCode?: string | null;
  otpExpiresAt?: Date | null;
  verificationToken?: string | null;
  tokenExpiresAt?: Date | null;
  otpAttempts: number;
  lastOtpSentAt?: Date | null;
  status: ClaimStatus;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaimDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    claimantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    verificationOption: {
      type: String,
      enum: ['registered_email', 'corporate_email', 'alternative_proof'],
      default: 'corporate_email',
    },
    businessEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    verificationDocuments: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
      index: true,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpSentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ClaimRequest = model<IClaimDocument>('ClaimRequest', ClaimSchema);
