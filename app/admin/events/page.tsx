'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AdminHeader from '../../components/AdminHeader';
import { RefreshCw, FileSpreadsheet, Eye, Download, CheckCircle } from 'lucide-react';
import SplashScreen from '../../components/SplashScreen';
import { useAppContext } from '../../contexts/AppContext';

export default function AdminEventsPage() {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Event form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [givenHours, setGivenHours] = useState<number>(2);
  const [location, setLocation] = useState('');
  const [type, setType] = useState('community_service');
  const [maxAttendees, setMaxAttendees] = useState<number | ''>('');
  const [requirements, setRequirements] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Events list
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

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

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await axios.get('http://localhost:5000/api/event/all?limit=100&order=desc&sortBy=date');
      if (res.data?.success) {
        const allEvents = res.data.data.events || [];
        setEvents(allEvents);
        
        // Segregate events by completion status and date
        const now = new Date();
        const upcoming = allEvents.filter(event => new Date(event.date) > now && !event.isCompleted);
        const completed = allEvents.filter(event => event.isCompleted || new Date(event.date) <= now);
        
        setUpcomingEvents(upcoming);
        setCompletedEvents(completed);
      }
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoadingEvents(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.replace('/admin/login');
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
      } else {
        setMessage(res.data.message || 'Failed to mark event as completed');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to mark event as completed');
    }
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const reqBody: any = {
        name,
        description,
        date,
        givenHours,
        location,
        type,
        requirements: requirements
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (maxAttendees !== '') reqBody.maxAttendees = Number(maxAttendees);

      const res = await axios.post('http://localhost:5000/api/event/create', reqBody, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (res.data?.success) {
        setMessage('Event created successfully');
        // Reset form
        setName('');
        setDescription('');
        setDate('');
        setGivenHours(2);
        setLocation('');
        setType('community_service');
        setMaxAttendees('');
        setRequirements('');
        // refresh events list
        void fetchEvents();
      } else {
        setMessage(res.data?.message || 'Failed to create event');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Preparing event tools..." />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AdminHeader active="events" adminName={admin?.name} adminId={admin?._id || admin?.id} onLogout={handleLogout} />

      <main className="flex-1 px-6 py-8">
        {/* Page header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Manage Events</h2>
          <p className="text-gray-400">Create events, view attendance and mark completion</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Create Event</h3>
          <form onSubmit={submitEvent} className="bg-gray-800/70 rounded-2xl p-6 border border-gray-700/40 shadow-xl space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Event Name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} required className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} required rows={4} className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Date</label>
                <input type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} required className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Given Hours</label>
                <input type="number" step="0.5" min="0.5" max="24" value={givenHours} onChange={(e)=>setGivenHours(Number(e.target.value))} required className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Type</label>
                <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
                  <option value="community_service">Community Service</option>
                  <option value="awareness">Awareness</option>
                  <option value="donation">Donation</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Location</label>
                <input value={location} onChange={(e)=>setLocation(e.target.value)} className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Max Attendees (optional)</label>
                <input type="number" min="1" value={maxAttendees} onChange={(e)=>setMaxAttendees(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Requirements (comma separated)</label>
              <input value={requirements} onChange={(e)=>setRequirements(e.target.value)} className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50">{submitting ? 'Creating...' : 'Create Event'}</button>
              {message && <span className="text-sm text-gray-300">{message}</span>}
            </div>
          </form>
        </div>

        {/* Events list */}
        <div className="max-w-7xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Event Management</h3>
            <button onClick={fetchEvents} className="px-3 py-2 bg-gray-800/70 rounded-lg border border-gray-700/60 hover:bg-gray-700/60 transition-all">
              <RefreshCw className="w-4 h-4 inline mr-2" /> Refresh
            </button>
          </div>

          {/* Event Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800/60 p-1 rounded-lg border border-gray-700/40">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
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
              Completed Events ({completedEvents.length})
            </button>
          </div>

          <div className="bg-gray-800/70 rounded-2xl border border-gray-700/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/60">
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
                    <tr><td className="px-4 py-8 text-center text-gray-400" colSpan={7}>No {activeTab} events found</td></tr>
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
                          <Link
                            href={`/admin/attendance?eventId=${ev._id}`}
                            className="px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-600/30 hover:bg-purple-600/30 transition-all"
                          >
                            <Eye className="w-4 h-4 inline mr-2" /> Manage Attendance
                          </Link>
                          
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

        </div>
      </main>
    </div>
  );
}


