import { Request, Response, NextFunction } from 'express';
import { Report } from './report.model';
import { Business } from '../businesses/business.model';
import { AuthenticatedRequest } from '../../middleware/auth';

export class ReportController {
  static async submitReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { reason, details } = req.body;
      const user = (req as AuthenticatedRequest).user;

      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ success: false, message: 'Business not found.' });
        return;
      }

      const report = await Report.create({
        businessId: id,
        reporterId: user ? user._id : null,
        reason,
        details,
        status: 'open',
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for helping keep our directory accurate. Our moderation team has received your report.',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}
