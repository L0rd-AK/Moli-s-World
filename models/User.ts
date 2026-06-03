import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  role: 'admin';
  passwordHash?: string;
  bio?: string;
  website?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
  passwordHash: {
    type: String,
  },
  bio: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
UserSchema.pre('save', async function (this: any, next: (err?: any) => void) {
  if (!this.isModified('email')) return next();
  this.updatedAt = new Date();
  next();
});

export default models.User || model('User', UserSchema);