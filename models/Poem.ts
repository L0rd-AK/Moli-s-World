import { Schema, model, models } from 'mongoose';

export interface IPoem {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  audioUrl?: string;
  audioDuration?: number;
  mood: ['বিষাদ' | 'আনন্দ' | 'প্রেম' | 'দ্রোহ' | 'রোমান্টিক' | 'নাটকীয়' | 'অন্যান্য'];
  tags: string[];
  views: number;
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

const PoemSchema = new Schema<IPoem>({
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
    maxlength: 300,
  },
  coverImage: {
    type: String,
  },
  audioUrl: {
    type: String,
  },
  audioDuration: {
    type: Number,
  },
  mood: {
    type: [String],
    enum: ['বিষাদ', 'আনন্দ', 'প্রেম', 'দ্রোহ', 'রোমান্টিক', 'নাটকীয়', 'অন্যান্য'],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PoemSchema.index({ slug: 1 });
PoemSchema.index({ status: 1, publishedAt: -1 });
PoemSchema.index({ mood: 1 });
PoemSchema.index({ tags: 1 });
PoemSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Atlas Search

export default models.Poem || model('Poem', PoemSchema);