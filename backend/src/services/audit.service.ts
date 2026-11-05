import { Types } from 'mongoose';
import { AuditLog } from '../modules/admin/auditLog.model';

export class AuditService {
  static async log(
    action: string,
    entityType: 'business' | 'review' | 'user' | 'claim' | 'category',
    entityId: string,
    details?: Record<string, unknown>,
    actorId?: string | Types.ObjectId | null,
    ipAddress?: string
  ): Promise<void> {
    try {
      await AuditLog.create({
        actorId: actorId ? new Types.ObjectId(actorId.toString()) : null,
        action,
        entityType,
        entityId,
        details: details || {},
        ipAddress: ipAddress || '',
      });
    } catch (err) {
      console.error('[AUDIT LOG FAILED]', err);
    }
  }
}
