import { Response, NextFunction } from 'express';
import { Business } from '../businesses/business.model';
import { BusinessLocation } from '../businesses/businessLocation.model';
import { ClaimRequest } from '../claims/claim.model';
import { Report } from '../reports/report.model';
import { User } from '../users/user.model';
import { Review } from '../reviews/review.model';
import { AuditLog } from './auditLog.model';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/audit.service';
import { EmailService } from '../../services/email.service';

export class AdminController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalBusinesses,
        pendingBusinesses,
        publishedBusinesses,
        rejectedBusinesses,
        totalUsers,
        pendingClaims,
        openReports,
        totalReviews,
      ] = await Promise.all([
        Business.countDocuments(),
        Business.countDocuments({ listingStatus: 'pending' }),
        Business.countDocuments({ listingStatus: 'published' }),
        Business.countDocuments({ listingStatus: 'rejected' }),
        User.countDocuments(),
        ClaimRequest.countDocuments({ status: 'pending' }),
        Report.countDocuments({ status: 'open' }),
        Review.countDocuments(),
      ]);

      res.json({
        success: true,
        data: {
          totalBusinesses,
          pendingBusinesses,
          publishedBusinesses,
          rejectedBusinesses,
          totalUsers,
          pendingClaims,
          openReports,
          totalReviews,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPendingBusinesses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pending = await Business.find({ listingStatus: 'pending' })
        .populate('ownerId', 'name email role')
        .populate('categoryIds', 'name slug')
        .sort({ createdAt: -1 })
        .lean();

      const bIds = pending.map((b) => b._id);
      const locations = await BusinessLocation.find({ businessId: { $in: bIds } }).lean();

      const enriched = pending.map((b) => ({
        ...b,
        locations: locations.filter((l) => l.businessId.toString() === b._id.toString()),
      }));

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllBusinesses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const query: Record<string, unknown> = {};
      if (status) {
        query.listingStatus = status;
      }

      const businesses = await Business.find(query)
        .populate('ownerId', 'name email')
        .populate('categoryIds', 'name slug')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: businesses,
      });
    } catch (err) {
      next(err);
    }
  }

  static async approveBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const business = await Business.findById(id).populate('ownerId', 'name email');
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.listingStatus = 'published';
      business.publishedAt = new Date();
      business.rejectionReason = '';
      await business.save();

      await AuditService.log('business_approved', 'business', id, {}, admin._id, req.ip);

      if (business.ownerId && (business.ownerId as any).email) {
        await EmailService.sendListingApprovedNotification(
          (business.ownerId as any).email,
          business.name,
          business.slug
        );
      }

      res.json({
        success: true,
        message: `Listing "${business.name}" has been approved and published to the directory.`,
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const admin = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.listingStatus = 'rejected';
      business.rejectionReason = reason || 'Does not meet directory listing guidelines.';
      await business.save();

      await AuditService.log('business_rejected', 'business', id, { reason }, admin._id, req.ip);

      res.json({
        success: true,
        message: `Listing "${business.name}" has been marked as rejected.`,
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async suspendBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.listingStatus = 'suspended';
      await business.save();

      await AuditService.log('business_suspended', 'business', id, {}, admin._id, req.ip);

      res.json({
        success: true,
        message: `Listing "${business.name}" has been suspended.`,
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleFeatured(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.isFeatured = !business.isFeatured;
      await business.save();

      await AuditService.log('business_featured_toggled', 'business', id, {
        isFeatured: business.isFeatured,
      }, admin._id, req.ip);

      res.json({
        success: true,
        message: `Listing "${business.name}" featured status set to: ${business.isFeatured}`,
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async setVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const admin = req.user!;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.verificationStatus = status;
      if (notes) business.verificationNotes = notes;
      await business.save();

      await AuditService.log('business_verified', 'business', id, { status, notes }, admin._id, req.ip);

      res.json({
        success: true,
        message: `Verification status updated to: ${status}`,
        data: business,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getClaims(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const claims = await ClaimRequest.find()
        .populate('businessId', 'name slug verificationStatus')
        .populate('claimantId', 'name email role')
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

  static async approveClaim(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const claim = await ClaimRequest.findById(id).populate('businessId', 'name slug');
      if (!claim) {
        res.status(404).json({ success: false, message: 'Claim request not found.' });
        return;
      }

      claim.status = 'approved';
      claim.reviewedBy = admin._id;
      claim.reviewedAt = new Date();
      await claim.save();

      // Transfer ownership to claimant and mark verified
      await Business.findByIdAndUpdate(claim.businessId, {
        ownerId: claim.claimantId,
        verificationStatus: 'verified',
        verificationNotes: `Verified via admin-approved claim review (${claim.fullName || 'Claimant'}, ${claim.businessEmail}).`,
      });

      // Ensure claimant has role 'business_owner'
      await User.findByIdAndUpdate(claim.claimantId, { role: 'business_owner' });

      // Reject competing pending claims for this same business
      await ClaimRequest.updateMany(
        {
          businessId: claim.businessId,
          _id: { $ne: claim._id },
          status: 'pending',
        },
        {
          status: 'rejected',
          rejectionReason: 'Another competing ownership claim for this business was verified and approved by administration.',
          reviewedBy: admin._id,
          reviewedAt: new Date(),
        }
      );

      // Notify claimant via email
      const businessName = (claim.businessId as any)?.name || 'Your Business';
      await EmailService.sendClaimStatusNotification(claim.businessEmail, businessName, 'approved');

      await AuditService.log('claim_approved', 'claim', id, {
        businessId: claim.businessId,
        claimantId: claim.claimantId,
      }, admin._id, req.ip);

      res.json({
        success: true,
        message: 'Claim approved. Ownership transferred and badge verified.',
        data: claim,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectClaim(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const admin = req.user!;

      const claim = await ClaimRequest.findById(id).populate('businessId', 'name');
      if (!claim) {
        res.status(404).json({ success: false, message: 'Claim request not found.' });
        return;
      }

      claim.status = 'rejected';
      claim.rejectionReason = reason || 'Insufficient proof of ownership.';
      claim.reviewedBy = admin._id;
      claim.reviewedAt = new Date();
      await claim.save();

      const businessName = (claim.businessId as any)?.name || 'Your Business';
      await EmailService.sendClaimStatusNotification(
        claim.businessEmail,
        businessName,
        'rejected',
        claim.rejectionReason
      );

      await AuditService.log('claim_rejected', 'claim', id, { reason: claim.rejectionReason }, admin._id, req.ip);

      res.json({
        success: true,
        message: 'Claim request rejected.',
        data: claim,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reports = await Report.find()
        .populate('businessId', 'name slug')
        .populate('reporterId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: reports,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resolveReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const report = await Report.findByIdAndUpdate(
        id,
        { status: status || 'resolved' },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Report status updated.',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find()
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  }
}
