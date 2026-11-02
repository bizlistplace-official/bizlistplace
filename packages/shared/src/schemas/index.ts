import { z } from 'zod';
import {
  USER_ROLES,
  LISTING_STATUSES,
  BUSINESS_TYPES,
  VERIFICATION_STATUSES,
} from '../constants';

// Authentication Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['user', 'business_owner']).default('user'),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// Business Location Schema
export const BusinessLocationSchema = z.object({
  branchName: z.string().min(2, 'Branch name is required').max(100),
  countryCode: z.string().length(2, 'Country code must be 2 characters (ISO-3166-1)').toUpperCase(),
  region: z.string().min(1, 'Region/State is required').max(80),
  city: z.string().min(1, 'City is required').max(80),
  postalCode: z.string().max(20).optional(),
  addressLine1: z.string().min(3, 'Address is required').max(150),
  addressLine2: z.string().max(150).optional(),
  isPrimary: z.boolean().default(false),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openingHours: z.record(z.string()).optional(),
  timezone: z.string().optional(),
});
export type BusinessLocationInput = z.infer<typeof BusinessLocationSchema>;

// Business Listing Schema
export const CreateBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(120),
  description: z.string().min(20, 'Please provide a detailed description (min 20 characters)').max(3000),
  shortDescription: z.string().max(200).optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contactEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  phone: z.string().min(5, 'Valid phone number required').max(30).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  businessType: z.enum(BUSINESS_TYPES).default('physical'),
  serviceAreas: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
      facebook: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
  primaryLocation: BusinessLocationSchema.optional(),
});
export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;

export const UpdateBusinessSchema = CreateBusinessSchema.partial();
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;

// Review Schema
export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(3, 'Review headline must be at least 3 characters').max(100),
  content: z.string().min(15, 'Review content must be at least 15 characters').max(1500),
  authorName: z.string().max(80).optional(),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

// Claim Request Schema
export const CreateClaimSchema = z.object({
  businessEmail: z.string().email('Provide an official business email address').toLowerCase(),
  phone: z.string().min(7, 'Valid business contact phone is required'),
  notes: z.string().min(10, 'Explain your relationship to the company (e.g. Owner, CEO, Marketing Director)').max(1000),
  verificationDocuments: z.array(z.string()).optional(),
});
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;

// Report Listing Schema
export const CreateReportSchema = z.object({
  reason: z.enum(['incorrect_info', 'spam_fraud', 'closed_down', 'offensive_content', 'other']),
  details: z.string().min(10, 'Please explain the issue in detail').max(1000),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

// Category Schema
export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
