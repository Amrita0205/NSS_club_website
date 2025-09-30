"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

// Icons for the profile page
const Icons = {
  User: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  ),
};

export default function StudentProfile() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      router.replace('/student/login');
      return;
    }
    fetchStudentData(token);
  }, [router]);

  const fetchStudentData = async (token: string) => {
    setLoading(true);
    try {
      const studentRes = await axios.get("http://localhost:5000/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (studentRes.data.success) {
        setStudent(studentRes.data.data.student);
      }
    } catch (err: any) {
      console.error("Failed to fetch student data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("student_token");
        router.replace('/student/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    router.replace('/student/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
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
                <Link href="/student/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Icons.Home />
                  Dashboard
                </Link>
                <Link href="/student/events" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Icons.Calendar />
                  Events
                </Link>
                <Link href="/student/profile" className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30">
                  <Icons.User />
                  Profile
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all border border-red-600/30"
              >
                <Icons.Logout />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
            <p className="text-gray-400">View and manage your student information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.User />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{student.name}</h3>
                  <p className="text-gray-400">{student.rollNo}</p>
                  <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    student.approved 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {student.approved ? 'Approved' : 'Pending Approval'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Icons.Clock />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Hours</p>
                      <p className="text-white font-semibold">{student.totalHours || 0}h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Icons.Calendar />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Events Attended</p>
                      <p className="text-white font-semibold">{student.events?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Icons.Trophy />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-semibold">
                        {student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Full Name</label>
                    <p className="text-white font-semibold">{student.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Roll Number</label>
                    <p className="text-white font-semibold">{student.rollNo}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                    <p className="text-white font-semibold">{student.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Phone</label>
                    <p className="text-white font-semibold">{student.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Branch</label>
                    <p className="text-white font-semibold">{student.branch || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Year</label>
                    <p className="text-white font-semibold">{student.year || 'Not specified'}</p>
                  </div>
                </div>

                {student.approvedAt && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <label className="block text-gray-400 text-sm font-medium mb-2">Approved On</label>
                    <p className="text-white font-semibold">
                      {new Date(student.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Events */}
              {student.events && student.events.length > 0 && (
                <div className="mt-8 bg-gray-800/60 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-6">Recent Events</h3>
                  <div className="space-y-4">
                    {student.events.slice(0, 5).map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div>
                          <h4 className="text-white font-semibold">{event.eventId?.name || 'Event'}</h4>
                          <p className="text-gray-400 text-sm">
                            {event.attendedAt ? new Date(event.attendedAt).toLocaleDateString() : 'Date not available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold">{event.hours}h</p>
                          <p className="text-gray-400 text-xs">Hours earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 