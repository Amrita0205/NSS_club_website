import express from 'express';
import { body } from 'express-validator';
import {
  registerStudent,
  getStudentProfile,
  getCurrentStudentProfile,
  getStudentEvents,
  checkRegistrationStatus,
  getLeaderboard,
  loginStudent,
  googleLoginStudent
} from '../controllers/studentController';
import { studentAuth } from '../middlewares/studentAuth';

const router = express.Router();

/**
 * @route   POST /api/student/register
 * @desc    Register a new student for NSS
 * @access  Public
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('rollNo')
    .trim()
    .matches(/^[A-Z]{2}\d{2}[A-Z]\d{4}$/)
    .withMessage('Invalid roll number format (e.g., CS23B1006)'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number format'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('branch')
    .optional()
    .isString()
    .trim()
    .withMessage('Branch must be a string'),
], registerStudent);

/**
 * @route   GET /api/student/profile
 * @desc    Get current student profile (using JWT token)
 * @access  Private (Student)
 */
router.get('/profile', studentAuth, getCurrentStudentProfile);

/**
 * @route   GET /api/student/profile/:rollNo
 * @desc    Get student profile by roll number
 * @access  Public
 */
router.get('/profile/:rollNo', getStudentProfile);

/**
 * @route   GET /api/student/:rollNo/events
 * @desc    Get student's event history
 * @access  Public
 */
router.get('/:rollNo/events', getStudentEvents);

/**
 * @route   GET /api/student/status/:rollNo
 * @desc    Check student registration status
 * @access  Public
 */
router.get('/status/:rollNo', checkRegistrationStatus);

/**
 * @route   GET /api/student/leaderboard
 * @desc    Get student leaderboard (top performers)
 * @access  Public
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @route   POST /api/student/login
 * @desc    Student login
 * @access  Public
 */
router.post('/login', loginStudent);

/**
 * @route   POST /api/student/google-login
 * @desc    Student login via Google (org restricted)
 * @access  Public
 */
router.post('/google-login', googleLoginStudent);

router.get("/test",(req,res)=>{
  console.log('Test route hit!');
  res.json({ok:true,message:"Hello World"})
});

/**
 * @route   GET /api/student/test-jwt
 * @desc    Test JWT token generation
 * @access  Public
 */
router.get("/test-jwt", (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024';
    
    console.log('Testing JWT generation...');
    console.log('JWT Secret available:', !!jwtSecret);
    console.log('JWT Secret length:', jwtSecret.length);
    
    const testPayload = { 
      id: 'test-id', 
      rollNo: 'TEST123', 
      email: 'test@example.com' 
    };
    
    const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '1h' });
    
    console.log('Test token generated:', !!token);
    console.log('Test token length:', token.length);
    
    res.json({
      success: true,
      message: 'JWT test successful',
      data: {
        token,
        payload: testPayload,
        secretLength: jwtSecret.length
      }
    });
  } catch (error: any) {
    console.error('JWT test failed:', error);
    res.status(500).json({
      success: false,
      message: 'JWT test failed: ' + error.message
    });
  }
});

export default router;