import { Schema, model, models } from 'mongoose';

export interface IPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: 'প্রবন্ধ' | 'গল্প' | 'স্মৃতিকথা' | 'বিজ্ঞান' | 'সমাজ';
  tags: string[];
  readingTime: number; // in minutes
  views: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  publishedAt?: Date;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  relatedPosts?: string[]; // Array of post IDs
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500,
  },
  coverImage: {
    type: String,
  },
  category: {
    type: String,
    enum: ['প্রবন্ধ', 'গল্প', 'স্মৃতিকথা', 'বিজ্ঞান', 'সমাজ'],
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  readingTime: {
    type: Number,
    required: true,
    min: 1,
  },
  views: {
    type: Number,
    default: 0,
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
  relatedPosts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Atlas Search

export default models.Post || model('Post', PostSchema);