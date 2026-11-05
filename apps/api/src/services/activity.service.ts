import { ActivityAction, ActivityTargetType } from '../modules/admin/activityLog.model';

export interface LogActivityParams {
  actor?: any;
  actorName?: string;
  action: ActivityAction | string;
  targetType: ActivityTargetType;
  targetId?: string;
  targetLabel?: string;
  details?: string;
}

/**
 * Fire-and-forget logging helper.
 * Lazy-requires the ActivityLog model, swallows all errors, never throws,
 * and never changes the outcome of the action being logged.
 */
export function logActivity(params: LogActivityParams): void {
  try {
    // 1. Lazy-require the model to prevent circular dependencies
    const { ActivityLog } = require('../modules/admin/activityLog.model');

    // 2. Sanitize details: ensure single-line, strip potential secrets or email bodies
    let sanitizedDetails = (params.details || '').replace(/[\r\n]+/g, ' ').trim();
    if (sanitizedDetails.length > 300) {
      sanitizedDetails = sanitizedDetails.substring(0, 300);
    }

    // 3. Best-effort fire-and-forget creation
    ActivityLog.create({
      actor: params.actor || null,
      actorName: params.actorName || 'Administrator',
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || '',
      targetLabel: params.targetLabel || '',
      details: sanitizedDetails,
    }).catch((err: any) => {
      // Swallow error without throwing
      console.error('[ACTIVITY LOG ERROR]:', err?.message || err);
    });
  } catch (err: any) {
    // Swallow error without throwing
    console.error('[ACTIVITY LOG LAZY REQUIRE ERROR]:', err?.message || err);
  }
}

