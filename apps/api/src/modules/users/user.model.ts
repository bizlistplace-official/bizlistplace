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
  isSpam?: boolean;
  spamReason?: string;
  spamAt?: Date | null;
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
    isSpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    spamReason: {
      type: String,
      maxlength: 200,
      default: '',
    },
    spamAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        delete ret.password;
        delete ret.passwordHash;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.passwordResetOtp;
        delete ret.passwordResetOtpExpires;
        delete ret.passwordResetAttempts;
        delete ret.lastPasswordResetOtpSentAt;
        delete ret.resetSessionToken;
        delete ret.resetSessionExpires;
        delete ret.emailVerificationOtp;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.emailVerificationAttempts;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<IUserDocument>('User', UserSchema);
