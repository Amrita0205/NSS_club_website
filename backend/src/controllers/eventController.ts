import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Event from '../models/Event';
import Student from '../models/Student';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/response';
import { AuthRequest } from '../types/auth';
import { processAttendanceExcel, generateAttendanceTemplate } from '../utils/excelProcessor';
import Notification from '../models/Notification';

/**
 * @desc    Create a new event
 * @route   POST /api/event/create
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

    const { 
      name, 
      description, 
      date, 
      givenHours, 
      location, 
      type, 
      maxAttendees,
      requirements 
    } = req.body;

    const event = new Event({
      name: name.trim(),
      description: description.trim(),
      date: new Date(date),
      givenHours,
      location: location?.trim(),
      type,
      maxAttendees,
      requirements,
      createdBy: req.admin?.id
    });

    await event.save();

    logger.info(`New event created: ${name} by admin ${req.admin?.id}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
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
 * @desc    Get all events
 * @route   GET /api/event/all
 * @access  Public
 */
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      upcoming, 
      sortBy = 'date', 
      order = 'desc' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { isActive: true };
    if (type) {
      filter.type = type;
    }
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    } else if (upcoming === 'false') {
      filter.date = { $lt: new Date() };
    }

    // Build sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder;

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name rollNo')
      .select('-__v')
      .sort(sortObj)
      .limit(limitNum)
      .skip(skip);

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: events.length,
          totalEvents: total
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getAllEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get upcoming events
 * @route   GET /api/event/upcoming
 * @access  Public
 */
export const getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const events = await Event.find({
      isActive: true,
      date: { $gte: new Date() }
    })
      .populate('createdBy', 'name email')
      .populate('attendees', 'name rollNo')
      .select('-__v')
      .sort({ date: 1 })
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        events,
        count: events.length
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getUpcomingEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get event attendance
 * @route   GET /api/event/:eventId/attendance
 * @access  Private (Admin)
 */
export const getEventAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      } as ApiResponse);
      return;
    }

    const event = await Event.findById(eventId)
      .populate({
        path: 'attendees',
        select: 'name rollNo email totalHours events',
        match: { isActive: true }
      });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      } as ApiResponse);
      return;
    }

    // Get detailed attendance with hours for this specific event
    const attendanceDetails = await Promise.all(
      event.attendees.map(async (studentId) => {
        const student = await Student.findById(studentId)
          .select('name rollNo email totalHours events');
        
        if (!student) return null;

        const eventRecord = student.events.find(
          e => e.eventId.toString() === eventId
        );

        return {
          student: {
            id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            email: student.email,
            totalHours: student.totalHours
          },
          hoursEarned: eventRecord?.hours || 0,
          attendedAt: eventRecord?.attendedAt
        };
      })
    );

    const validAttendance = attendanceDetails.filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          date: event.date,
          givenHours: event.givenHours,
          type: event.type,
          location: event.location
        },
        attendance: validAttendance,
        stats: {
          totalAttendees: validAttendance.length
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getEventAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Manually add student to event
 * @route   POST /api/event/:eventId/manual-add
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
 * @desc    Upload Excel file for event attendance
 * @route   POST /api/event/:eventId/upload-attendance
 * @access  Private (Admin)
 */
export const uploadAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      } as ApiResponse);
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      } as ApiResponse);
      return;
    }

    // Process Excel file
    const result = await processAttendanceExcel(req.file.buffer, eventId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message
      } as ApiResponse);
      return;
    }

    logger.info(`Excel attendance uploaded for event ${event.name}: ${result.data?.processedRecords} records processed`);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    } as ApiResponse);

    // Notify admin with summary
    try {
      const note = new Notification({
        userId: 'admin',
        userType: 'admin',
        title: 'Attendance Upload Complete',
        message: `${event.name}: processed ${result.data?.processedRecords || 0}/${result.data?.totalRecords || 0} records`,
        type: 'success',
        link: '/admin/events'
      });
      await note.save();
    } catch (e) {
      logger.error('Error creating attendance-upload notification:', e);
    }

  } catch (error) {
    logger.error('Error in uploadAttendance:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Download attendance template
 * @route   GET /api/event/template
 * @access  Private (Admin)
 */
export const downloadAttendanceTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buffer = generateAttendanceTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_template.xlsx');
    res.send(buffer);

  } catch (error) {
    logger.error('Error in downloadAttendanceTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Get event by ID
 * @route   GET /api/event/:eventId
 * @access  Public
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      } as ApiResponse);
      return;
    }

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name rollNo totalHours');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: event
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in getEventById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

/**
 * @desc    Student registers for an event
 * @route   POST /api/event/:eventId/register
 * @access  Private (Student)
 */
