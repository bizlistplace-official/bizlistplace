import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  VerifyResetOtpSchema,
  ResetPasswordSchema,
} from '@bizpockethub/shared';

const router = Router();

router.post('/register', validateBody(RegisterSchema), AuthController.register);
router.post('/login', validateBody(LoginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.me);
router.post('/forgot-password', validateBody(ForgotPasswordSchema), AuthController.forgotPassword);
router.post('/verify-reset-otp', validateBody(VerifyResetOtpSchema), AuthController.verifyResetOtp);
router.post('/reset-password', validateBody(ResetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

export default router;
