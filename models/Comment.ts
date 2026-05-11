import { Schema, model, models } from 'mongoose';

export interface IComment {
  _id?: string;
  content: string;
  postId?: string; // For blog comments
  poemId?: string; // For poem comments
  reviewId?: string; // For review comments
  parentId?: string; // For nested replies (max 2 levels)
  author: {
    name: string;
    email: string;
    image?: string;
    userId?: string; // Registered user ID
  };
  isGuest: boolean; // true if guest comment
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  turnstileToken?: string; // Cloudflare Turnstile verification
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  poemId: {
    type: Schema.Types.ObjectId,
    ref: 'Poem',
  },
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  isGuest: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending',
  },
  turnstileToken: {
    type: String,
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

CommentSchema.index({ postId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ poemId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ reviewId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ status: 1, createdAt: -1 });

export default models.Comment || model('Comment', CommentSchema);