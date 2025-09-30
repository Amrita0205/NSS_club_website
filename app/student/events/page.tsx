"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import SplashScreen from "../../components/SplashScreen";
import { useAppContext } from "../../contexts/AppContext";

// Icons for the events page
const Icons = {
  Calendar: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

export default function StudentEvents() {
  const router = useRouter();
  const { refreshTrigger } = useAppContext();
  const [events, setEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      router.replace('/student/login');
      return;
    }
    fetchData(token);
  }, [router, refreshTrigger]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      // Get student profile
      const studentRes = await axios.get("http://localhost:5000/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (studentRes.data.success) {
        setStudent(studentRes.data.data.student);
      }

      // Get upcoming events
      const eventsRes = await axios.get("http://localhost:5000/api/event/upcoming");
      if (eventsRes.data.success) {
        const eventsData = eventsRes.data.data.events || [];
        setEvents(eventsData);
        
        // Check which events the current student is registered for
        const studentId = studentRes.data.data.student.id;
        if (studentId) {
          const registered = new Set<string>();
          eventsData.forEach((event: any) => {
            if (event.attendees && event.attendees.some((attendee: any) => attendee._id === studentId)) {
              registered.add(event._id);
            }
          });
          setRegisteredEvents(registered);
        }
      }

      // Get past events (public endpoint with upcoming=false)
      const pastRes = await axios.get("http://localhost:5000/api/event/all", {
        params: { upcoming: 'false', limit: 12, sortBy: 'date', order: 'desc' }
      });
      if (pastRes.data?.success) {
        setPastEvents(pastRes.data.data?.events || []);
      }

    } catch (err: any) {
      console.error("Failed to fetch data:", err);
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
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Loading events..." />
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
                <Link href="/student/events" className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-600/30">
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Upcoming Events</h2>
            <p className="text-gray-400">Register for events and earn community service hours</p>
          </div>

          {/* Events Grid */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'BLOOD_DONATION' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      event.type === 'EDUCATION' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      event.type === 'ENVIRONMENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {event.type?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Icons.Calendar />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Icons.Clock />
                      {event.givenHours} hours
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Icons.Location />
                        {event.location}
                      </div>
                    )}
                  </div>
                  
                  {registeredEvents.has(event._id) ? (
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('student_token');
                          await axios.post(`http://localhost:5000/api/event/${event._id}/unregister`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          // Update local state to reflect unregistration
                          setRegisteredEvents(prev => {
                            const next = new Set(Array.from(prev));
                            next.delete(event._id);
                            return next;
                          });
                          setEvents(prev => prev.map(ev => 
                            ev._id === event._id 
                              ? { ...ev, attendees: (ev.attendees || []).filter((a: any) => a._id !== student.id) }
                              : ev
                          ));
                          alert('Unregistered successfully');
                        } catch (e: any) {
                          alert(e?.response?.data?.message || 'Failed to unregister');
                        }
                      }}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30"
                    >
                      Unregister
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('student_token');
                          await axios.post(`http://localhost:5000/api/event/${event._id}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          // Update local state to reflect registration
                          setRegisteredEvents(prev => new Set([...Array.from(prev), event._id]));
                          setEvents(prev => prev.map(ev => 
                            ev._id === event._id 
                              ? { ...ev, attendees: [...(ev.attendees || []), { _id: student.id, name: student.name, rollNo: student.rollNo }] }
                              : ev
                          ));
                          alert('Registered successfully');
                        } catch (e: any) {
                          alert(e?.response?.data?.message || 'Failed to register');
                        }
                      }}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      Register for Event
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Calendar />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
              <p className="text-gray-400">Check back later for new community service opportunities.</p>
            </div>
          )}

          {/* Past Events */}
          <div className="mt-14">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Past Events</h2>
              <p className="text-gray-400">Recently completed events</p>
            </div>

            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <div key={event._id} className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{event.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.type === 'BLOOD_DONATION' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        event.type === 'EDUCATION' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        event.type === 'ENVIRONMENT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {event.type?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Icons.Calendar />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Icons.Clock />
                        {event.givenHours} hours
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Icons.Location />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-white mb-1">No Past Events</h3>
                <p className="text-gray-400">Completed events will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 