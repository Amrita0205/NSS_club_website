import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  userType: 'student' | 'admin';
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['student', 'admin'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, userType: 1, read: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema); 