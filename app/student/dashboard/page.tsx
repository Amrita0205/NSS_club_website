"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import NotificationSystem from "../../components/NotificationSystem";
// import { addNotification, notificationTemplates } from "../../utils/notificationUtils";
import SplashScreen from "../../components/SplashScreen";


// Icons for the student dashboard
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
};

export default function StudentDashboard() {
  console.log("StudentDashboard: Component rendered");
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    rank: 0
  });

  useEffect(() => {
    console.log("StudentDashboard: useEffect triggered");
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("student_token");
      console.log("Dashboard: Checking token:", token ? "Token exists" : "No token");
      console.log("Dashboard: Token value:", token ? token.substring(0, 50) + "..." : "null");
      
      if (!token) {
        console.log("Dashboard: No token found, redirecting to login");
        router.replace('/student/login');
        return;
      }
      console.log("Dashboard: Token found, fetching student data");
      fetchStudentData(token);
    }
  }, [router]);

  // Note: Do NOT redirect during render; useEffect above will handle auth.

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && student) {
  //     // Add welcome notification if this is the first visit
  //     const hasVisited = localStorage.getItem('student_has_visited');
  //     if (!hasVisited) {
  //       // Note: addNotification is now async but we don't need to await it here
  //       addNotification('student', student._id || 'default', notificationTemplates.welcome('student')).catch(console.error);
  //       localStorage.setItem('student_has_visited', 'true');
  //     }
  //   }
  // }, [student]);

  const fetchStudentData = async (token: string) => {
    setLoading(true);
    console.log("Fetching student data with token:", token ? "Token exists" : "No token");
    
    try {
      // Get student profile
      console.log("Making API call to /api/student/profile");
      const studentRes = await axios.get("http://localhost:5000/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      console.log("Student profile response:", studentRes.data);
      
      if (studentRes.data.success) {
        setStudent(studentRes.data.data.student);
        setStats({
          totalHours: studentRes.data.data.student.totalHours || 0,
          eventsAttended: studentRes.data.data.student.events?.length || 0,
          upcomingEvents: 0, // Will be calculated from events
          rank: 0 // Will be calculated
        });
      } else {
        // If backend responds but success is false, treat as unauthorized/stale token
        if (typeof window !== 'undefined') {
          localStorage.removeItem("student_token");
        }
        router.replace('/student/login');
        return;
      }

      // Get upcoming events
      console.log("Making API call to /api/event/upcoming");
      const eventsRes = await axios.get("http://localhost:5000/api/event/upcoming", {
        timeout: 10000 // 10 second timeout
      });
      console.log("Events response:", eventsRes.data);
      
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data.events || []);
        setStats(prev => ({ ...prev, upcomingEvents: eventsRes.data.data.events?.length || 0 }));
      }

    } catch (err: any) {
      console.error("Failed to fetch student data:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      if (err.code === 'ECONNABORTED') {
        console.log("Request timeout - server might be slow");
        // Set default data instead of failing completely
        setStudent({
          _id: 'default',
          name: 'Student',
          rollNo: 'CS23B1010',
          email: 'student@iiit.ac.in',
          totalHours: 0,
          events: []
        });
        setStats({
          totalHours: 0,
          eventsAttended: 0,
          upcomingEvents: 0,
          rank: 0
        });
      } else if (err.response?.status === 401 || err.response?.status === 404) {
        // If backend rejects token (clock skew, db unreachable, etc.),
        // fall back to decoding the token and render a minimal dashboard
        console.log("Unauthorized from API - attempting JWT fallback render");
        const token = localStorage.getItem("student_token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setStudent({
              _id: payload.id || 'default',
              name: 'Student',
              rollNo: payload.rollNo || 'N/A',
              email: payload.email || 'N/A',
              totalHours: 0,
              events: []
            });
            setStats({ totalHours: 0, eventsAttended: 0, upcomingEvents: 0, rank: 0 });
          } catch (tokenErr) {
            console.error('JWT decode failed after 401:', tokenErr);
            router.replace('/student/login');
          }
        } else {
          router.replace('/student/login');
        }
      } else {
        // For any other error, try to show a basic dashboard with the token info
        console.log("Other error occurred, showing basic dashboard");
        const token = localStorage.getItem("student_token");
        if (token) {
          // Try to decode the token to get basic info
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setStudent({
              _id: payload.id || 'default',
              name: 'Student',
              rollNo: payload.rollNo || 'CS23B1010',
              email: payload.email || 'student@iiit.ac.in',
              totalHours: 0,
              events: []
            });
            setStats({
              totalHours: 0,
              eventsAttended: 0,
              upcomingEvents: 0,
              rank: 0
            });
          } catch (tokenError) {
            console.error("Failed to decode token:", tokenError);
            localStorage.removeItem("student_token");
            router.replace('/student/login');
          }
        } else {
          localStorage.removeItem("student_token");
          router.replace('/student/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("student_token");
      router.replace('/student/login');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Loading your dashboard..." />
      </main>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Student data not found. Please login again.</p>
          <button 
            onClick={() => router.replace('/student/login')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-transparent flex items-center justify-center">
                  <Image 
                    src="/images/nss-inverted.png" 
                    alt="NSS Logo" 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold">NSS Student Portal</h1>
                  <p className="text-gray-400 text-sm">Welcome back, {student.name}</p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/student/dashboard" className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30">
                  <Icons.Home />
                  Dashboard
                </Link>
                <Link href="/student/events" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Icons.Calendar />
                  Events
                </Link>
                <Link href="/student/profile" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Icons.User />
                  Profile
                </Link>

              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {student && (
                <NotificationSystem userType="student" userId={student._id || 'default'} />
              )}
              {/* Settings removed per request */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all border border-red-600/30"
              >
                <Icons.Logout />
                Logout
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="px-6 py-4 space-y-3">
            <Link 
              href="/student/dashboard" 
              className="flex items-center gap-3 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.Home />
              Dashboard
            </Link>
            <Link 
              href="/student/events" 
              className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.Calendar />
              Events
            </Link>
            <Link 
              href="/student/profile" 
              className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icons.User />
              Profile
            </Link>

          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Student Dashboard</h2>
          <p className="text-gray-400">Overview of your NSS activity and progress</p>
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.totalHours}</p>
                </div>
                <div className="text-yellow-400 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Icons.Clock />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Events Attended</p>
                  <p className="text-3xl font-bold text-green-400">{stats.eventsAttended}</p>
                </div>
                <div className="text-green-400 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icons.CheckCircle />
                </div>
              </div>
            </div>

            {/* Upcoming events count removed to keep dashboard student-only */}

            <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Your Rank</p>
                  <p className="text-3xl font-bold text-purple-400">#{stats.rank || 'N/A'}</p>
                </div>
                <div className="text-purple-400 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Icons.Trophy />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Profile */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
                <h3 className="text-xl font-bold mb-4 text-white">Your Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-purple-600/30 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-300">
                      <Icons.User />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{student.name}</h4>
                      <p className="text-gray-400 text-sm">{student.rollNo}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white">{student.phone}</span>
                      </div>
                    )}
                    {student.branch && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">Branch:</span>
                        <span className="text-white">{student.branch}</span>
                      </div>
                    )}
                    {student.year && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">Year:</span>
                        <span className="text-white">{student.year}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.approved 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {student.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events & Upcoming Events */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Recent Events */}
                <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
                  <h3 className="text-xl font-bold mb-4 text-white">Recent Events</h3>
                  {student.events && student.events.length > 0 ? (
                    <div className="space-y-3">
                      {student.events.slice(0, 3).map((event: any, index: number) => (
                        <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-700/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">{event.eventId?.name || 'Event'}</h4>
                              <p className="text-gray-400 text-sm">
                                {event.attendedAt ? new Date(event.attendedAt).toLocaleDateString() : 'Date not available'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-yellow-400 font-semibold">{event.hours}h</p>
                              <p className="text-gray-400 text-xs">Hours earned</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 border border-dashed border-gray-700/40 rounded-lg">No events attended yet.</div>
                  )}
                </div>

                {/* Explore Events CTA removed for a cleaner dashboard */}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-8">
            <div className="bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-gray-700/40">
              <h3 className="text-xl font-bold mb-4 text-white">Your Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hours Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Hours Completed</span>
                    <span className="text-white font-semibold">{stats.totalHours}/120h</span>
                  </div>
                  <div className="w-full bg-gray-700/60 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow"
                      style={{ width: `${Math.min((stats.totalHours / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    {Math.max(0, 120 - stats.totalHours)} hours remaining for completion
                  </p>
                </div>

                {/* Events Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Events Attended</span>
                    <span className="text-white font-semibold">{stats.eventsAttended} events</span>
                  </div>
                  <div className="w-full bg-gray-700/60 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow"
                      style={{ width: `${Math.min((stats.eventsAttended / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    {Math.max(0, 10 - stats.eventsAttended)} more events recommended
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Icons.User />
                </div>
                <div>
                  <h3 className="text-lg font-bold">NSS Student Portal</h3>
                  <p className="text-gray-400 text-sm">National Service Scheme</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Track your community service activities, view upcoming events, and monitor your progress 
                towards completing your NSS requirements. Stay engaged with meaningful community service opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/student/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/student/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/student/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link></li>
                <li><Link href="/student/history" className="text-gray-400 hover:text-white transition-colors">History</Link></li>
                <li><Link href="/portal" className="text-gray-400 hover:text-white transition-colors">Main Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/student/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/student/contact" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link href="/student/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 NSS Student Portal. All rights reserved.
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