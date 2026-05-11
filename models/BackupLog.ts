import { Schema, model, models } from 'mongoose';

export interface IBackupLog {
  _id?: string;
  triggeredBy: {
    userId: string;
    userName: string;
    email: string;
  };
  triggeredAt: Date;
  snapshotId?: string;
  status: 'pending' | 'completed' | 'failed';
  verifiedAt?: Date;
  downloadUrl?: string; // For M0 tier export fallback
  size?: number; // Size in bytes
  errorMessage?: string;
  updatedAt?: Date;
}

const BackupLogSchema = new Schema<IBackupLog>({
  triggeredBy: {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
  },
  snapshotId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  verifiedAt: {
    type: Date,
  },
  downloadUrl: {
    type: String,
  },
  size: {
    type: Number,
  },
  errorMessage: {
    type: String,
  },
  updatedAt: {
    type: Date,
  },
});

BackupLogSchema.index({ triggeredAt: -1 });
BackupLogSchema.index({ status: 1 });

export default models.BackupLog || model('BackupLog', BackupLogSchema);