import { Request, Response, NextFunction } from 'express';
import { Review } from './review.model';
import { Business } from '../businesses/business.model';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/audit.service';

async function updateBusinessRatings(businessId: string): Promise<void> {
  const stats = await Review.aggregate([
    { $match: { businessId: businessId as any, moderationStatus: 'approved' } },
    {
      $group: {
        _id: '$businessId',
        avgRating: { $sum: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const avg = Math.round((stats[0].avgRating / stats[0].count) * 10) / 10;
    await Business.findByIdAndUpdate(businessId, {
      ratingAverage: avg,
      reviewCount: stats[0].count,
    });
  } else {
    await Business.findByIdAndUpdate(businessId, {
      ratingAverage: 0,
      reviewCount: 0,
    });
  }
}

export class ReviewController {
  static async listByBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await Review.find({
        businessId: id,
        moderationStatus: 'approved',
      })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: reviews,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;
      const { rating, title, content, authorName } = req.body;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      if (user) {
        // Check if authenticated user already submitted a review
        const existing = await Review.findOne({ businessId: id, userId: user._id });
        if (existing) {
          res.status(400).json({
            success: false,
            message: 'You have already submitted a review for this business.',
          });
          return;
        }

        // Check owner cannot review own business
        if (business.ownerId && business.ownerId.toString() === user._id.toString()) {
          res.status(400).json({
            success: false,
            message: 'Business owners cannot review their own listing.',
          });
          return;
        }
      }

      const review = await Review.create({
        businessId: id,
        userId: user ? user._id : undefined,
        authorName: (authorName && typeof authorName === 'string' && authorName.trim()) || (user ? user.name : 'Customer'),
        rating,
        title,
        content,
        moderationStatus: 'approved', // Live immediately in standard configuration
      });

      await updateBusinessRatings(id);

      await AuditService.log('review_created', 'review', review._id.toString(), {
        rating,
        isGuest: !user,
      }, user?._id?.toString() || null, req.ip);

      res.status(201).json({
        success: true,
        message: 'Your review has been published. Thank you for your feedback!',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const review = await Review.findById(id);
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found.' });
        return;
      }

      const isAuthor = Boolean(review.userId && user && review.userId.toString() === user._id.toString());
      const isAdmin = user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        res.status(403).json({ success: false, message: 'Permission denied.' });
        return;
      }

      const businessId = review.businessId.toString();
      await Review.findByIdAndDelete(id);
      await updateBusinessRatings(businessId);

      res.json({
        success: true,
        message: 'Review removed.',
      });
    } catch (err) {
      next(err);
    }
  }
}
