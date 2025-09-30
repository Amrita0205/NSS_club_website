import express from 'express';
import { body } from 'express-validator';

import {
  adminLogin,
  adminGoogleLogin,
  registerAdmin,
  getPendingStudents,
  approveStudent,
  rejectStudent,
  getAllStudents,
  getDashboardStats,
  exportStudents,
  getHoursReport,
  bulkExport,
  getEventAttendance,
  createEvent,
  getUploadTemplate,
  getAdminProfile,
  updateStudentByAdmin,
  blockStudent,
  unblockStudent,
  deleteStudentByAdmin,
  manualAddStudent
} from '../controllers/adminController';
import { adminAuth } from '../middlewares/adminAuth';

const router = express.Router();



/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('passKey')
    .notEmpty()
    .withMessage('Passkey is required')
], adminLogin);

/**
 * @route   POST /api/admin/google-login
 * @desc    Admin Google login (org restricted + passkey)
 * @access  Public
 */
router.post('/google-login', [
  body('idToken').notEmpty().withMessage('idToken is required'),
  body('passKey').notEmpty().withMessage('Passkey is required')
], adminGoogleLogin);

/**
 * @route   POST /api/admin/register
 * @desc    Register a new admin
 * @access  Public
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('passKey')
    .notEmpty()
    .withMessage('Passkey is required')
], registerAdmin);

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get('/profile', adminAuth, getAdminProfile);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminAuth, getDashboardStats);

/**
 * @route   GET /api/admin/pending-students
 * @desc    Get pending student registrations
 * @access  Private (Admin)
 */
router.get('/pending-students', adminAuth, getPendingStudents);

/**
 * @route   GET /api/admin/students
 * @desc    Get all students with filtering and pagination
 * @access  Private (Admin)
 */
router.get('/students', adminAuth, getAllStudents);

/**
 * @route   PATCH /api/admin/students/:studentId
 * @desc    Update student details (admin)
 * @access  Private (Admin)
 */
router.patch('/students/:studentId', adminAuth, updateStudentByAdmin);

/**
 * @route   PATCH /api/admin/students/:studentId/block
 * @desc    Block student (isActive=false)
 * @access  Private (Admin)
 */
router.patch('/students/:studentId/block', adminAuth, blockStudent);

/**
 * @route   PATCH /api/admin/students/:studentId/unblock
 * @desc    Unblock student (isActive=true)
 * @access  Private (Admin)
 */
router.patch('/students/:studentId/unblock', adminAuth, unblockStudent);

/**
 * @route   DELETE /api/admin/students/:studentId
 * @desc    Delete student permanently
 * @access  Private (Admin)
 */
router.delete('/students/:studentId', adminAuth, deleteStudentByAdmin);

/**
 * @route   PATCH /api/admin/approve/:studentId
 * @desc    Approve student registration
 * @access  Private (Admin)
 */
router.patch('/approve/:studentId', adminAuth, approveStudent);

/**
 * @route   PATCH /api/admin/reject/:studentId
 * @desc    Reject student registration
 * @access  Private (Admin)
 */
router.patch('/reject/:studentId', [
  adminAuth,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], rejectStudent);

/**
 * @route   GET /api/admin/export-students
 * @desc    Export students data to Excel
 * @access  Private (Admin)
 */
router.get('/export-students', adminAuth, exportStudents);

/**
 * @route   GET /api/admin/hours-report
 * @desc    Get hours report with filtering
 * @access  Private (Admin)
 */
router.get('/hours-report', adminAuth, getHoursReport);

/**
 * @route   POST /api/admin/bulk-export
 * @desc    Bulk export data (students, events, attendance)
 * @access  Private (Admin)
 */
router.post('/bulk-export', adminAuth, bulkExport);



/**
 * @route   GET /api/admin/event/:eventId/attendance
 * @desc    Get event attendance details
 * @access  Private (Admin)
 */
router.get('/event/:eventId/attendance', adminAuth, getEventAttendance);

/**
 * @route   POST /api/admin/event/:eventId/manual-add
 * @desc    Add student to event manually
 * @access  Private (Admin)
 */
router.post('/event/:eventId/manual-add', [
  adminAuth,
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('hours')
    .optional()
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Hours must be between 0.5 and 24')
], manualAddStudent);

/**
 * @route   POST /api/admin/create-event
 * @desc    Create a new event
 * @access  Private (Admin)
 */
router.post('/create-event', [
  adminAuth,
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('givenHours')
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Given hours must be between 0.5 and 24'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('type')
    .isIn(['community_service', 'awareness', 'donation', 'cleaning', 'education', 'other'])
    .withMessage('Invalid event type'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be at least 1')
], createEvent);

/**
 * @route   GET /api/admin/upload-template
 * @desc    Download attendance upload template
 * @access  Private (Admin)
 */
router.get('/upload-template', adminAuth, getUploadTemplate);

export default router;