import { Schema, model, models } from 'mongoose';

export interface IReview {
  _id?: string;
  bookTitle: string;
  bookAuthor: string;
  isbn?: string;
  coverImage?: string;
  rating: number; // 1-5
  review: string;
  spoilers: boolean;
  genre: ['উপন্যাস' | 'কাহিনী' | 'কবিতা' | 'নাটক' | 'বিজ্ঞান-কল্পনা' | 'ইতিহাস' | 'অন্যান্য'];
  shelf?: 'reading' | 'finished';
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  publishedAt?: Date;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  bookTitle: {
    type: String,
    required: true,
  },
  bookAuthor: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
  },
  spoilers: {
    type: Boolean,
    default: false,
  },
  genre: {
    type: [String],
    enum: ['উপন্যাস', 'কাহিনী', 'কবিতা', 'নাটক', 'বিজ্ঞান-কল্পনা', 'ইতিহাস', 'অন্যান্য'],
    default: [],
  },
  shelf: {
    type: String,
    enum: ['reading', 'finished'],
    default: 'finished',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
  },
  scheduledAt: {
    type: Date,
  },
  publishedAt: {
    type: Date,
  },
  author: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ReviewSchema.index({ bookTitle: 1 });
ReviewSchema.index({ bookAuthor: 1 });
ReviewSchema.index({ status: 1, publishedAt: -1 });
ReviewSchema.index({ genre: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ bookTitle: 'text', review: 'text' }); // Atlas Search

export default models.Review || model('Review', ReviewSchema);