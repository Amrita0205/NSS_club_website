import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudentEvent {
  eventId: mongoose.Types.ObjectId;
  hours: number;
  attendedAt: Date;
}

export interface IStudent extends Document {
  name: string;
  rollNo: string;
  email: string;
  phone?: string;
  year?: number;
  branch?: string;
  approved: boolean;
  totalHours: number;
  events: IStudentEvent[];
  registeredAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  addEvent: (eventId: mongoose.Types.ObjectId, hours: number) => void;
  password: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const StudentEventSchema = new Schema<IStudentEvent>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  attendedAt: {
    type: Date,
    default: Date.now
  }
});

const StudentSchema = new Schema<IStudent>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}\d{2}[A-Z]\d{4}$/, 'Invalid roll number format (e.g., CS23B1006)']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Invalid phone number format']
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  branch: {
    type: String,
    uppercase: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  totalHours: {
    type: Number,
    default: 0,
    min: 0
  },
  events: [StudentEventSchema],
  registeredAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
StudentSchema.index({ rollNo: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ approved: 1 });
StudentSchema.index({ totalHours: -1 });

// Virtual for event count (defensive against undefined)
StudentSchema.virtual('eventCount').get(function() {
  const events = (this as any).events as IStudentEvent[] | undefined;
  return Array.isArray(events) ? events.length : 0;
});

// Pre-save middleware to hash password
StudentSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Instance method to compare password
StudentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add event
StudentSchema.methods.addEvent = function(eventId: mongoose.Types.ObjectId, hours: number) {
  const existingEvent = this.events.find((e: IStudentEvent) => e.eventId.toString() === eventId.toString());
  if (existingEvent) {
    existingEvent.hours = hours;
    existingEvent.attendedAt = new Date();
  } else {
    this.events.push({
      eventId,
      hours,
      attendedAt: new Date()
    });
  }
  this.totalHours = this.events.reduce((total: number, event: IStudentEvent) => total + event.hours, 0);
};

// Static method to find by roll number
StudentSchema.statics.findByRollNo = function(rollNo: string) {
  return this.findOne({ rollNo: rollNo.toUpperCase() });
};

export default mongoose.model<IStudent>('Student', StudentSchema);