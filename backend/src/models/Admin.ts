import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'coordinator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'coordinator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_students',
      'manage_events',
      'manage_admins',
      'view_reports',
      'upload_attendance',
      'approve_registrations'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });

// Pre-save middleware to hash password
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
AdminSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'manage_students',
          'manage_events',
          'manage_admins',
          'view_reports',
          'upload_attendance',
          'approve_registrations'
        ];
        break;
      case 'admin':
        this.permissions = [
          'manage_students',
          'manage_events',
          'view_reports',
          'upload_attendance',
          'approve_registrations'
        ];
        break;
      case 'coordinator':
        this.permissions = [
          'view_reports',
          'upload_attendance'
        ];
        break;
    }
  }
  next();
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);