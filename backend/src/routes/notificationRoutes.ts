import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
} from '../controllers/notificationController';
import { adminAuth } from '../middlewares/adminAuth';
import { studentAuth } from '../middlewares/studentAuth';

const router = express.Router();

// Get notifications for a user
router.get('/:userType/:userId', getNotifications);

// Get unread count for a user
router.get('/:userType/:userId/unread', getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read for a user
router.patch('/:userType/:userId/read-all', markAllAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

// Create a notification (admin only)
router.post('/', adminAuth, createNotification);

export default router; 