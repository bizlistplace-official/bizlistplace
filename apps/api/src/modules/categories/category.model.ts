import { Schema, model, Document, Types } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  icon?: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    icon: {
      type: String,
      default: 'Building2',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = model<ICategoryDocument>('Category', CategorySchema);
