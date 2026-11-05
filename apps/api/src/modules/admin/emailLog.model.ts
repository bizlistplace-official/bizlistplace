import { Schema, model, Document, Types } from 'mongoose';

export type EmailLogType = 'manual' | 'spam' | 'unspam' | 'system';
export type EmailLogStatus = 'sent' | 'failed';

export interface IEmailLogDocument extends Document {
  to: string;
  subject: string;
  type: EmailLogType;
  status: EmailLogStatus;
  sentBy?: Types.ObjectId | null;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLogDocument>(
  {
    to: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ['manual', 'spam', 'unspam', 'system'],
      default: 'manual',
      index: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
      index: true,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const EmailLog = model<IEmailLogDocument>('EmailLog', EmailLogSchema);

