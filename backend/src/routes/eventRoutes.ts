import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import {
  createEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventAttendance,
  manualAddStudent,
  uploadAttendance,
  getEventById,
  downloadAttendanceTemplate,
  studentRegisterForEvent,
  studentUnregisterFromEvent,
  addBonusHours,
  markEventCompleted
} from '../controllers/eventController';
import { adminAuth } from '../middlewares/adminAuth';
import { studentAuth } from '../middlewares/studentAuth';

const router = express.Router();

// Configure multer for Excel file uploads (memory storage for better handling)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  }
});

/**
 * @route   POST /api/event/create
 * @desc    Create a new event
 * @access  Private (Admin)
 */
router.post('/create', [
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
    .withMessage('Max attendees must be at least 1'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array')
], createEvent);

/**
 * @route   GET /api/event/all
 * @desc    Get all events with filtering and pagination
 * @access  Public
 */
router.get('/all', getAllEvents);

/**
 * @route   GET /api/event/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /api/event/:eventId
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:eventId', getEventById);

/**
 * @route   GET /api/event/:eventId/attendance
 * @desc    Get event attendance details
 * @access  Private (Admin)
 */
router.get('/:eventId/attendance', adminAuth, getEventAttendance);

/**
 * @route   POST /api/event/:eventId/manual-add
 * @desc    Manually add student to event
 * @access  Private (Admin)
 */
router.post('/:eventId/manual-add', [
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
 * @route   POST /api/event/:eventId/upload-attendance
 * @desc    Upload Excel file for event attendance
 * @access  Private (Admin)
 */
router.post('/:eventId/upload-attendance', 
  adminAuth, 
  upload.single('attendanceFile'), 
  uploadAttendance
);

/**
 * @route   POST /api/event/:eventId/register
 * @desc    Student registers for event (adds to attendees)
 * @access  Private (Student)
 */
router.post('/:eventId/register', studentAuth, studentRegisterForEvent);

/**
 * @route   POST /api/event/:eventId/unregister
 * @desc    Student unregisters from event (removes from attendees)
 * @access  Private (Student)
 */
router.post('/:eventId/unregister', studentAuth, studentUnregisterFromEvent);

/**
 * @route   GET /api/event/template
 * @desc    Download attendance template
 * @access  Private (Admin)
 */
router.get('/template', adminAuth, downloadAttendanceTemplate);

/**
 * @route   POST /api/event/:eventId/bonus-hours
 * @desc    Add bonus hours to a student for an event
 * @access  Private (Admin)
 */
router.post('/:eventId/bonus-hours', [
  adminAuth,
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('bonusHours')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Bonus hours must be between 0 and 10')
], addBonusHours);

// Mark event as completed
router.patch('/:eventId/complete', adminAuth, markEventCompleted);

export default router;