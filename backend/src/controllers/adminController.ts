import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import Student from '../models/Student';
import Event from '../models/Event';
import Admin from '../models/Admin';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/response';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';
import { processAttendanceExcel, generateAttendanceTemplate } from '../utils/excelProcessor';
import * as XLSX from 'xlsx';
import Notification from '../models/Notification';
import { OAuth2Client } from 'google-auth-library';

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin)
 */
export const getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      } as ApiResponse);
      return;
    }

    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getAdminProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { email, password, passKey } = req.body;

    // Fixed passkey - you can change this to any value you want
    const FIXED_PASSKEY = 'NSS2024@IIITR';

    // Check passkey first
    if (!passKey || passKey !== FIXED_PASSKEY) {
      res.status(401).json({
        success: false,
        message: 'Invalid passkey'
      } as ApiResponse);
      return;
    }

    // Find admin with password field
    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true })
      .select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      } as ApiResponse);
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const jwtSecret: Secret = (process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024') as Secret;
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role 
      },
      jwtSecret,
      jwtOptions
    );

    logger.info(`Admin login: ${admin.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in adminLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Admin Google login (org restricted + passkey)
 * @route   POST /api/admin/google-login
 * @access  Public
 */
export const adminGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, passKey } = req.body as { idToken?: string; passKey?: string };

    // Fixed passkey - same as password login
    const FIXED_PASSKEY = 'NSS2024@IIITR';

    if (!passKey || passKey !== FIXED_PASSKEY) {
      res.status(401).json({ success: false, message: 'Invalid passkey' } as ApiResponse);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const orgDomain = process.env.ORG_DOMAIN; // e.g., "iiitr.ac.in"

    if (!clientId) {
      res.status(500).json({ success: false, message: 'Google client ID not configured' } as ApiResponse);
      return;
    }

    if (!idToken) {
      res.status(400).json({ success: false, message: 'Missing idToken' } as ApiResponse);
      return;
    }

    const oauthClient = new OAuth2Client(clientId);
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid Google token' } as ApiResponse);
      return;
    }

    const email = (payload.email || '').toLowerCase();
    const emailVerified = payload.email_verified;
    const hostedDomain = (payload.hd || '').toLowerCase();

    if (!emailVerified) {
      res.status(401).json({ success: false, message: 'Google email not verified' } as ApiResponse);
      return;
    }

    if (orgDomain && hostedDomain !== orgDomain) {
      res.status(403).json({ success: false, message: 'Only organization accounts are allowed' } as ApiResponse);
      return;
    }

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin account not found' } as ApiResponse);
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Issue JWT
    const jwtSecret: Secret = (process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024') as Secret;
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      jwtSecret,
      jwtOptions
    );

    logger.info(`Admin Google login: ${admin.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Error in adminGoogleLogin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Register new admin
 * @route   POST /api/admin/register
 * @access  Public (with passkey)
 */
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { name, email, password, passKey } = req.body;

    // Fixed passkey - same as login
    const FIXED_PASSKEY = 'NSS2024@IIITR';

    // Check passkey first
    if (!passKey || passKey !== FIXED_PASSKEY) {
      res.status(401).json({
        success: false,
        message: 'Invalid passkey'
      } as ApiResponse);
      return;
    }

    // Enforce organization domain if configured
    const orgDomain = process.env.ORG_DOMAIN;
    if (orgDomain && !email.toLowerCase().endsWith(`@${orgDomain.toLowerCase()}`)) {
      res.status(403).json({
        success: false,
        message: 'Only organization email accounts are allowed'
      } as ApiResponse);
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      } as ApiResponse);
      return;
    }

    // Create new admin
    const admin = new Admin({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin', // Default role
      permissions: [
        'manage_students',
        'manage_events',
        'view_reports',
        'upload_attendance',
        'approve_registrations'
      ],
      isActive: true
    });

    await admin.save();

    logger.info(`New admin registered: ${admin.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in registerAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get pending student registrations
 * @route   GET /api/admin/pending-students
 * @access  Private (Admin)
 */
export const getPendingStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('getPendingStudents called');
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    console.log('Query parameters:', { page: pageNum, limit: limitNum, skip });

    const students = await Student.find({ approved: false, isActive: true })
      .select('name rollNo email phone year branch registeredAt')
      .sort({ registeredAt: -1 })
      .limit(limitNum)
      .skip(skip);

    console.log('Students found:', students.length);

    const total = await Student.countDocuments({ approved: false, isActive: true });
    console.log('Total pending students:', total);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: students.length,
          totalPending: total
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Error in getPendingStudents:', error);
    logger.error('Error in getPendingStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Approve student registration
 * @route   PATCH /api/admin/approve/:studentId
 * @access  Private (Admin)
 */
export const approveStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const adminId = req.admin?.id;

    console.log('Approval request for studentId:', studentId);
    console.log('Admin ID:', adminId);

    const student = await Student.findById(studentId);

    if (!student) {
      console.log('Student not found with ID:', studentId);
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    console.log('Found student:', student.rollNo, 'Current approved status:', student.approved);

    if (student.approved) {
      console.log('Student already approved:', student.rollNo);
      res.status(400).json({
        success: false,
        message: 'Student is already approved'
      } as ApiResponse);
      return;
    }

    console.log('Approving student:', student.rollNo);
    
    // Use findByIdAndUpdate to avoid triggering password validation
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { 
        approved: true, 
        approvedAt: new Date(), 
        approvedBy: new mongoose.Types.ObjectId(adminId) 
      },
      { new: true, runValidators: false }
    );

    if (!updatedStudent) {
      console.log('Failed to update student:', student.rollNo);
      res.status(500).json({
        success: false,
        message: 'Failed to approve student'
      } as ApiResponse);
      return;
    }

    console.log('Student approved successfully:', updatedStudent.rollNo);


    logger.info(`Student approved: ${student.rollNo} by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: 'Student approved successfully',
      data: {
        id: updatedStudent._id,
        name: updatedStudent.name,
        rollNo: updatedStudent.rollNo,
        approved: updatedStudent.approved,
        approvedAt: updatedStudent.approvedAt
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Error in approveStudent:', error);
    logger.error('Error in approveStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Reject student registration
 * @route   PATCH /api/admin/reject/:studentId
 * @access  Private (Admin)
 */
export const rejectStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    // For now, we'll just deactivate the student
    // In a real application, you might want to keep a rejection log
    student.isActive = false;
    await student.save();

    logger.info(`Student rejected: ${student.rollNo} - Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Student registration rejected',
      data: {
        id: student._id,
        rollNo: student.rollNo,
        reason
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in rejectStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get all students with their hours and events
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      approved, 
      sortBy = 'totalHours', 
      order = 'desc',
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { isActive: true };
    if (approved !== undefined) {
      filter.approved = approved === 'true';
    }

    // Build search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder;

    const students = await Student.find(filter)
      .populate('events.eventId', 'name date type')
      .select('-__v')
      .sort(sortObj)
      .limit(limitNum)
      .skip(skip);

    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: students.length,
          totalStudents: total
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getAllStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get comprehensive dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get basic counts
    const [
      totalStudents,
      approvedStudents,
      pendingStudents,
      totalEvents,
      activeEvents
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ approved: true, isActive: true }),
      Student.countDocuments({ approved: false, isActive: true }),
      Event.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true, date: { $gte: new Date() } })
    ]);

    // Get total hours distributed
    const totalHoursResult = await Student.aggregate([
      { $match: { approved: true, isActive: true } },
      { $group: { _id: null, totalHours: { $sum: '$totalHours' } } }
    ]);
    const totalHours = totalHoursResult[0]?.totalHours || 0;

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await Student.countDocuments({
      registeredAt: { $gte: sevenDaysAgo },
      isActive: true
    });

    // Get top performers
    const topPerformers = await Student.find({
      approved: true,
      isActive: true,
      totalHours: { $gt: 0 }
    })
      .select('name rollNo totalHours eventCount')
      .sort({ totalHours: -1 })
      .limit(5);

    // Get event type distribution
    const eventTypeStats = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Student.aggregate([
      {
        $match: {
          registeredAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          },
          isActive: true
        }
      },
      {
        $group: {
          _id: { $month: '$registeredAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get branch-wise statistics
    const branchStats = await Student.aggregate([
      { $match: { approved: true, isActive: true } },
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
          avgHours: { $avg: '$totalHours' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          approvedStudents,
          pendingStudents,
          totalEvents,
          activeEvents,
          totalHours,
          recentRegistrations
        },
        topPerformers,
        eventTypeStats,
        monthlyStats,
        branchStats
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Export students data to Excel
 * @route   GET /api/admin/export-students
 * @access  Private (Admin)
 */
export const exportStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { approved, format = 'excel' } = req.query;

    // Build filter
    const filter: any = { isActive: true };
    if (approved !== undefined) {
      filter.approved = approved === 'true';
    }

    const students = await Student.find(filter)
      .populate('events.eventId', 'name date type')
      .select('name rollNo email phone year branch totalHours approved registeredAt approvedAt')
      .sort({ registeredAt: -1 });

    if (format === 'excel') {
      // Prepare data for Excel
      const excelData = students.map(student => ({
        'Name': student.name,
        'Roll No': student.rollNo,
        'Email': student.email,
        'Phone': student.phone || '',
        'Year': student.year || '',
        'Branch': student.branch || '',
        'Total Hours': student.totalHours,
        'Events Count': student.events.length,
        'Status': student.approved ? 'Approved' : 'Pending',
        'Registered Date': student.registeredAt.toLocaleDateString(),
        'Approved Date': student.approvedAt ? student.approvedAt.toLocaleDateString() : ''
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=students_${new Date().toISOString().split('T')[0]}.xlsx`);

      res.send(buffer);
    } else {
      // Return JSON format
      res.status(200).json({
        success: true,
        data: students
      } as ApiResponse);
    }

  } catch (error) {
    logger.error('Error in exportStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get hours report
 * @route   GET /api/admin/hours-report
 * @access  Private (Admin)
 */
export const getHoursReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, branch, year } = req.query;

    // Build filter
    const filter: any = { approved: true, isActive: true };
    
    if (startDate && endDate) {
      filter.registeredAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (branch) {
      filter.branch = branch;
    }
    
    if (year) {
      filter.year = parseInt(year as string);
    }

    const students = await Student.find(filter)
      .select('name rollNo email branch year totalHours events')
      .populate('events.eventId', 'name date type')
      .sort({ totalHours: -1 });

    // Calculate statistics
    const totalStudents = students.length;
    const totalHours = students.reduce((sum, student) => sum + student.totalHours, 0);
    const avgHours = totalStudents > 0 ? totalHours / totalStudents : 0;
    const maxHours = Math.max(...students.map(s => s.totalHours));
    const minHours = Math.min(...students.map(s => s.totalHours));

    // Group by branch
    const branchStats = students.reduce((acc, student) => {
      const branch = student.branch || 'Unknown';
      if (!acc[branch]) {
        acc[branch] = { count: 0, totalHours: 0, students: [] };
      }
      acc[branch].count++;
      acc[branch].totalHours += student.totalHours;
      acc[branch].students.push(student);
      return acc;
    }, {} as any);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalHours,
          avgHours: Math.round(avgHours * 100) / 100,
          maxHours,
          minHours
        },
        branchStats,
        students
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getHoursReport:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Bulk export functionality
 * @route   POST /api/admin/bulk-export
 * @access  Private (Admin)
 */
export const bulkExport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { exportType, filters } = req.body;

    let data: any[] = [];
    let filename = '';

    switch (exportType) {
      case 'students':
        const studentFilter: any = { isActive: true };
        if (filters?.approved !== undefined) {
          studentFilter.approved = filters.approved;
        }
        if (filters?.branch) {
          studentFilter.branch = filters.branch;
        }
        
        data = await Student.find(studentFilter)
          .populate('events.eventId', 'name date type')
          .select('name rollNo email phone year branch totalHours approved registeredAt')
          .sort({ registeredAt: -1 });
        
        filename = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'events':
        const eventFilter: any = { isActive: true };
        if (filters?.type) {
          eventFilter.type = filters.type;
        }
        
        data = await Event.find(eventFilter)
          .populate('attendees', 'name rollNo')
          .select('name description date givenHours location type attendees')
          .sort({ date: -1 });
        
        filename = `events_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'attendance':
        const { eventId } = filters;
        if (!eventId) {
          res.status(400).json({
            success: false,
            message: 'Event ID is required for attendance export'
          } as ApiResponse);
          return;
        }
        
        const event = await Event.findById(eventId).populate('attendees');
        if (!event) {
          res.status(404).json({
            success: false,
            message: 'Event not found'
          } as ApiResponse);
          return;
        }
        
        data = event.attendees.map((student: any) => ({
          'Name': student.name,
          'Roll No': student.rollNo,
          'Email': student.email,
          'Branch': student.branch,
          'Year': student.year
        }));
        
        filename = `attendance_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid export type'
        } as ApiResponse);
        return;
    }

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    res.send(buffer);

  } catch (error) {
    logger.error('Error in bulkExport:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};


/**
 * @desc    Admin: update editable student fields
 * @route   PATCH /api/admin/students/:studentId
 * @access  Private (Admin)
 */
export const updateStudentByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    // Only allow a safe subset of fields to be edited by admin
    const { name, email, phone, year, branch, approved } = req.body || {};

    const update: any = {};
    if (typeof name === 'string') update.name = name.trim();
    if (typeof email === 'string') update.email = email.toLowerCase();
    if (typeof phone === 'string') update.phone = phone;
    if (typeof year !== 'undefined') update.year = Number(year);
    if (typeof branch === 'string') update.branch = branch.toUpperCase();
    if (typeof approved === 'boolean') update.approved = approved;

    const student = await Student.findByIdAndUpdate(
      studentId,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }

    res.status(200).json({ success: true, message: 'Student updated', data: { student } } as ApiResponse);
  } catch (error) {
    logger.error('Error in updateStudentByAdmin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Admin: block a student (sets isActive=false)
 * @route   PATCH /api/admin/students/:studentId/block
 * @access  Private (Admin)
 */
export const blockStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findByIdAndUpdate(
      studentId,
      { isActive: false },
      { new: true }
    ).select('name rollNo isActive');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }

    res.status(200).json({ success: true, message: 'Student blocked', data: { student } } as ApiResponse);
  } catch (error) {
    logger.error('Error in blockStudent:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Admin: unblock a student (sets isActive=true)
 * @route   PATCH /api/admin/students/:studentId/unblock
 * @access  Private (Admin)
 */
export const unblockStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findByIdAndUpdate(
      studentId,
      { isActive: true },
      { new: true }
    ).select('name rollNo isActive');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }

    res.status(200).json({ success: true, message: 'Student unblocked', data: { student } } as ApiResponse);
  } catch (error) {
    logger.error('Error in unblockStudent:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Admin: permanently delete a student
 * @route   DELETE /api/admin/students/:studentId
 * @access  Private (Admin)
 */
export const deleteStudentByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const deleted = await Student.findByIdAndDelete(studentId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }
    res.status(200).json({ success: true, message: 'Student deleted' } as ApiResponse);
  } catch (error) {
    logger.error('Error in deleteStudentByAdmin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};



/**
 * @desc    Get event-wise attendance list
 * @route   GET /api/admin/event-attendance/:eventId
 * @access  Private (Admin)
 */
export const getEventAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate({
      path: 'attendees',
      select: 'name rollNo email branch year events',
    });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    // For each attendee, get their hours for this event
    const attendance = await Promise.all(
      event.attendees.map(async (student: any) => {
        const studentDoc = await Student.findById(student._id);
        const eventEntry = studentDoc?.events.find(e => e.eventId.toString() === eventId);
        return {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          branch: student.branch,
          year: student.year,
          hours: eventEntry?.hours || 0,
          attendedAt: eventEntry?.attendedAt || null
        };
      })
    );
    res.status(200).json({ success: true, data: { event: { id: event._id, name: event.name }, attendance } });
  } catch (error) {
    logger.error('Error in getEventAttendance:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * @desc    Manually add a student to an event
 * @route   POST /api/admin/add-student-to-event
 * @access  Private (Admin)
 */
export const manualAddStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { studentId, hours } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID or student ID'
      } as ApiResponse);
      return;
    }

    const [event, student] = await Promise.all([
      Event.findById(eventId),
      Student.findById(studentId)
    ]);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      } as ApiResponse);
      return;
    }

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    if (!student.approved) {
      res.status(400).json({
        success: false,
        message: 'Student is not approved yet'
      } as ApiResponse);
      return;
    }

    // Check if student is already in the event
    const alreadyAttended = student.events.some(
      e => e.eventId.toString() === eventId
    );

    if (alreadyAttended) {
      res.status(400).json({
        success: false,
        message: 'Student has already attended this event'
      } as ApiResponse);
      return;
    }

    // Add student to event
    const hoursToAdd = hours || event.givenHours;
    
    // Use the addEvent method from the Student model
    (student as any).addEvent(new mongoose.Types.ObjectId(eventId), hoursToAdd);
    await student.save();

    // Add student to event attendees
    event.attendees.push(new mongoose.Types.ObjectId(studentId));
    await event.save();

    logger.info(`Student ${student.rollNo} manually added to event ${event.name} by admin ${req.admin?.id}`);

    res.status(200).json({
      success: true,
      message: 'Student added to event successfully',
      data: {
        student: {
          name: student.name,
          rollNo: student.rollNo
        },
        event: {
          name: event.name,
          date: event.date
        },
        hoursAdded: hoursToAdd,
        newTotalHours: student.totalHours
      }
    } as ApiResponse);

    // Notify student best-effort
    try {
      const note = new Notification({
        userId: (student._id as any).toString(),
        userType: 'student',
        title: 'Added to Event',
        message: `You were added to ${event.name}. Hours credited: ${hoursToAdd}.`,
        type: 'success',
        link: '/student/dashboard'
      });
      await note.save();
    } catch (e) {
      logger.error('Error creating manual-add notification for student:', e);
    }

  } catch (error) {
    logger.error('Error in manualAddStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Create new event
 * @route   POST /api/admin/create-event
 * @access  Private (Admin)
 */
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { name, description, date, givenHours, location, type, maxAttendees, requirements } = req.body;
    const adminId = req.admin?.id;

    const event = new Event({
      name,
      description,
      date: new Date(date),
      givenHours: Number(givenHours),
      location,
      type,
      maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
      requirements: requirements || [],
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    });

    await event.save();

    logger.info(`Event created: ${event.name} by admin ${adminId}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: event._id,
        name: event.name,
        date: event.date,
        type: event.type
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in createEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get upload template
 * @route   GET /api/admin/upload-template
 * @access  Private (Admin)
 */
export const getUploadTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Create sample data for template
    const templateData = [
      {
        'student_id': 'CS23B1001',
        'event_name': 'Tree Plantation Drive',
        'hours': 4
      },
      {
        'student_id': 'CS23B1002',
        'event_name': 'Blood Donation Camp',
        'hours': 6
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_template.xlsx');

    res.send(buffer);

  } catch (error) {
    logger.error('Error in getUploadTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};