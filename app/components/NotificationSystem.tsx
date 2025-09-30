'use client'

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import axios from 'axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationSystemProps {
  userType: 'student' | 'admin';
  userId: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userType, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pollMs] = useState(20000); // 20s polling interval

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchNotifications();
      startPolling();
    }
    return stopPolling;
  }, [userType, userId]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${userType}/${userId}`);
      if (response.data.success) {
        const notificationsWithDates = response.data.data.map((n: any) => ({
          ...n,
          id: n.id || n._id, // normalize id field from backend
          timestamp: new Date(n.createdAt)
        }));
        setNotifications(notificationsWithDates);
        setUnreadCount(notificationsWithDates.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const fetchUnread = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${userType}/${userId}/unread`);
      if (response.data.success) {
        const count = response.data.data?.count ?? 0;
        setUnreadCount(count);
      }
    } catch (error) {
      // Silently ignore to avoid UI noise during polling
    }
  };

  let intervalId: any = null;
  const startPolling = () => {
    stopPolling();
    // Visibility-aware polling
    const tick = () => {
      if (document.visibilityState === 'visible') {
        if (isOpen) {
          // When dropdown open, refresh full list
          fetchNotifications();
        } else {
          // Otherwise only unread count
          fetchUnread();
        }
      }
    };
    intervalId = window.setInterval(tick, pollMs);
    // Also update on tab visibility change
    const onVis = () => tick();
    document.addEventListener('visibilitychange', onVis);
    // Store cleanup on window for access in stopPolling
    (window as any).__notif_onVis = onVis;
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    const onVis = (window as any).__notif_onVis;
    if (onVis) {
      document.removeEventListener('visibilitychange', onVis);
      (window as any).__notif_onVis = null;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        const updatedNotifications = notifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        );
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/notifications/${userType}/${userId}/read-all`);
      if (response.data.success) {
        const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
      if (response.data.success) {
        const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestampDate.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border mb-2 transition-all hover:bg-gray-800/50 ${
                      notification.read ? 'opacity-60' : ''
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700/50">
                              <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      setNotifications([]);
                      setUnreadCount(0);
                      localStorage.removeItem(`${userType}_notifications_${userId}`);
                    }
                  }}
                  className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear all notifications
                </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem; 