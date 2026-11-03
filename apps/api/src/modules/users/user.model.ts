import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '@bizpockethub/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  accountStatus: 'active' | 'suspended';
  emailVerifiedAt: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  passwordResetOtp?: string | null;
  passwordResetOtpExpires?: Date | null;
  passwordResetAttempts?: number;
  lastPasswordResetOtpSentAt?: Date | null;
  resetSessionToken?: string | null;
  resetSessionExpires?: Date | null;
  emailVerificationOtp?: string | null;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  emailVerificationAttempts?: number;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Do not return in default queries
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    passwordResetOtp: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastPasswordResetOtpSentAt: {
      type: Date,
      select: false,
    },
    resetSessionToken: {
      type: String,
      select: false,
    },
    resetSessionExpires: {
      type: Date,
      select: false,
    },
    emailVerificationOtp: {
      type: String,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<IUserDocument>('User', UserSchema);
