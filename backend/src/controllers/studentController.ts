import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Student from '../models/Student';
import Event from '../models/Event';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/response';
import { AuthRequest } from '../types/auth';
import Notification from '../models/Notification';
import { OAuth2Client } from 'google-auth-library';

/**
 * @desc    Register a new student
 * @route   POST /api/student/register
 * @access  Public
 */
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, rollNo, email, phone, year, branch, password } = req.body;
    
    // Enforce organization domain if configured
    const orgDomain = process.env.ORG_DOMAIN;
    if (orgDomain && !email.toLowerCase().endsWith(`@${orgDomain.toLowerCase()}`)) {
      res.status(403).json({
        success: false,
        message: `Only ${orgDomain} email accounts are allowed for registration`
      } as ApiResponse);
      return;
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }


    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }]
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: 'Student with this roll number or email already exists'
      } as ApiResponse);
      return;
    }

    // Create new student
    const student = new Student({
      name: name.trim(),
      rollNo: rollNo.toUpperCase(),
      email: email.toLowerCase(),
      phone,
      year: Number(year),
      branch: branch?.toUpperCase(),
      password // Save password (will be hashed by pre-save middleware)
    });

    await student.save();

    logger.info(`New student registered: ${rollNo} - ${name}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        approved: student.approved
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in registerStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Login student
 * @route   POST /api/student/login
 * @access  Public
 */
export const loginStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo, password } = req.body;
    const identifier: string = (rollNo || '').toString();
    console.log('Login attempt identifier:', identifier);

    let student = null as any;
    if (identifier.includes('@')) {
      // treat as email
      student = await Student.findOne({ email: identifier.toLowerCase() });
    } else {
      // treat as roll number
      student = await Student.findOne({ rollNo: identifier.toUpperCase() });
    }
    
    if (!student) {
      console.log('Student not found:', identifier);
      res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
      return;
    }
    
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', identifier);
      res.status(401).json({
        success: false,
        message: 'Invalid roll number or password'
      });
      return;
    }

    // Check if student is approved
    if (!student.approved) {
      console.log('Student not approved:', identifier);
      res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
      return;
    }

    // Check if student is active
    if (!student.isActive) {
      console.log('Student inactive:', identifier);
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
      return;
    }

    console.log('Student validation passed, generating token for:', identifier);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024';
    
    console.log('JWT Secret available:', !!jwtSecret);
    console.log('JWT Secret length:', jwtSecret.length);
    
    const tokenPayload = { 
      id: student._id, 
      rollNo: student.rollNo, 
      email: student.email 
    };
    
    console.log('Token payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
    console.log('Token generated successfully:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    console.log('Preparing response for:', identifier);
    
    const responseData = {
      success: true,
      message: 'Login successful',
      token: token,
      data: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        approved: student.approved,
        totalHours: student.totalHours
      }
    };
    
    console.log('Response data prepared, token included:', !!responseData.token);
    console.log('Sending response...');
    
    res.status(200).json(responseData);
    console.log('Response sent successfully for:', identifier);
    
  } catch (error: any) {
    console.error('Error in loginStudent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Get current student profile (using JWT token)
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
export const getCurrentStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.student?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'Student not authenticated'
      } as ApiResponse);
      return;
    }

    const student = await Student.findById(studentId)
      .populate('events.eventId', 'name date description type givenHours')
      .select('-__v');

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          phone: student.phone,
          branch: student.branch,
          year: student.year,
          approved: student.approved,
          totalHours: student.totalHours,
          events: student.events,
          registeredAt: student.registeredAt,
          approvedAt: student.approvedAt
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getCurrentStudentProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile/:rollNo
 * @access  Public
 */
export const getStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({ rollNo: rollNo.toUpperCase() })
      .populate('events.eventId', 'name date description type')
      .select('-__v');

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: student
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getStudentProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get student's event history
 * @route   GET /api/student/:rollNo/events
 * @access  Public
 */
export const getStudentEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({ rollNo: rollNo.toUpperCase() })
      .populate({
        path: 'events.eventId',
        select: 'name date description type location givenHours',
        match: { isActive: true }
      });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      } as ApiResponse);
      return;
    }

    // Filter out events that might be null due to populate match
    const validEvents = student.events.filter(event => event.eventId);

    res.status(200).json({
      success: true,
      data: {
        totalHours: student.totalHours,
        eventCount: validEvents.length,
        events: validEvents
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getStudentEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Check registration status
 * @route   GET /api/student/status/:rollNo
 * @access  Public
 */
export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({ rollNo: rollNo.toUpperCase() })
      .select('name rollNo email approved registeredAt approvedAt totalHours');

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found. Please register first.'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        approved: student.approved,
        registeredAt: student.registeredAt,
        approvedAt: student.approvedAt,
        totalHours: student.totalHours,
        status: student.approved ? 'approved' : 'pending'
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in checkRegistrationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get all approved students (for public leaderboard)
 * @route   GET /api/student/leaderboard
 * @access  Public
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    const students = await Student.find({ 
      approved: true, 
      isActive: true,
      totalHours: { $gt: 0 }
    })
      .select('name rollNo totalHours eventCount')
      .sort({ totalHours: -1, eventCount: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Student.countDocuments({ 
      approved: true, 
      isActive: true,
      totalHours: { $gt: 0 }
    });

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
    logger.error('Error in getLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Google Sign-In for students (org-restricted)
 * @route   POST /api/student/google-login
 * @access  Public
 */
export const googleLoginStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, rollNo } = req.body as { idToken?: string; rollNo?: string };

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
    const name = payload.name || '';
    const hostedDomain = (payload.hd || '').toLowerCase();

    if (!emailVerified) {
      res.status(401).json({ success: false, message: 'Google email not verified' } as ApiResponse);
      return;
    }

    if (orgDomain && hostedDomain !== orgDomain) {
      res.status(403).json({ success: false, message: 'Only organization accounts are allowed' } as ApiResponse);
      return;
    }

    let student = await Student.findOne({ email });

    // If student does not exist, require a valid roll number to register minimally
    if (!student) {
      if (!rollNo) {
        res.status(400).json({ success: false, message: 'New users must provide rollNo' } as ApiResponse);
        return;
      }

      // Create with a random password (unused for Google auth)
      const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);

      student = new Student({
        name: name.trim() || email.split('@')[0],
        rollNo: (rollNo as string).toUpperCase(),
        email,
        password: randomPassword
      } as any);

      await student.save();

    }

    // Approval and active checks same as password login
    if (!student.approved) {
      res.status(403).json({ success: false, message: 'Your account is pending approval. Please wait for admin approval.' });
      return;
    }

    if (!student.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024';

    const tokenPayload = {
      id: (student as any)._id,
      rollNo: student.rollNo,
      email: student.email
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    student.lastLogin = new Date();
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: (student as any)._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        approved: student.approved,
        totalHours: student.totalHours
      }
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Error in googleLoginStudent:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' } as ApiResponse);
  }
};