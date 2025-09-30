const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Student Schema (simplified version)
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  branch: {
    type: String,
    uppercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalHours: {
    type: Number,
    default: 0
  },
  events: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    hours: {
      type: Number,
      required: true
    },
    attendedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

async function createTestStudent() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nss-iiit-raichur';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if test student already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { rollNo: 'CS23B1008' },
        { email: 'cs23b1008@iiitr.ac.in' }
      ]
    });
    
    if (existingStudent) {
      console.log('Test student already exists:', existingStudent.rollNo);
      console.log('Student approved:', existingStudent.approved);
      console.log('Student active:', existingStudent.isActive);
      console.log('Student email:', existingStudent.email);
      return;
    }

    // Create test student
    const testStudent = new Student({
      name: 'Test Student 2',
      rollNo: 'CS23B1008',
      email: 'cs23b1008@iiitr.ac.in',
      phone: '9876543210',
      year: 2,
      branch: 'CSE',
      password: 'password123',
      approved: true, // Set to true for testing
      isActive: true,
      totalHours: 0
    });

    await testStudent.save();
    console.log('Test student created successfully:');
    console.log('Roll No:', testStudent.rollNo);
    console.log('Name:', testStudent.name);
    console.log('Email:', testStudent.email);
    console.log('Approved:', testStudent.approved);
    console.log('Active:', testStudent.isActive);
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestStudent();
