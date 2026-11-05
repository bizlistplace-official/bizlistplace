import { Schema, model, Document, Types } from 'mongoose';

export type ActivityAction =
  | 'approve_business'
  | 'reject_business'
  | 'suspend_business'
  | 'toggle_featured'
  | 'verify_business'
  | 'delete_business'
  | 'delete_user'
  | 'change_role'
  | 'toggle_status'
  | 'spam_user'
  | 'unspam_user'
  | 'approve_claim'
  | 'reject_claim'
  | 'verify_payment'
  | 'reject_payment'
  | 'update_payment_settings'
  | 'create_payment_method'
  | 'update_payment_method'
  | 'delete_payment_method'
  | 'toggle_payment_method'
  | 'delete_receipt'
  | 'delete_review'
  | 'resolve_report';

export type ActivityTargetType =
  | 'business'
  | 'user'
  | 'review'
  | 'claim'
  | 'payment'
  | 'settings';

export interface IActivityLogDocument extends Document {
  actor?: Types.ObjectId | null;
  actorName: string;
  action: ActivityAction | string;
  targetType: ActivityTargetType;
  targetId: string;
  targetLabel: string;
  details: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
      default: 'Administrator',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['business', 'user', 'review', 'claim', 'payment', 'settings'],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    targetLabel: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index on createdAt descending per requirements
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);

