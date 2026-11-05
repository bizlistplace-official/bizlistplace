import { Schema, model, Document } from 'mongoose';
import { config } from '../../config';

export interface IPaymentSettings {
  enabled: boolean;
  currency: string;
  listingFee: number;
  instructions: string;
}

export interface ISettingsDocument extends Document {
  ownerNotificationEmail: string;
  paymentSettings: IPaymentSettings;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    ownerNotificationEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: config.email.adminEmail || 'bizlistplaceofficial@gmail.com',
    },
    paymentSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      currency: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'USD',
      },
      listingFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      instructions: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = model<ISettingsDocument>('Settings', SettingsSchema);

export async function getOrCreateSettings(): Promise<ISettingsDocument> {
  let doc = await Settings.findOne();
  if (!doc) {
    doc = await Settings.create({
      ownerNotificationEmail: config.email.adminEmail || 'bizlistplaceofficial@gmail.com',
      paymentSettings: {
        enabled: false,
        currency: 'USD',
        listingFee: 0,
        instructions: '',
      },
    });
  }
  return doc;
}

