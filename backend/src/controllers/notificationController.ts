import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { logger } from '../utils/logger';

// Get notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;
    
    const notifications = await Notification.find({ 
      userId, 
      userType 
    })
    .sort({ createdAt: -1 })
    .limit(50);

    return res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId || notificationId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notificationId' });
    }
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notificationId format' });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;
    
    await Notification.updateMany(
      { userId, userType, read: false },
      { read: true }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId || notificationId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid notificationId' });
    }
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notificationId format' });
    }
    
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Create a notification (for admin use)
export const createNotification = async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { userId, userType, title, message, type = 'info', link } = req.body;
    
    if (!userId || !userType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userType, title, message'
      });
    }

    if (!['student', 'admin'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userType. Must be "student" or "admin"'
      });
    }

    if (!['success', 'error', 'warning', 'info'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "success", "error", "warning", or "info"'
      });
    }
    
    const notification = new Notification({
      userId,
      userType,
      title,
      message,
      type,
      link
    });

    await notification.save();

    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

// Get unread count for a user
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.params;
    
    const count = await Notification.countDocuments({ 
      userId, 
      userType, 
      read: false 
    });

    return res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
}; 