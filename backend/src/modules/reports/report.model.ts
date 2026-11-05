import { Schema, model, Document, Types } from 'mongoose';

export interface IReportDocument extends Document {
  businessId: Types.ObjectId;
  reporterId?: Types.ObjectId | null;
  reason: 'incorrect_info' | 'spam_fraud' | 'closed_down' | 'offensive_content' | 'other';
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reason: {
      type: String,
      enum: ['incorrect_info', 'spam_fraud', 'closed_down', 'offensive_content', 'other'],
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReportDocument>('Report', ReportSchema);
