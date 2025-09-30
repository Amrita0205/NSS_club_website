import { Notification } from '../components/NotificationSystem';
import axios from 'axios';

export const addNotification = async (
  userType: 'student' | 'admin',
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
) => {
  try {
    if (typeof window === 'undefined') return null;
    
    // Get admin token for authentication
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      console.error('Admin token not found');
      return null;
    }

    const response = await axios.post('http://localhost:5000/api/notifications', {
      userType,
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

export const getNotifications = (userType: 'student' | 'admin', userId: string): Notification[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const storedNotifications = localStorage.getItem(`${userType}_notifications_${userId}`);
    if (!storedNotifications) return [];
    
    const notifications = JSON.parse(storedNotifications);
    return notifications.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const getUnreadCount = (userType: 'student' | 'admin', userId: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const notifications = getNotifications(userType, userId);
  return notifications.filter(n => !n.read).length;
};

export const markNotificationAsRead = (userType: 'student' | 'admin', userId: string, notificationId: string) => {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications(userType, userId);
  const updatedNotifications = notifications.map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  
  localStorage.setItem(`${userType}_notifications_${userId}`, JSON.stringify(updatedNotifications));
};

export const markAllNotificationsAsRead = (userType: 'student' | 'admin', userId: string) => {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications(userType, userId);
  const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
  
  localStorage.setItem(`${userType}_notifications_${userId}`, JSON.stringify(updatedNotifications));
};

export const deleteNotification = (userType: 'student' | 'admin', userId: string, notificationId: string) => {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications(userType, userId);
  const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
  
  localStorage.setItem(`${userType}_notifications_${userId}`, JSON.stringify(updatedNotifications));
};

export const clearAllNotifications = (userType: 'student' | 'admin', userId: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(`${userType}_notifications_${userId}`);
};

// Predefined notification templates
export const notificationTemplates = {
  welcome: (userType: 'student' | 'admin') => ({
    title: 'Welcome to NSS Portal',
    message: `Welcome to the ${userType === 'student' ? 'Student' : 'Admin'} Portal! Get started by exploring your dashboard.`,
    type: 'info' as const
  }),
  
  profileUpdated: () => ({
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated.',
    type: 'success' as const
  }),
  
  eventRegistered: (eventName: string) => ({
    title: 'Event Registration Successful',
    message: `You have successfully registered for "${eventName}".`,
    type: 'success' as const
  }),
  
  eventReminder: (eventName: string, date: string) => ({
    title: 'Event Reminder',
    message: `Don't forget! "${eventName}" is scheduled for ${date}.`,
    type: 'warning' as const
  }),
  
  hoursEarned: (hours: number, eventName: string) => ({
    title: 'Hours Earned',
    message: `Congratulations! You earned ${hours} hours for attending "${eventName}".`,
    type: 'success' as const
  }),
  
  approvalRequired: (studentName: string) => ({
    title: 'Student Approval Required',
    message: `${studentName} has registered and requires your approval.`,
    type: 'warning' as const
  }),
  
  studentApproved: (studentName: string) => ({
    title: 'Student Approved',
    message: `${studentName} has been approved and can now access the portal.`,
    type: 'success' as const
  }),
  
  newEventCreated: (eventName: string) => ({
    title: 'New Event Created',
    message: `A new event "${eventName}" has been created and is now available for registration.`,
    type: 'info' as const
  }),
  
  systemMaintenance: () => ({
    title: 'System Maintenance',
    message: 'The system will be under maintenance from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.',
    type: 'warning' as const
  }),
  
  errorOccurred: (action: string) => ({
    title: 'Error Occurred',
    message: `An error occurred while ${action}. Please try again or contact support.`,
    type: 'error' as const
  })
}; 