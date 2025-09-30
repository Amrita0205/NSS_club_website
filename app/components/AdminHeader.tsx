'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationSystem from './NotificationSystem';

type AdminHeaderProps = {
  active: 'dashboard' | 'students' | 'events' | 'attendance';
  adminName?: string;
  adminId?: string;
  onLogout?: () => void;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ active, adminName = 'Admin', adminId, onLogout }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-transparent flex items-center justify-center">
                <Image src="/images/nss-inverted.png" alt="NSS Logo" width={40} height={40} className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold">NSS Admin Portal</h1>
                <p className="text-gray-400 text-sm">Welcome back, {adminName}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/admin/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${active === 'dashboard' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>Dashboard</Link>
              <Link href="/admin/students" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${active === 'students' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>Manage Students</Link>
              <Link href="/admin/events" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${active === 'events' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>Manage Events</Link>
              <Link href="/admin/attendance" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${active === 'attendance' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>Attendance</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {adminId && (
              <NotificationSystem userType="admin" userId={adminId} />
            )}
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all border border-red-600/30">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;



