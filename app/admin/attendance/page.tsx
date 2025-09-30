'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import { RefreshCw, FileSpreadsheet, Eye, Download, CheckCircle, Users, Calendar, Clock } from 'lucide-react';
import SplashScreen from '../../components/SplashScreen';
import { useAppContext } from '../../contexts/AppContext';

export default function AdminAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshTrigger, triggerRefresh } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Events and attendance state
  type EventType = {
  date: string;
  isCompleted: boolean;
  // add other properties as needed
};
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [attendanceEventId, setAttendanceEventId] = useState<string>('');
  const [attendance, setAttendance] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualHours, setManualHours] = useState<number>(0);
  const [addingManual, setAddingManual] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      router.replace('/admin/login');
      return;
    }
    setToken(t);
    setLoading(false);
    // fetch admin profile for notifications header
    (async () => {
      try {
        const adminRes = await axios.get('http://localhost:5000/api/admin/profile', { headers: { Authorization: `Bearer ${t}` }, timeout: 10000 });
        if (adminRes.data?.success) setAdmin(adminRes.data.data.admin);
      } catch {}
    })();
    // initial events fetch
    void fetchEvents();
  }, [router, refreshTrigger]);

  // Handle URL parameter for pre-selecting event
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId && events.length > 0) {
      const event = events.find(ev => ev._id === eventId);
      if (event) {
        setAttendanceEventId(eventId);
        loadAttendance(eventId);
        // Set appropriate tab based on event status
        if (event.isCompleted || new Date(event.date) <= new Date()) {
          setActiveTab('completed');
        } else {
          setActiveTab('upcoming');
        }
      }
    }
  }, [searchParams, events]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await axios.get('http://localhost:5000/api/event/all?limit=100&order=desc&sortBy=date');
      if (res.data?.success) {
        const allEvents = res.data.data.events || [];
        setEvents(allEvents);
        
        // Segregate events by completion status and date
        const now = new Date();
        const upcoming = allEvents.filter((event: EventType) => new Date(event.date) > now && !event.isCompleted);
const completed = allEvents.filter((event: EventType) => event.isCompleted || new Date(event.date) <= now);
        
        setUpcomingEvents(upcoming);
        setCompletedEvents(completed);
      }
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !attendanceEventId) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('attendanceFile', file);
      const res = await axios.post(`http://localhost:5000/api/event/${attendanceEventId}/upload-attendance`, formData, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      setUploadResult(res.data);
      // refresh attendance if currently viewing
      if (attendanceEventId) {
        try {
          const fresh = await axios.get(`http://localhost:5000/api/event/${attendanceEventId}/attendance`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
          setAttendance(fresh.data?.data || null);
        } catch {}
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadResult({ success: false, message: error.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.replace('/admin/login');
  };

  const addManualAttendance = async () => {
    if (!attendanceEventId || !manualStudentId || manualHours <= 0) {
      setMessage('Please fill all fields correctly');
      return;
    }

    try {
      setAddingManual(true);
      const res = await axios.post(`http://localhost:5000/api/event/${attendanceEventId}/manual-add`, {
        studentId: manualStudentId,
        hours: manualHours
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('Student added to event successfully');
        setManualStudentId('');
        setManualHours(0);
        // Refresh attendance data
        if (attendanceEventId) {
          try {
            const fresh = await axios.get(`http://localhost:5000/api/event/${attendanceEventId}/attendance`, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            setAttendance(fresh.data?.data || null);
          } catch {}
        }
        // Trigger global refresh
        triggerRefresh();
      } else {
        setMessage(res.data.message || 'Failed to add student');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAddingManual(false);
    }
  };

  const markEventAsCompleted = async (eventId: string) => {
    if (!confirm('Are you sure you want to mark this event as completed?')) {
      return;
    }

    try {
      const res = await axios.patch(`http://localhost:5000/api/event/${eventId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('Event marked as completed successfully');
        // Trigger global refresh
        triggerRefresh();
        // Refresh events list
        void fetchEvents();
      } else {
        setMessage(res.data.message || 'Failed to mark event as completed');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to mark event as completed');
    }
  };

  const loadAttendance = async (eventId: string) => {
    setAttendance(null);
    setAttendanceEventId(eventId);
    setAttendanceLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/event/${eventId}/attendance`, { 
        headers: { Authorization: `Bearer ${token}` }, 
        timeout: 15000 
      });
      setAttendance(res.data?.data || null);
    } catch (e) {
      setAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Preparing attendance tools..." />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AdminHeader active="attendance" adminName={admin?.name} adminId={admin?._id || admin?.id} onLogout={handleLogout} />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Attendance Management</h2>
              <p className="text-gray-400">Manage event attendance and mark events as completed</p>
            </div>
            <button onClick={fetchEvents} className="px-4 py-2 bg-gray-800/70 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-all">
              <RefreshCw className="w-4 h-4 inline mr-2" /> Refresh
            </button>
          </div>

          {/* Event Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Upcoming Events ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Completed Events ({completedEvents.length})
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') || message.includes('Success')
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Events List */}
          <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Given Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Attendees</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loadingEvents && (
                    <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading events…</td></tr>
                  )}
                  {!loadingEvents && (activeTab === 'upcoming' ? upcomingEvents : completedEvents).length === 0 && (
                    <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No {activeTab} events found</td></tr>
                  )}
                  {(activeTab === 'upcoming' ? upcomingEvents : completedEvents).map((ev) => (
                    <tr key={ev._id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{ev.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{ev.description}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <div>{new Date(ev.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(ev.date).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{ev.givenHours}h</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {(ev.type || '').toString().replace('_',' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="text-sm">{ev.attendees?.length || 0} registered</div>
                        {ev.maxAttendees && (
                          <div className="text-xs text-gray-400">Max: {ev.maxAttendees}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ev.isCompleted 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : new Date(ev.date) <= new Date()
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {ev.isCompleted ? 'Completed' : new Date(ev.date) <= new Date() ? 'Past Due' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadAttendance(ev._id)}
                            className="px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-600/30 hover:bg-purple-600/30 transition-all"
                          >
                            <Eye className="w-4 h-4 inline mr-2" /> View Attendance
                          </button>
                          
                          {activeTab === 'upcoming' && !ev.isCompleted && (
                            <button
                              onClick={() => markEventAsCompleted(ev._id)}
                              className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg border border-green-600/30 hover:bg-green-600/30 transition-all"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-2" /> Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Management Section */}
          {attendanceEventId && (
            <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Attendance Management</h3>
              </div>
              
              {/* Event Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">Selected Event</label>
                <select 
                  value={attendanceEventId} 
                  onChange={(e) => loadAttendance(e.target.value)} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose an event…</option>
                  {(activeTab === 'upcoming' ? upcomingEvents : completedEvents).map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name} - {new Date(ev.date).toLocaleDateString()} ({ev.givenHours}h)
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Attendance Addition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Student Roll Number</label>
                  <input
                    type="text"
                    value={manualStudentId}
                    onChange={(e) => setManualStudentId(e.target.value)}
                    placeholder="e.g., CS23B1008"
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Hours to Award</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    placeholder="2"
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addManualAttendance}
                    disabled={addingManual || !manualStudentId || manualHours <= 0}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {addingManual ? 'Adding...' : 'Add Manually'}
                  </button>
                </div>
              </div>

              {/* Excel Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Upload Attendance (Excel/CSV)</label>
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    disabled={!attendanceEventId || uploading} 
                    onChange={handleFileUpload} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload file with roll numbers only. Hours will be auto-assigned from event.</p>
                </div>
                <div className="flex items-end">
                  <a
                    href="/attendance_sample.csv"
                    download
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-center"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Sample CSV
                  </a>
                </div>
              </div>

              {uploading && <div className="text-gray-300 text-sm mb-4"><RefreshCw className="w-4 h-4 inline animate-spin mr-2"/>Uploading…</div>}
              {uploadResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${uploadResult.success ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>{uploadResult.message}</div>
              )}

              {/* Attendance Display */}
              <div className="bg-gray-700/30 rounded-xl border border-gray-600/50">
                <div className="px-4 py-3 border-b border-gray-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-semibold">Attendance Records</span>
                  </div>
                  {attendanceLoading && <RefreshCw className="w-5 h-5 animate-spin" />}
                </div>
                {attendance ? (
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-4">
                      Event: <span className="font-semibold text-white">{attendance.event.name}</span> • 
                      {new Date(attendance.event.date).toLocaleDateString()} • 
                      Given Hours: <span className="font-semibold text-purple-400">{attendance.event.givenHours}</span>
                    </p>
                    <div className="max-h-64 overflow-auto border border-gray-600/50 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-600/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-300">Name</th>
                            <th className="px-4 py-2 text-left text-gray-300">Roll No</th>
                            <th className="px-4 py-2 text-left text-gray-300">Hours</th>
                            <th className="px-4 py-2 text-left text-gray-300">Attended</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {attendance.attendance.map((a: any) => (
                            <tr key={a.student.id} className="hover:bg-gray-600/30">
                              <td className="px-4 py-2 text-white">{a.student.name}</td>
                              <td className="px-4 py-2 text-gray-300">{a.student.rollNo}</td>
                              <td className="px-4 py-2 text-purple-400 font-medium">{a.hoursEarned}h</td>
                              <td className="px-4 py-2 text-gray-300">{a.attendedAt ? new Date(a.attendedAt).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      Total Attendees: <span className="font-semibold text-white">{attendance.attendance.length}</span> • 
                      Total Hours Awarded: <span className="font-semibold text-purple-400">
                        {attendance.attendance.reduce((sum: number, a: any) => sum + a.hoursEarned, 0)}h
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-gray-400 text-center">
                    {attendanceLoading ? 'Loading attendance…' : 'Select an event to view attendance records.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
