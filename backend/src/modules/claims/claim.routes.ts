import { Router } from 'express';
import { ClaimController } from './claim.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { CreateClaimSchema, VerifyClaimOtpSchema } from '@bizpockethub/shared';

const router = Router();

// Submit claim for business
router.post(
  '/businesses/:id/claim',
  requireAuth,
  validateBody(CreateClaimSchema),
  ClaimController.submitClaim
);

// Verify 6-digit OTP
router.post(
  '/claims/:id/verify-otp',
  requireAuth,
  validateBody(VerifyClaimOtpSchema),
  ClaimController.verifyOtp
);

// Resend OTP
router.post('/claims/:id/resend-otp', requireAuth, ClaimController.resendOtp);

// 1-Click Verification Link
router.get('/claims/verify-link', ClaimController.verifyToken);

// User's claims
router.get('/owner/claims', requireAuth, ClaimController.getMyClaims);

export default router;
