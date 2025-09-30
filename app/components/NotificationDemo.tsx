'use client'

import React from 'react';
import { addNotification, notificationTemplates } from '../utils/notificationUtils';

interface NotificationDemoProps {
  userType: 'student' | 'admin';
  userId: string;
}

const NotificationDemo: React.FC<NotificationDemoProps> = ({ userType, userId }) => {
  const addDemoNotification = (type: string) => {
    switch (type) {
      case 'success':
        addNotification(userType, userId, notificationTemplates.hoursEarned(5, 'Community Cleanup'));
        break;
      case 'warning':
        addNotification(userType, userId, notificationTemplates.eventReminder('Blood Donation Camp', 'Tomorrow at 10 AM'));
        break;
      case 'error':
        addNotification(userType, userId, notificationTemplates.errorOccurred('updating your profile'));
        break;
      case 'info':
        addNotification(userType, userId, notificationTemplates.newEventCreated('Tree Plantation Drive'));
        break;
      case 'approval':
        if (userType === 'admin') {
          addNotification(userType, userId, notificationTemplates.approvalRequired('John Doe'));
        }
        break;
      default:
        addNotification(userType, userId, {
          title: 'Demo Notification',
          message: 'This is a demo notification for testing purposes.',
          type: 'info'
        });
    }
  };

  return (
    <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      <h3 className="text-xl font-bold mb-4 text-white">Notification Demo</h3>
      <p className="text-gray-400 text-sm mb-4">
        Test different types of notifications to see how they appear in the notification system.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={() => addDemoNotification('success')}
          className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all border border-green-600/30 text-sm"
        >
          Success
        </button>
        
        <button
          onClick={() => addDemoNotification('warning')}
          className="px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-all border border-yellow-600/30 text-sm"
        >
          Warning
        </button>
        
        <button
          onClick={() => addDemoNotification('error')}
          className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all border border-red-600/30 text-sm"
        >
          Error
        </button>
        
        <button
          onClick={() => addDemoNotification('info')}
          className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-600/30 text-sm"
        >
          Info
        </button>
        
        {userType === 'admin' && (
          <button
            onClick={() => addDemoNotification('approval')}
            className="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all border border-purple-600/30 text-sm"
          >
            Approval
          </button>
        )}
        
        <button
          onClick={() => addDemoNotification('custom')}
          className="px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-all border border-gray-600/30 text-sm"
        >
          Custom
        </button>
      </div>
      
      <p className="text-gray-500 text-xs mt-3">
        Click the notification bell in the header to view your notifications.
      </p>
    </div>
  );
};

export default NotificationDemo; 