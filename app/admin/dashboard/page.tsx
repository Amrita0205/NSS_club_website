"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import AdminHeader from "../../components/AdminHeader";
import Image from "next/image";
import NotificationSystem from "../../components/NotificationSystem";
import { addNotification, notificationTemplates } from "../../utils/notificationUtils";
import SplashScreen from "../../components/SplashScreen";


// Icons for the admin dashboard (matching student dashboard)
const Icons = {
  User: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  ClockSmall: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    totalEvents: 0,
    totalHours: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace('/admin/login');
        return;
      }
      fetchAdminData(token);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && admin) {
      // Add welcome notification if this is the first visit
      const hasVisited = localStorage.getItem('admin_has_visited');
      if (!hasVisited) {
        addNotification('admin', admin._id || 'default', notificationTemplates.welcome('admin'));
        localStorage.setItem('admin_has_visited', 'true');
      }
    }
  }, [admin]);

  const fetchAdminData = async (token: string) => {
    setLoading(true);
    try {
      // Get admin profile
      try {
        const adminRes = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        
        if (adminRes.data.success) {
          setAdmin(adminRes.data.data.admin);
        }
      } catch (profileError) {
        console.log("Admin profile not available, using default admin info");
        // Set default admin info if profile endpoint fails
        setAdmin({
          name: "Admin",
          email: "admin@nss.com",
          role: "Admin"
        });
      }

      // Get dashboard stats
      const statsRes = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      if (statsRes.data.success) {
        const overview = statsRes.data.data.overview;
        setStats({
          totalStudents: overview.totalStudents,
          pendingApprovals: overview.pendingStudents,
          totalEvents: overview.totalEvents,
          totalHours: overview.totalHours
        });
      }

      // Get recent students by registration date desc
      const studentsRes = await axios.get("http://localhost:5000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
        params: { sortBy: 'registeredAt', order: 'desc', limit: 10 }
      });
      setStudents(studentsRes.data.data.students || []);

      // Get recent or upcoming events (prefer recent list so card is never empty)
      const eventsRes = await axios.get("http://localhost:5000/api/event/all", {
        timeout: 10000,
        params: { limit: 6, sortBy: 'date', order: 'desc' }
      });
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data.events || []);
      }

    } catch (err: any) {
      console.error("Failed to fetch admin data:", err);
      if (err.code === 'ECONNABORTED') {
        console.log("Request timeout - using default data");
        // Set default admin data
        setAdmin({
          name: "Admin",
          email: "admin@nss.com",
          role: "Admin"
        });
        setStats({
          totalStudents: 0,
          pendingApprovals: 0,
          totalEvents: 0,
          totalHours: 0
        });
        setStudents([]);
        setEvents([]);
      } else if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        router.replace('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("admin_token");
      router.replace('/admin/login');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Loading your dashboard..." />
      </main>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Admin data not found. Please login again.</p>
          <button 
            onClick={() => router.replace('/admin/login')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10">
        <Image
          src="/images/logo_white.png"
          alt="NSS Logo Watermark"
          width={600}
          height={600}
          className="opacity-5 blur-[1px] w-[70vw] max-w-[600px] h-auto object-contain"
          priority
        />
      </div>
      {/* <AdminHeader active="dashboard" adminName={admin.name} adminId={admin._id || 'default'} onLogout={handleLogout} /> */}
      <div className="min-h-screen bg-black text-white flex flex-col">
  <AdminHeader
    active="dashboard"
    adminName={admin.name}
    adminId={admin._id || 'default'}
    onLogout={handleLogout}
  />
</div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Primary admin actions removed per request */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalStudents}</p>
                </div>
                <div className="text-blue-400">
                  <Icons.Users />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Approvals</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingApprovals}</p>
                </div>
                <div className="text-yellow-400">
                  <Icons.Clock />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold text-green-400">{stats.totalEvents}</p>
                </div>
                <div className="text-green-400">
                  <Icons.Calendar />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalHours}</p>
                </div>
                <div className="text-purple-400">
                  <Icons.Trophy />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admin Profile */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 text-white">Admin Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <Icons.Users />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{admin.name}</h4>
                      <p className="text-gray-400 text-sm">{admin.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-white">{admin.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Students & Upcoming Events */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Recent Students */}
                <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                  <h3 className="text-xl font-bold mb-4 text-white">Recent Students</h3>
                  {students.length > 0 ? (
                    <div className="space-y-3">
                      {students.slice(0, 3).map((student: any) => (
                        <div key={student._id} className="bg-black/30 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">{student.name}</h4>
                              <p className="text-gray-400 text-sm">{student.rollNo}</p>
                              <p className="text-gray-400 text-sm">{student.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.approved 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {student.approved ? 'Approved' : 'Pending'}
                              </span>
                              <p className="text-gray-400 text-xs mt-1">{student.totalHours}h</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">No students registered yet.</p>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                  <h3 className="text-xl font-bold mb-4 text-white">Upcoming Events</h3>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.slice(0, 3).map((event: any) => (
                        <div key={event._id} className="bg-black/30 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">{event.name}</h4>
                              <p className="text-gray-400 text-sm">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Icons.Calendar />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Icons.ClockSmall />
                                  {event.givenHours}h
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <Icons.Location />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                                {event.type?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">No upcoming events.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Removed System Overview for a cleaner dashboard */}


        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Icons.Users />
                </div>
                <div>
                  <h3 className="text-lg font-bold">NSS Admin Portal</h3>
                  <p className="text-gray-400 text-sm">National Service Scheme</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Comprehensive management system for NSS registrations, events, and attendance tracking. 
                Empowering administrators to efficiently manage student participation and community service activities.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/admin/students" className="text-gray-400 hover:text-white transition-colors">Manage Students</Link></li>
                <li><Link href="/admin/events" className="text-gray-400 hover:text-white transition-colors">Manage Events</Link></li>
                <li><Link href="/admin/reports" className="text-gray-400 hover:text-white transition-colors">Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/admin/contact" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 NSS Admin Portal. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Version 1.0.0</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 