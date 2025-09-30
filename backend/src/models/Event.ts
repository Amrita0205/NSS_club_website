import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  givenHours: number;
  location?: string;
  type: 'community_service' | 'awareness' | 'donation' | 'cleaning' | 'education' | 'other';
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  images?: string[];
  requirements?: string[];
}

const EventSchema = new Schema<IEvent>({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  givenHours: {
    type: Number,
    required: [true, 'Given hours is required'],
    min: [0.5, 'Minimum hours should be 0.5'],
    max: [24, 'Maximum hours cannot exceed 24']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['community_service', 'awareness', 'donation', 'cleaning', 'education', 'other'],
    default: 'community_service'
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  maxAttendees: {
    type: Number,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  images: [{
    type: String
  }],
  requirements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
EventSchema.index({ date: -1 });
EventSchema.index({ type: 1 });
EventSchema.index({ isActive: 1 });
EventSchema.index({ name: 'text', description: 'text' });

// Virtual for attendee count (defensive against undefined)
EventSchema.virtual('attendeeCount').get(function() {
  const attendees = (this as any).attendees as mongoose.Types.ObjectId[] | undefined;
  return Array.isArray(attendees) ? attendees.length : 0;
});

// Virtual for available spots
EventSchema.virtual('availableSpots').get(function() {
  const max = (this as any).maxAttendees as number | undefined;
  if (!max && max !== 0) return null;
  const attendees = (this as any).attendees as mongoose.Types.ObjectId[] | undefined;
  const count = Array.isArray(attendees) ? attendees.length : 0;
  return max - count;
});

// Instance method to add attendee
EventSchema.methods.addAttendee = function(studentId: mongoose.Types.ObjectId) {
  if (!this.attendees.includes(studentId)) {
    this.attendees.push(studentId);
  }
};

// Instance method to remove attendee
EventSchema.methods.removeAttendee = function(studentId: mongoose.Types.ObjectId) {
  this.attendees = this.attendees.filter((id: mongoose.Types.ObjectId) => !id.equals(studentId));
};

// Static method to find upcoming events
EventSchema.statics.findUpcoming = function() {
  return this.find({
    date: { $gte: new Date() },
    isActive: true
  }).sort({ date: 1 });
};

// Static method to find past events
EventSchema.statics.findPast = function() {
  return this.find({
    date: { $lt: new Date() },
    isActive: true
  }).sort({ date: -1 });
};

export default mongoose.model<IEvent>('Event', EventSchema);