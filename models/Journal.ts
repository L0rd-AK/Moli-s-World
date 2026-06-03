import { Schema, model, models } from 'mongoose';

export interface IJournal {
  _id?: string;
  title: string;
  content: string;
  date: Date;
  mood: 'প্রশান্ত' | 'আনন্দিত' | 'বিষণ্ণ' | 'উদ্যমী' | 'চিন্তিত' | 'কৃতজ্ঞ';
  tags: string[];
  isPublic: boolean;
  status: 'draft' | 'published';
  author: {
    name: string;
    email: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  mood: {
    type: String,
    enum: ['প্রশান্ত', 'আনন্দিত', 'বিষণ্ণ', 'উদ্যমী', 'চিন্তিত', 'কৃতজ্ঞ'],
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
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

JournalSchema.index({ date: -1 });
JournalSchema.index({ mood: 1 });
JournalSchema.index({ tags: 1 });
JournalSchema.index({ isPublic: 1, status: 1 });
JournalSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default models.Journal || model('Journal', JournalSchema);
