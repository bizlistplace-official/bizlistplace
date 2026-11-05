import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId?: Types.ObjectId | null;
  action: string;
  entityType: 'business' | 'review' | 'user' | 'claim' | 'category';
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['business', 'review', 'user', 'claim', 'category'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = model<IAuditLogDocument>('AuditLog', AuditLogSchema);
