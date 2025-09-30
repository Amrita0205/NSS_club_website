const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin Schema (simplified version)
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['super_admin', 'admin', 'coordinator'], default: 'admin' },
  permissions: [String],
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@iiitrc.ac.in' });
    if (existingAdmin) {
      console.log('❌ Admin with email admin@iiitrc.ac.in already exists');
      process.exit(1);
    }

    // Create new admin
    const admin = new Admin({
      name: 'NSS Admin',
      email: 'admin@iiitrc.ac.in',
      password: 'admin123',
      role: 'super_admin',
      permissions: [
        'manage_students',
        'manage_events',
        'manage_admins',
        'view_reports',
        'upload_attendance',
        'approve_registrations'
      ],
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@iiitrc.ac.in');
    console.log('🔑 Password: admin123');
    console.log('🔐 Pass Key: NSS2024@IIITR');
    console.log('\n💡 You can now login at /admin/login');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdmin(); 