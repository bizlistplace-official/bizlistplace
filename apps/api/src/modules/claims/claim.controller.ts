import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ClaimRequest } from './claim.model';
import { Business } from '../businesses/business.model';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/audit.service';
import { EmailService } from '../../services/email.service';

export class ClaimController {
  static async submitClaim(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const {
        fullName,
        verificationOption,
        businessEmail,
        phone,
        notes,
        verificationDocuments,
      } = req.body;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      if (business.ownerId && business.verificationStatus === 'verified') {
        res.status(400).json({
          success: false,
          message: 'This business has already been claimed and verified by its registered owner.',
        });
        return;
      }

      // Generate 6-digit OTP and secure 1-click token
      const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
      const token = crypto.randomBytes(32).toString('hex');
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Check if user already has an existing pending claim for this business
      let claim = await ClaimRequest.findOne({
        businessId: id,
        claimantId: user._id,
        status: 'pending',
      });

      if (claim) {
        // Update existing pending claim with refreshed code & details
        claim.fullName = fullName || user.name;
        claim.verificationOption = verificationOption || 'corporate_email';
        claim.businessEmail = businessEmail.toLowerCase().trim();
        claim.phone = phone.trim();
        claim.notes = notes || '';
        if (verificationDocuments) {
          claim.verificationDocuments = verificationDocuments;
        }
        claim.otpCode = otp;
        claim.otpExpiresAt = otpExpiresAt;
        claim.verificationToken = token;
        claim.tokenExpiresAt = tokenExpiresAt;
        claim.otpAttempts = 0;
        claim.lastOtpSentAt = new Date();
        claim.emailVerified = false;
        await claim.save();
      } else {
        // Create new claim
        claim = await ClaimRequest.create({
          businessId: id,
          claimantId: user._id,
          fullName: fullName || user.name,
          verificationOption: verificationOption || 'corporate_email',
          businessEmail: businessEmail.toLowerCase().trim(),
          phone: phone.trim(),
          notes: notes || '',
          verificationDocuments: verificationDocuments || [],
          otpCode: otp,
          otpExpiresAt,
          verificationToken: token,
          tokenExpiresAt,
          otpAttempts: 0,
          lastOtpSentAt: new Date(),
          emailVerified: false,
          status: 'pending',
        });
      }

      // Dispatch Email with both 6-digit code and 1-click link
      await EmailService.sendClaimVerification(
        claim.businessEmail,
        otp,
        token,
        business.name
      );

      await AuditService.log(
        'claim_submitted',
        'claim',
        claim._id.toString(),
        {
          businessId: id,
          businessEmail: claim.businessEmail,
          verificationOption: claim.verificationOption,
        },
        user._id,
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'A 6-digit verification code and 1-click link have been sent to your email.',
        data: {
          claimId: claim._id,
          businessEmail: claim.businessEmail,
          expiresIn: 900,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { otp } = req.body;
      const user = req.user!;

      const claim = await ClaimRequest.findById(id);
      if (!claim) {
        res.status(404).json({ success: false, message: 'Claim request not found.' });
        return;
      }

      // Check authorization (only claimant or admin can verify)
      if (claim.claimantId.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized claim operation.' });
        return;
      }

      if (claim.emailVerified) {
        res.json({
          success: true,
          message: 'Email address has already been verified for this claim.',
          data: claim,
        });
        return;
      }

      if (claim.otpAttempts >= 5) {
        res.status(429).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new verification code.',
        });
        return;
      }

      if (!claim.otpExpiresAt || claim.otpExpiresAt.getTime() < Date.now()) {
        res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
        return;
      }

      if (!claim.otpCode || claim.otpCode !== otp.trim()) {
        claim.otpAttempts = (claim.otpAttempts || 0) + 1;
        await claim.save();
        const remaining = Math.max(0, 5 - claim.otpAttempts);
        res.status(400).json({
          success: false,
          message: `Invalid verification code. ${remaining} attempts remaining.`,
        });
        return;
      }

      // Mark email as verified
      claim.emailVerified = true;
      claim.emailVerifiedAt = new Date();
      claim.otpCode = null; // Clear code for security
      await claim.save();

      await AuditService.log(
        'claim_email_verified',
        'claim',
        claim._id.toString(),
        {
          method: 'otp',
          businessId: claim.businessId,
        },
        user._id,
        req.ip
      );

      res.json({
        success: true,
        message: 'Email ownership verified successfully. Your claim request has been forwarded for admin review.',
        data: claim,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resendOtp(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const claim = await ClaimRequest.findById(id).populate('businessId', 'name');
      if (!claim) {
        res.status(404).json({ success: false, message: 'Claim request not found.' });
        return;
      }

      if (claim.claimantId.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized claim operation.' });
        return;
      }

      if (claim.emailVerified) {
        res.status(400).json({
          success: false,
          message: 'Email is already verified for this claim request.',
        });
        return;
      }

      // Rate limiting: 60-second cooldown
      const now = Date.now();
      if (claim.lastOtpSentAt && now - claim.lastOtpSentAt.getTime() < 60 * 1000) {
        const remainingSec = Math.ceil((60 * 1000 - (now - claim.lastOtpSentAt.getTime())) / 1000);
        res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting a new code.`,
        });
        return;
      }

      // Generate new code & token
      const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
      const token = crypto.randomBytes(32).toString('hex');

      claim.otpCode = otp;
      claim.otpExpiresAt = new Date(now + 15 * 60 * 1000);
      claim.verificationToken = token;
      claim.tokenExpiresAt = new Date(now + 24 * 60 * 60 * 1000);
      claim.otpAttempts = 0;
      claim.lastOtpSentAt = new Date();
      await claim.save();

      const businessName = (claim.businessId as any)?.name || 'Listing';
      await EmailService.sendClaimVerification(
        claim.businessEmail,
        otp,
        token,
        businessName
      );

      res.json({
        success: true,
        message: 'A fresh verification code and link have been dispatched to your email.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        res.status(400).json({ success: false, message: 'Verification token is required.' });
        return;
      }

      const claim = await ClaimRequest.findOne({
        verificationToken: token,
      }).populate('businessId', 'name slug');

      if (!claim) {
        res.status(400).json({ success: false, message: 'Invalid or already used verification link.' });
        return;
      }

      if (claim.tokenExpiresAt && claim.tokenExpiresAt.getTime() < Date.now()) {
        res.status(400).json({ success: false, message: 'Verification link has expired. Please request a new code.' });
        return;
      }

      claim.emailVerified = true;
      claim.emailVerifiedAt = new Date();
      claim.verificationToken = null; // Single-use token
      await claim.save();

      await AuditService.log(
        'claim_email_verified',
        'claim',
        claim._id.toString(),
        {
          method: 'link',
          businessId: claim.businessId,
        },
        claim.claimantId,
        req.ip
      );

      res.json({
        success: true,
        message: 'Email ownership successfully verified! Your claim is under review by directory administrators.',
        data: {
          claimId: claim._id,
          business: claim.businessId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMyClaims(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const claims = await ClaimRequest.find({ claimantId: user._id })
        .populate('businessId', 'name slug verificationStatus logoUrl contactEmail')
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: claims,
      });
    } catch (err) {
      next(err);
    }
  }
}
