import { Schema, model, models } from 'mongoose';

export interface INote {
  _id?: string;
  title: string;
  content: string;
  tags: string[];
  color: 'default' | 'saffron' | 'rose' | 'sky' | 'emerald' | 'violet';
  isPinned: boolean;
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

const NoteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  color: {
    type: String,
    enum: ['default', 'saffron', 'rose', 'sky', 'emerald', 'violet'],
    default: 'default',
  },
  isPinned: {
    type: Boolean,
    default: false,
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

NoteSchema.index({ isPinned: -1, updatedAt: -1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ isPublic: 1, status: 1 });
NoteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default models.Note || model('Note', NoteSchema);