export const studentRegisterForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const studentId = req.student?.id;

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Student not authenticated' } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' } as ApiResponse);
      return;
    }

    const [event, student] = await Promise.all([
      Event.findById(eventId),
      Student.findById(studentId)
    ]);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' } as ApiResponse);
      return;
    }
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }

    if (!student.approved) {
      res.status(400).json({ success: false, message: 'Your account is not approved yet' } as ApiResponse);
      return;
    }

    // Already registered?
    const alreadyRegistered = event.attendees.some((id: any) => id.toString() === studentId);
    if (alreadyRegistered) {
      res.status(400).json({ success: false, message: 'Already registered for this event' } as ApiResponse);
      return;
    }

    // Capacity check if maxAttendees set
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      res.status(400).json({ success: false, message: 'Event is full' } as ApiResponse);
      return;
    }

    // Register: add to event attendees only. Hours will be credited after attendance upload.
    event.attendees.push(new mongoose.Types.ObjectId(studentId));
    await event.save();

    // Notify admin and student (best-effort)
    try {
      await Notification.create({
        userId: studentId,
        userType: 'student',
        title: 'Registered for Event',
        message: `You registered for ${event.name} on ${new Date(event.date).toLocaleDateString()}.`,
        type: 'success',
        link: '/student/events'
      });
    } catch (e) {
      logger.error('Error creating registration notifications:', e);
    }

    res.status(200).json({ success: true, message: 'Registered successfully' } as ApiResponse);
  } catch (error) {
    logger.error('Error in studentRegisterForEvent:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Student unregisters from an event
 * @route   POST /api/event/:eventId/unregister
 * @access  Private (Student)
 */
export const studentUnregisterFromEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const studentId = req.student?.id;

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Student not authenticated' } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' } as ApiResponse);
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' } as ApiResponse);
      return;
    }

    // Remove from attendees if present
    const beforeCount = event.attendees.length;
    event.attendees = event.attendees.filter((id: any) => id.toString() !== studentId);

    if (event.attendees.length === beforeCount) {
      res.status(400).json({ success: false, message: 'You are not registered for this event' } as ApiResponse);
      return;
    }

    await event.save();

    // Best-effort notify
    try {
      await Notification.create({
        userId: studentId,
        userType: 'student',
        title: 'Unregistered from Event',
        message: `You unregistered from ${event.name}.`,
        type: 'info',
        link: '/student/events'
      });
    } catch (e) {
      logger.error('Error creating unregister notification:', e);
    }

    res.status(200).json({ success: true, message: 'Unregistered successfully' } as ApiResponse);
  } catch (error) {
    logger.error('Error in studentUnregisterFromEvent:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Mark event as completed
 * @route   PATCH /api/event/:eventId/complete
 * @access  Private (Admin)
 */
export const markEventCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' } as ApiResponse);
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' } as ApiResponse);
      return;
    }

    if (event.isCompleted) {
      res.status(400).json({ success: false, message: 'Event is already marked as completed' } as ApiResponse);
      return;
    }

    // Mark event as completed
    event.isCompleted = true;
    event.completedAt = new Date();
    event.completedBy = new mongoose.Types.ObjectId(req.admin?.id);
    await event.save();

    logger.info(`Event ${event.name} marked as completed by admin ${req.admin?.id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Event marked as completed successfully',
      data: {
        eventId: event._id,
        name: event.name,
        completedAt: event.completedAt
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in markEventCompleted:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};

/**
 * @desc    Add bonus hours to a student for an event
 * @route   POST /api/event/:eventId/bonus-hours
 * @access  Private (Admin)
 */
export const addBonusHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { studentId, bonusHours } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID or student ID' } as ApiResponse);
      return;
    }

    const bonusHoursNum = parseFloat(bonusHours);
    if (isNaN(bonusHoursNum) || bonusHoursNum < 0 || bonusHoursNum > 10) {
      res.status(400).json({ success: false, message: 'Invalid bonus hours (0-10 allowed)' } as ApiResponse);
      return;
    }

    const [event, student] = await Promise.all([
      Event.findById(eventId),
      Student.findById(studentId)
    ]);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' } as ApiResponse);
      return;
    }
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' } as ApiResponse);
      return;
    }

    // Find the event in student's events
    const studentEvent = student.events.find((e: any) => e.eventId.toString() === eventId);
    if (!studentEvent) {
      res.status(400).json({ success: false, message: 'Student has not attended this event' } as ApiResponse);
      return;
    }

    // Add bonus hours to existing hours
    const originalHours = studentEvent.hours;
    studentEvent.hours = originalHours + bonusHoursNum;
    
    // Recalculate total hours
    student.totalHours = student.events.reduce((total: number, event: any) => total + event.hours, 0);
    
    await student.save();

    // Notify student about bonus hours
    try {
      await Notification.create({
        userId: studentId,
        userType: 'student',
        title: 'Bonus Hours Added',
        message: `You received ${bonusHoursNum} bonus hours for ${event.name}. Total hours: ${studentEvent.hours}`,
        type: 'success',
        link: '/student/dashboard'
      });
    } catch (e) {
      logger.error('Error creating bonus hours notification:', e);
    }

    res.status(200).json({ 
      success: true, 
      message: `Added ${bonusHoursNum} bonus hours to ${student.name}`,
      data: {
        studentName: student.name,
        rollNo: student.rollNo,
        originalHours,
        bonusHours: bonusHoursNum,
        totalHours: studentEvent.hours
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error in addBonusHours:', error);
    res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
  }
};