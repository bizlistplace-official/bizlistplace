import { Response, NextFunction } from 'express';
import { Business } from '../businesses/business.model';
import { BusinessLocation } from '../businesses/businessLocation.model';
import { ClaimRequest } from '../claims/claim.model';
import { Report } from '../reports/report.model';
import { User } from '../users/user.model';
import { Review } from '../reviews/review.model';
import { AuditLog } from './auditLog.model';
import { EmailLog } from './emailLog.model';
import { Settings, getOrCreateSettings } from './settings.model';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/audit.service';
import { EmailService } from '../../services/email.service';
import { logActivity } from '../../services/activity.service';
import { CategoryController } from '../categories/category.controller';
import { config } from '../../config';

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
        .populate('ownerId', 'name email role isSpam spamReason spamAt')
        .populate('categoryIds', 'name slug')
        .sort({ createdAt: 1 })
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

      const business = await Business.findById(id).populate('ownerId', 'name email isSpam');
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      if (business.ownerId) {
        const owner = await User.findById((business.ownerId as any)._id || business.ownerId);
        if (owner && owner.isSpam) {
          res.status(403).json({
            success: false,
            message: 'Cannot approve listing: The business owner account has been flagged as spam.',
          });
          return;
        }
      }

      business.listingStatus = 'published';
      business.isApproved = true;
      business.hiddenBySpam = false;
      business.publishedAt = new Date();
      business.rejectionReason = '';
      await business.save();

      CategoryController.invalidateCache();

      await AuditService.log('business_approved', 'business', id, {}, admin._id, req.ip);

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'approve_business',
        targetType: 'business',
        targetId: id,
        targetLabel: business.name,
        details: `Approved business listing "${business.name}"`,
      });

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

      const business = await Business.findById(id).populate('ownerId', 'name email');
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      business.listingStatus = 'rejected';
      business.rejectionReason = reason || 'Does not meet directory listing guidelines.';
      await business.save();

      CategoryController.invalidateCache();

      await AuditService.log('business_rejected', 'business', id, { reason }, admin._id, req.ip);

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'reject_business',
        targetType: 'business',
        targetId: id,
        targetLabel: business.name,
        details: `Rejected listing "${business.name}" (${(reason || '').trim()})`,
      });

      const recipientEmail = (business.ownerId as any)?.email || business.contactEmail;
      if (recipientEmail) {
        EmailService.sendListingRejectedNotification(recipientEmail, business.name, business.rejectionReason).catch(
          (err) => console.error('[LISTING REJECTED EMAIL ERROR]:', err?.message || err)
        );
      }

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

      CategoryController.invalidateCache();

      await AuditService.log('business_suspended', 'business', id, {}, admin._id, req.ip);

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'suspend_business',
        targetType: 'business',
        targetId: id,
        targetLabel: business.name,
        details: `Suspended business listing "${business.name}"`,
      });

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

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'toggle_featured',
        targetType: 'business',
        targetId: id,
        targetLabel: business.name,
        details: `${business.isFeatured ? 'Promoted' : 'Demoted'} "${business.name}" as featured listing`,
      });

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

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'verify_business',
        targetType: 'business',
        targetId: id,
        targetLabel: business.name,
        details: `Updated verification status to "${status}" for "${business.name}"`,
      });

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

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'approve_claim',
        targetType: 'claim',
        targetId: id,
        targetLabel: businessName,
        details: `Approved business claim for "${businessName}"`,
      });

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

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'reject_claim',
        targetType: 'claim',
        targetId: id,
        targetLabel: businessName,
        details: `Rejected business claim for "${businessName}" (${claim.rejectionReason})`,
      });

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
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalBusinesses,
        publishedBusinesses,
        pendingBusinesses,
        rejectedBusinesses,
        suspendedBusinesses,
        totalUsers,
        totalReviews,
        totalClaims,
        pendingClaims,
        businessesByCategory,
        businessesByCountry,
        topCities,
        businessesByMonthAgg,
        usersByMonthAgg,
        submittedToday,
        waiting1to3Days,
        waiting3to7Days,
        waitingOver7Days,
        oldestPendingResult,
        reviewAgg,
        settingsDoc,
      ] = await Promise.all([
        Business.countDocuments({}),
        Business.countDocuments({ listingStatus: 'published' }),
        Business.countDocuments({ listingStatus: 'pending' }),
        Business.countDocuments({ listingStatus: 'rejected' }),
        Business.countDocuments({ listingStatus: 'suspended' }),
        User.countDocuments({}),
        Review.countDocuments({}),
        ClaimRequest.countDocuments({}),
        ClaimRequest.countDocuments({ status: 'pending' }),
        Business.aggregate([
          { $unwind: '$categoryIds' },
          { $group: { _id: '$categoryIds', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: { $toString: '$_id' },
              name: { $ifNull: ['$category.name', 'Uncategorized'] },
              count: 1,
            },
          },
        ]),
        Business.aggregate([
          { $match: { countryCode: { $exists: true, $ne: '' } } },
          { $group: { _id: '$countryCode', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $project: {
              countryCode: '$_id',
              count: 1,
              _id: 0,
            },
          },
        ]),
        BusinessLocation.aggregate([
          { $match: { city: { $exists: true, $ne: '' } } },
          { $group: { _id: { city: '$city', countryCode: '$countryCode' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $project: {
              city: '$_id.city',
              countryCode: '$_id.countryCode',
              count: 1,
              _id: 0,
            },
          },
        ]),
        Business.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Business.countDocuments({ listingStatus: 'pending', createdAt: { $gte: oneDayAgo } }),
        Business.countDocuments({ listingStatus: 'pending', createdAt: { $lt: oneDayAgo, $gte: threeDaysAgo } }),
        Business.countDocuments({ listingStatus: 'pending', createdAt: { $lt: threeDaysAgo, $gte: sevenDaysAgo } }),
        Business.countDocuments({ listingStatus: 'pending', createdAt: { $lt: sevenDaysAgo } }),
        Business.findOne({ listingStatus: 'pending' }).sort({ createdAt: 1 }).select('createdAt').lean(),
        Review.aggregate([
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
        ]),
        getOrCreateSettings(),
      ]);

      const oldestPendingDays = oldestPendingResult
        ? Math.max(0, Math.floor((now.getTime() - new Date(oldestPendingResult.createdAt).getTime()) / (24 * 60 * 60 * 1000)))
        : 0;

      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRatingSum = 0;
      let totalReviewsCount = 0;

      reviewAgg.forEach((item) => {
        const r = Math.round(Number(item._id));
        if (r >= 1 && r <= 5) {
          ratingDistribution[r] = (ratingDistribution[r] || 0) + item.count;
          totalRatingSum += r * item.count;
          totalReviewsCount += item.count;
        }
      });

      const averageRating = totalReviewsCount > 0 ? Number((totalRatingSum / totalReviewsCount).toFixed(1)) : 0;

      res.json({
        success: true,
        data: {
          totals: {
            totalBusinesses,
            publishedBusinesses,
            pendingBusinesses,
            rejectedBusinesses,
            suspendedBusinesses,
            totalUsers,
            totalReviews,
            totalClaims,
            pendingClaims,
          },
          businessesByCategory,
          businessesByCountry,
          topCities,
          businessesByMonth: businessesByMonthAgg.map((item) => ({ month: item._id, count: item.count })),
          usersByMonth: usersByMonthAgg.map((item) => ({ month: item._id, count: item.count })),
          paymentsSummary: {
            totalVerified: 0,
            totalPending: 0,
            totalAmount: 0,
            currency: settingsDoc?.paymentSettings?.currency || 'USD',
          },
          pendingAging: {
            submittedToday,
            waiting1to3Days,
            waiting3to7Days,
            waitingOver7Days,
            oldestPendingDays,
          },
          reviewsSummary: {
            totalReviews: totalReviewsCount,
            averageRating,
            ratingDistribution,
          },
        },
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

      logActivity({
        actor: req.user?._id,
        actorName: req.user?.name || 'Administrator',
        action: 'resolve_report',
        targetType: 'business',
        targetId: id,
        targetLabel: id,
        details: `Updated report status to "${status || 'resolved'}"`,
      });

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

  static async getEmailStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [total, today] = await Promise.all([
        EmailLog.countDocuments({ status: 'sent' }),
        EmailLog.countDocuments({
          status: 'sent',
          createdAt: { $gte: startOfToday },
        }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          today,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEmailLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const [total, logs] = await Promise.all([
        EmailLog.countDocuments(),
        EmailLog.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('sentBy', 'name email')
          .lean(),
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const { to, subject, message } = req.body || {};

      if (!to || typeof to !== 'string' || !to.trim()) {
        res.status(400).json({ success: false, message: 'Recipient email address is required.' });
        return;
      }
      if (!subject || typeof subject !== 'string' || !subject.trim()) {
        res.status(400).json({ success: false, message: 'Subject is required.' });
        return;
      }
      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ success: false, message: 'Message content is required.' });
        return;
      }

      const trimmedTo = to.trim();
      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();

      if (trimmedSubject.length > 200) {
        res.status(400).json({ success: false, message: 'Subject must not exceed 200 characters.' });
        return;
      }

      if (trimmedMessage.length > 5000) {
        res.status(400).json({ success: false, message: 'Message must not exceed 5000 characters.' });
        return;
      }

      // Enforce single email address only (no bulk sending)
      if (trimmedTo.includes(',') || trimmedTo.includes(';') || /\s/.test(trimmedTo)) {
        res.status(400).json({ success: false, message: 'Only a single recipient email address is permitted. Bulk sending is disabled.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedTo)) {
        res.status(400).json({ success: false, message: 'Please provide a valid recipient email address.' });
        return;
      }

      // Safe HTML escaping for message content
      const escapeHtml = (str: string) =>
        str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; }
    .header h2 { margin: 0; color: #0f172a; font-size: 20px; font-weight: 700; }
    .content { font-size: 14px; color: #334155; white-space: pre-wrap; word-break: break-word; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Biz List Place</h2>
    </div>
    <div class="content">${escapeHtml(trimmedMessage)}</div>
    <div class="footer">
      This message was sent by a directory administrator from Biz List Place.
    </div>
  </div>
</body>
</html>`;

      // Perform transmission
      const result = await EmailService.sendMail({
        to: trimmedTo,
        subject: trimmedSubject,
        html: htmlContent,
        text: trimmedMessage,
      });

      // Best-effort fire-and-forget logging (never throwing, never altering response)
      EmailLog.create({
        to: trimmedTo.toLowerCase(),
        subject: trimmedSubject,
        type: 'manual',
        status: result.success ? 'sent' : 'failed',
        sentBy: req.user?._id || null,
      }).catch((err) => {
        console.error('[EMAIL LOG ERROR]:', err?.message || err);
      });

      if (result.success) {
        await AuditService.log('email_sent', 'user', trimmedTo, { to: trimmedTo, subject: trimmedSubject }, req.user?._id, req.ip);
        res.json({
          success: true,
          message: `Email successfully sent to ${trimmedTo}.`,
          messageId: result.messageId,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || 'Failed to dispatch email.',
        });
      }
    } catch (err) {
      next(err);
    }
  }

  static async testEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetEmail = req.body?.toEmail || req.user?.email || config.email.adminEmail;
      const result = await EmailService.sendTestEmail(targetEmail);

      // Best-effort fire-and-forget logging
      EmailLog.create({
        to: targetEmail.toLowerCase(),
        subject: 'Diagnostic System Test Email',
        type: 'system',
        status: result.success ? 'sent' : 'failed',
        sentBy: req.user?._id || null,
      }).catch(() => {});

      if (result.success) {
        res.json({
          success: true,
          message: `Test email successfully dispatched to ${targetEmail}.`,
          messageId: result.messageId,
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Failed to deliver test email: ${result.error}`,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  static async verifySmtp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const verification = await EmailService.verifyConnection();
      res.json({
        success: verification.success,
        message: verification.message,
        smtpConfig: {
          host: config.email.smtpHost,
          port: config.email.smtpPort,
          secure: config.email.smtpSecure,
          fromUser: config.email.smtpUser,
          fromName: config.email.fromName,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: [],
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await Review.find()
        .populate('businessId', 'name slug')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: reviews,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const review = await Review.findByIdAndDelete(id);
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found.' });
        return;
      }

      await AuditService.log('review_deleted', 'review', id, {}, admin._id, req.ip);

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'delete_review',
        targetType: 'review',
        targetId: id,
        targetLabel: id,
        details: `Deleted review with ID ${id}`,
      });

      res.json({
        success: true,
        message: 'Review deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: any = {};
      const search = req.query.search;
      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
        ];
      }

      const users = await User.find(query)
        .select('name email role accountStatus emailVerifiedAt createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const userIds = users.map((u) => u._id);

      const [businessCounts, reviewCounts] = await Promise.all([
        Business.aggregate([
          { $match: { ownerId: { $in: userIds } } },
          { $group: { _id: '$ownerId', count: { $sum: 1 } } },
        ]),
        Review.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]),
      ]);

      const bMap = new Map<string, number>(businessCounts.map((b: any) => [b._id.toString(), b.count]));
      const rMap = new Map<string, number>(reviewCounts.map((r: any) => [r._id.toString(), r.count]));

      const usersWithCounts = users.map((u) => ({
        ...u,
        businessCount: bMap.get(u._id.toString()) || 0,
        reviewCount: rMap.get(u._id.toString()) || 0,
      }));

      res.json({
        success: true,
        data: usersWithCounts,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const admin = req.user!;

      if (!role || !['admin', 'sub_admin', 'business_owner', 'user'].includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid or missing role parameter.' });
        return;
      }

      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (targetUser._id.toString() === admin._id.toString() && role !== 'admin') {
        res.status(400).json({ success: false, message: 'Cannot modify your own administrative role.' });
        return;
      }

      const previousRole = targetUser.role;
      targetUser.role = role as any;
      await targetUser.save();

      await AuditService.log(
        'user_role_updated',
        'user',
        id,
        { previousRole, newRole: role, email: targetUser.email },
        admin._id,
        req.ip
      );

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'change_role',
        targetType: 'user',
        targetId: id,
        targetLabel: targetUser.email,
        details: `Changed role for "${targetUser.name}" to "${role}"`,
      });

      res.json({
        success: true,
        message: `User "${targetUser.name}" role updated to ${role.replace('_', ' ')}.`,
        data: {
          _id: targetUser._id,
          role: targetUser.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      if (id === admin._id.toString()) {
        res.status(400).json({ success: false, message: 'Cannot delete your own administrative account.' });
        return;
      }

      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      // Find all businesses owned by user to clean up their locations
      const businesses = await Business.find({ ownerId: id }).select('_id');
      const businessIds = businesses.map((b) => b._id);

      await Promise.all([
        User.findByIdAndDelete(id),
        Business.deleteMany({ ownerId: id }),
        BusinessLocation.deleteMany({ businessId: { $in: businessIds } }),
        Review.deleteMany({ userId: id }),
      ]);

      await AuditService.log(
        'user_deleted',
        'user',
        id,
        {
          deletedName: targetUser.name,
          deletedEmail: targetUser.email,
          businessesRemoved: businessIds.length,
        },
        admin._id,
        req.ip
      );

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'delete_user',
        targetType: 'user',
        targetId: id,
        targetLabel: targetUser.email,
        details: `Deleted user "${targetUser.name}" (${targetUser.email}) and all related records`,
      });

      res.json({
        success: true,
        message: `User "${targetUser.name}", along with their businesses and reviews, has been deleted permanently.`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (user._id.toString() === admin._id.toString()) {
        res.status(400).json({ success: false, message: 'Cannot modify your own administrative account status.' });
        return;
      }

      user.accountStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
      await user.save();

      await AuditService.log(
        'user_status_toggled',
        'user',
        id,
        { newStatus: user.accountStatus, email: user.email },
        admin._id,
        req.ip
      );

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'toggle_status',
        targetType: 'user',
        targetId: id,
        targetLabel: user.email,
        details: `Updated account status for "${user.name}" to ${user.accountStatus}`,
      });

      res.json({
        success: true,
        message: `Account status for "${user.name}" updated to ${user.accountStatus}.`,
        data: {
          _id: user._id,
          accountStatus: user.accountStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async spamUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const admin = req.user!;

      if (!reason || typeof reason !== 'string' || !reason.trim()) {
        res.status(400).json({ success: false, message: 'A spam reason is required.' });
        return;
      }

      if (reason.trim().length > 200) {
        res.status(400).json({ success: false, message: 'Spam reason must not exceed 200 characters.' });
        return;
      }

      if (id === admin._id.toString()) {
        res.status(400).json({ success: false, message: 'Cannot flag yourself as spam.' });
        return;
      }

      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (targetUser.role === 'admin') {
        const activeAdminCount = await User.countDocuments({ role: 'admin', isSpam: { $ne: true } });
        if (activeAdminCount <= 1) {
          res.status(400).json({ success: false, message: 'Cannot flag the last remaining active administrator as spam.' });
          return;
        }
      }

      // 1. Flag the user
      targetUser.isSpam = true;
      targetUser.spamReason = reason.trim();
      targetUser.spamAt = new Date();
      await targetUser.save();

      // 2. For every APPROVED business owned by the user, set isApproved=false and hiddenBySpam=true
      await Business.updateMany(
        {
          ownerId: id,
          $or: [{ listingStatus: 'published' }, { isApproved: true }],
        },
        {
          $set: {
            isApproved: false,
            hiddenBySpam: true,
            listingStatus: 'suspended',
          },
        }
      );

      CategoryController.invalidateCache();

      await AuditService.log(
        'user_flagged_spam',
        'user',
        id,
        { reason: reason.trim(), email: targetUser.email },
        admin._id,
        req.ip
      );

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'spam_user',
        targetType: 'user',
        targetId: id,
        targetLabel: targetUser.email,
        details: `Flagged user "${targetUser.name}" as spam (${reason.trim()})`,
      });

      res.json({
        success: true,
        message: `User "${targetUser.name}" has been flagged as spam and their approved listings have been hidden.`,
        data: {
          _id: targetUser._id,
          isSpam: targetUser.isSpam,
          spamReason: targetUser.spamReason,
          spamAt: targetUser.spamAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async unspamUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = req.user!;

      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      // 1. Clear the flag on the user
      targetUser.isSpam = false;
      targetUser.spamReason = '';
      targetUser.spamAt = null;
      await targetUser.save();

      // 2. Restore exactly the businesses with hiddenBySpam=true to isApproved=true and hiddenBySpam=false
      await Business.updateMany(
        {
          ownerId: id,
          hiddenBySpam: true,
        },
        {
          $set: {
            isApproved: true,
            hiddenBySpam: false,
            listingStatus: 'published',
          },
        }
      );

      CategoryController.invalidateCache();

      await AuditService.log('user_unspammed', 'user', id, { email: targetUser.email }, admin._id, req.ip);

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'unspam_user',
        targetType: 'user',
        targetId: id,
        targetLabel: targetUser.email,
        details: `Un-spammed user "${targetUser.name}" and restored hidden listings`,
      });

      res.json({
        success: true,
        message: `User "${targetUser.name}" has been un-spammed and their hidden listings have been restored.`,
        data: {
          _id: targetUser._id,
          isSpam: targetUser.isSpam,
          spamReason: targetUser.spamReason,
          spamAt: targetUser.spamAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.action && typeof req.query.action === 'string' && req.query.action.trim() && req.query.action.trim() !== 'all') {
        filter.action = req.query.action.trim();
      }

      const { ActivityLog } = require('./activityLog.model');
      const [total, logs] = await Promise.all([
        ActivityLog.countDocuments(filter),
        ActivityLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('actor', 'name email role')
          .lean(),
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportBackup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }

      const [users, businesses, reviews] = await Promise.all([
        User.find(),
        Business.find().select('-__v').lean(),
        Review.find().select('-__v').lean(),
      ]);

      // DEFENSIVE SECRET EXCLUSION
      // user records must NEVER contain password, OTP, reset-token, login-attempt or lock fields
      const sanitizedUsers = users.map((u) => {
        // 1. User model's toJSON stripping
        const raw = u.toJSON ? u.toJSON() : (typeof u.toObject === 'function' ? u.toObject() : { ...u });
        const obj: Record<string, any> = { ...(raw as any) };

        // 2. Defensively delete secret / sensitive fields by name
        delete obj.password;
        delete obj.passwordHash;
        delete obj.resetPasswordToken;
        delete obj.resetPasswordExpires;
        delete obj.passwordResetOtp;
        delete obj.passwordResetOtpExpires;
        delete obj.passwordResetAttempts;
        delete obj.lastPasswordResetOtpSentAt;
        delete obj.resetSessionToken;
        delete obj.resetSessionExpires;
        delete obj.emailVerificationOtp;
        delete obj.emailVerificationToken;
        delete obj.emailVerificationExpires;
        delete obj.emailVerificationAttempts;
        delete obj.loginAttempts;
        delete obj.lockUntil;
        delete obj.__v;

        // 3. Defensively scan and strip any remaining keys matching sensitive regex patterns
        const secretPattern = /pass|token|otp|secret|attempt|lock/i;
        for (const key of Object.keys(obj)) {
          if (secretPattern.test(key)) {
            delete obj[key];
          }
        }

        return obj;
      });

      // Business and review records: full documents minus __v
      const sanitizedBusinesses = businesses.map((b: any) => {
        const copy = { ...b };
        delete copy.__v;
        return copy;
      });

      const sanitizedReviews = reviews.map((r: any) => {
        const copy = { ...r };
        delete copy.__v;
        return copy;
      });

      const snapshot = {
        exportedAt: new Date().toISOString(),
        counts: {
          users: sanitizedUsers.length,
          businesses: sanitizedBusinesses.length,
          reviews: sanitizedReviews.length,
        },
        users: sanitizedUsers,
        businesses: sanitizedBusinesses,
        reviews: sanitizedReviews,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="bizlistplace-backup-${dateStr}.json"`);
      res.status(200).send(JSON.stringify(snapshot, null, 2));
    } catch (err) {
      next(err);
    }
  }

  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }
      const settings = await getOrCreateSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden. Main admin privileges required.' });
        return;
      }
      const admin = req.user!;
      const { ownerNotificationEmail, paymentSettings } = req.body || {};

      const settings = await getOrCreateSettings();

      if (ownerNotificationEmail !== undefined) {
        const email = String(ownerNotificationEmail).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({ success: false, message: 'Invalid notification email address format.' });
          return;
        }
        settings.ownerNotificationEmail = email;
      }

      if (paymentSettings !== undefined && typeof paymentSettings === 'object') {
        if (typeof paymentSettings.enabled === 'boolean') {
          settings.paymentSettings.enabled = paymentSettings.enabled;
        }
        if (typeof paymentSettings.currency === 'string') {
          settings.paymentSettings.currency = paymentSettings.currency.trim().toUpperCase() || 'USD';
        }
        if (paymentSettings.listingFee !== undefined) {
          const fee = Number(paymentSettings.listingFee);
          if (isNaN(fee) || fee < 0) {
            res.status(400).json({ success: false, message: 'Listing fee must be a non-negative number.' });
            return;
          }
          settings.paymentSettings.listingFee = fee;
        }
        if (paymentSettings.instructions !== undefined) {
          settings.paymentSettings.instructions = String(paymentSettings.instructions).trim();
        }
      }

      await settings.save();

      logActivity({
        actor: admin._id,
        actorName: admin.name || 'Administrator',
        action: 'update_payment_settings',
        targetType: 'settings',
        targetId: settings._id.toString(),
        targetLabel: 'Platform Settings',
        details: `Updated platform settings (Fee: ${settings.paymentSettings.enabled ? `${settings.paymentSettings.currency} ${settings.paymentSettings.listingFee}` : 'Disabled'}, Alert Email: ${settings.ownerNotificationEmail})`,
      });

      res.json({
        success: true,
        message: 'Platform settings saved successfully.',
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  }
}
