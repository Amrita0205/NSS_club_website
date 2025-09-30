'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AppContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set up axios interceptors for automatic refresh on certain actions
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Trigger refresh for certain endpoints that modify data
        const refreshEndpoints = [
          '/api/event/create',
          '/api/event/upload-attendance',
          '/api/event/manual-add',
          '/api/admin/approve',
          '/api/admin/reject',
          '/api/student/register'
        ];
        
        if (refreshEndpoints.some(endpoint => response.config.url?.includes(endpoint))) {
          setTimeout(() => triggerRefresh(), 1000); // Delay to allow backend to process
        }
        
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AppContext.Provider value={{ refreshTrigger, triggerRefresh, isOnline }}>
      {children}
    </AppContext.Provider>
  );
};
