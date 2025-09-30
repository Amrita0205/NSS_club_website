'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Download, 
  Upload, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Plus,
  RefreshCw
} from 'lucide-react';
import NotificationSystem from '../../components/NotificationSystem';
import AdminHeader from '../../components/AdminHeader';
import SplashScreen from '../../components/SplashScreen';

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
  phone?: string;
  year?: number;
  branch?: string;
  approved: boolean;
  totalHours: number;
  events: Array<{
    eventId: string;
    hours: number;
    attendedAt: string;
  }>;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  isActive: boolean;
}

interface Event {
  _id: string;
  name: string;
  date: string;
  givenHours: number;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  // Excel upload and attendance tools moved to /admin/events
  const [viewing, setViewing] = useState<Student | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    fetchAdminData(token);
  }, [router]);

  const fetchAdminData = async (token: string) => {
    try {
      setLoading(true);
      
      // Fetch admin profile (fallback to default like dashboard if it fails)
      try {
        const adminRes = await axios.get('http://localhost:5000/api/admin/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });
        if (adminRes.data?.success) {
          setAdmin(adminRes.data.data.admin);
        } else {
          setAdmin({ name: 'Admin', email: 'admin@nss.com', role: 'Admin' });
        }
      } catch (profileError: any) {
        if (profileError?.response?.status === 401) {
          localStorage.removeItem('admin_token');
          router.replace('/admin/login');
          return;
        }
        // Use a safe default to allow page access if backend is slow/down
        setAdmin({ name: 'Admin', email: 'admin@nss.com', role: 'Admin' });
      }

      // Fetch all students
      const studentsRes = await axios.get('http://localhost:5000/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data.students);
      }

      // Fetch a small events list for linking if needed
      const eventsRes = await axios.get('http://localhost:5000/api/event/all?limit=20');
      if (eventsRes.data.success) setEvents(eventsRes.data.data.events);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error?.response?.status === 401) {
        localStorage.removeItem('admin_token');
        router.replace('/admin/login');
        return;
      }
      if (error.code === 'ECONNABORTED') {
        // Set default data for timeout
        setStudents([]);
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    }
  };

  const approveStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.patch(
        `http://localhost:5000/api/admin/approve/${studentId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );

      if (response.data.success) {
        // Update the student in the list
        setStudents(prev => prev.map(student => 
          student._id === studentId 
            ? { ...student, approved: true, approvedAt: new Date().toISOString() }
            : student
        ));
      }
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const rejectStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.patch(
        `http://localhost:5000/api/admin/reject/${studentId}`,
        { reason: 'Rejected by admin' },
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );

      if (response.data.success) {
        // Remove the student from the list
        setStudents(prev => prev.filter(student => student._id !== studentId));
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  const openActions = (student: Student) => {
    setViewing(student);
    setEditDraft({
      name: student.name,
      email: student.email,
      phone: student.phone,
      year: student.year,
      branch: student.branch,
      approved: student.approved,
    });
  };

  const saveEdit = async () => {
    if (!viewing) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.patch(`http://localhost:5000/api/admin/students/${viewing._id}`,
        editDraft,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      if (res.data?.success) {
        const updated = res.data.data.student;
        setStudents(prev => prev.map(s => s._id === viewing._id ? { ...s, ...updated } : s));
        setViewing(null);
      }
    } catch (e) {
      console.error('Error saving student edit:', e);
    } finally {
      setSaving(false);
    }
  };

  const blockUnblock = async (student: Student, block: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = block
        ? `http://localhost:5000/api/admin/students/${student._id}/block`
        : `http://localhost:5000/api/admin/students/${student._id}/unblock`;
      const res = await axios.patch(url, {}, { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 });
      if (res.data?.success) {
        setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isActive: !block } : s));
      }
    } catch (e) {
      console.error('Error toggling block:', e);
    }
  };

  const deleteStudent = async (student: Student) => {
    if (!confirm(`Delete ${student.name} (${student.rollNo})? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.delete(`http://localhost:5000/api/admin/students/${student._id}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 });
      if (res.data?.success) {
        setStudents(prev => prev.filter(s => s._id !== student._id));
        if (viewing?._id === student._id) setViewing(null);
      }
    } catch (e) {
      console.error('Error deleting student:', e);
    }
  };

  // Template download handled in /admin/events

  // Upload handled in /admin/events

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !student.approved) ||
                         (filterStatus === 'approved' && student.approved);
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = students.filter(s => !s.approved).length;
  const approvedCount = students.filter(s => s.approved).length;
  const totalHours = students.reduce((sum, s) => sum + s.totalHours, 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SplashScreen message="Loading students data..." />
      </main>
    );
  }

  // If token existed we either have real admin or a default fallback; no blocking gate here

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AdminHeader active="students" adminName={admin?.name} adminId={admin?._id || admin?.id || 'default'} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-blue-400">{students.length}</p>
                </div>
                <div className="text-blue-400">
                  <Users />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
                </div>
                <div className="text-yellow-400">
                  <UserX />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Approved Students</p>
                  <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
                </div>
                <div className="text-green-400">
                  <UserCheck />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Hours</p>
                  <p className="text-3xl font-bold text-purple-400">{totalHours}</p>
                </div>
                <div className="text-purple-400">
                  <Clock />
                </div>
              </div>
            </div>
          </div>

          {/* Excel upload and attendance tools are now available under Manage Events */}

          {/* Filters and Search */}
          <div className="bg-gray-800/60 rounded-xl p-6 shadow-2xl border border-gray-700/50 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                    placeholder="Search students by name, roll number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Students</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                </select>
                
                <button
                  onClick={() => fetchAdminData(localStorage.getItem('admin_token')!)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-gray-800/60 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div>
                            <div className="text-sm font-medium text-white">{student.name}</div>
                            <div className="text-sm text-gray-400">{student.rollNo}</div>
                          <div className="text-xs text-gray-500">
                            {student.branch} - Year {student.year}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{student.email}</div>
                        {student.phone && (
                          <div className="text-sm text-gray-400">{student.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {student.totalHours} hours
                          </div>
                          <div className="text-xs text-gray-400">
                            {student.events.length} events
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openActions(student)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View / Actions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {!student.approved && (
                            <>
                              <button
                                onClick={() => approveStudent(student._id)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectStudent(student._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No students found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Actions Drawer / Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center bg-black/60">
          <div className="w-full md:w-[700px] bg-gray-900 border border-gray-800 rounded-t-2xl md:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{viewing.name} • {viewing.rollNo}</h3>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input value={editDraft.name || ''} onChange={e=>setEditDraft(v=>({...v, name: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input value={editDraft.email || ''} onChange={e=>setEditDraft(v=>({...v, email: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input value={editDraft.phone || ''} onChange={e=>setEditDraft(v=>({...v, phone: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Branch</label>
                <input value={editDraft.branch || ''} onChange={e=>setEditDraft(v=>({...v, branch: e.target.value}))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <input type="number" min={1} max={4} value={editDraft.year || 0} onChange={e=>setEditDraft(v=>({...v, year: Number(e.target.value)}))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="approvedToggle" type="checkbox" checked={!!editDraft.approved} onChange={e=>setEditDraft(v=>({...v, approved: e.target.checked}))} />
                <label htmlFor="approvedToggle" className="text-sm text-gray-300">Approved</label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-3">
                <button disabled={saving} onClick={saveEdit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
                {viewing.isActive ? (
                  <button onClick={()=>blockUnblock(viewing, true)} className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 rounded-lg hover:bg-yellow-600/30">Block</button>
                ) : (
                  <button onClick={()=>blockUnblock(viewing, false)} className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/40 rounded-lg hover:bg-green-600/30">Unblock</button>
                )}
              </div>
              <button onClick={()=>deleteStudent(viewing)} className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg hover:bg-red-600/30">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 