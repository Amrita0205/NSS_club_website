'use client'

import React, { useState } from 'react';
import { Users, Clock, Upload, Calendar, CheckCircle, XCircle, Filter, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('registrations');

  const tabs = [
    { id: 'registrations', name: 'Student Registrations', icon: Users },
    { id: 'hours', name: 'Hours Tracking', icon: Clock },
    { id: 'upload', name: 'Excel Upload', icon: Upload },
    { id: 'events', name: 'Event Attendance', icon: Calendar }
  ];

  const pendingRegistrations = [
    { id: 1, name: 'Arjun Sharma', rollNo: 'CS21B1001', email: 'cs21b1001@iiitrc.ac.in', status: 'pending' },
    { id: 2, name: 'Priya Patel', rollNo: 'CS21B1002', email: 'cs21b1002@iiitrc.ac.in', status: 'pending' },
    { id: 3, name: 'Rahul Kumar', rollNo: 'CS21B1003', email: 'cs21b1003@iiitrc.ac.in', status: 'approved' }
  ];

  const studentHours = [
    { id: 1, name: 'Arjun Sharma', event: 'Cleaning Drive 1', hours: 4, date: '2024-01-15' },
    { id: 2, name: 'Priya Patel', event: 'Blood Donation', hours: 3, date: '2024-01-20' },
    { id: 3, name: 'Rahul Kumar', event: 'Orphanage Visit', hours: 6, date: '2024-01-25' }
  ];

  const events = [
    { id: 1, name: 'Cleaning Drive 1', date: '2024-01-15', participants: 25 },
    { id: 2, name: 'Blood Donation Camp', date: '2024-01-20', participants: 18 },
    { id: 3, name: 'Orphanage Visit', date: '2024-01-25', participants: 12 }
  ];

  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Pending Registrations</h3>
        <div className="flex space-x-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            Approve All
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-white font-medium">Name</th>
              <th className="px-6 py-3 text-left text-white font-medium">Roll No</th>
              <th className="px-6 py-3 text-left text-white font-medium">Email</th>
              <th className="px-6 py-3 text-left text-white font-medium">Status</th>
              <th className="px-6 py-3 text-left text-white font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRegistrations.map((student) => (
              <tr key={student.id} className="border-b border-gray-700">
                <td className="px-6 py-4 text-gray-300">{student.name}</td>
                <td className="px-6 py-4 text-gray-300">{student.rollNo}</td>
                <td className="px-6 py-4 text-gray-300">{student.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    student.status === 'approved' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {student.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button className="text-green-400 hover:text-green-300">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHoursTracking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Student Hours Tracking</h3>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-white font-medium">Student Name</th>
              <th className="px-6 py-3 text-left text-white font-medium">Event</th>
              <th className="px-6 py-3 text-left text-white font-medium">Hours</th>
              <th className="px-6 py-3 text-left text-white font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {studentHours.map((record) => (
              <tr key={record.id} className="border-b border-gray-700">
                <td className="px-6 py-4 text-gray-300">{record.name}</td>
                <td className="px-6 py-4 text-gray-300">{record.event}</td>
                <td className="px-6 py-4 text-gray-300">{record.hours}h</td>
                <td className="px-6 py-4 text-gray-300">{record.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExcelUpload = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Excel Upload for Attendance</h3>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white mb-2">Upload Excel File</h4>
          <p className="text-gray-400 mb-4">
            Upload an Excel file with columns: student_id, event_name, hours
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
            Choose File
          </button>
        </div>
        
        <div className="mt-6">
          <h5 className="text-white font-medium mb-2">Expected Format:</h5>
          <div className="bg-gray-700 rounded p-4 text-sm text-gray-300">
            <div className="grid grid-cols-3 gap-4 font-medium border-b border-gray-600 pb-2 mb-2">
              <span>student_id</span>
              <span>event_name</span>
              <span>hours</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span>CS21B001</span>
              <span>Cleaning Drive 1</span>
              <span>4</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span>CS21B002</span>
              <span>Blood Donation</span>
              <span>3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventAttendance = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Event-wise Attendance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-2">{event.name}</h4>
            <p className="text-gray-400 mb-2">Date: {event.date}</p>
            <p className="text-gray-400 mb-4">Participants: {event.participants}</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Admin Dashboard</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage NSS registrations, track student hours, and monitor event attendance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-gray-800 rounded-lg p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          {activeTab === 'registrations' && renderRegistrations()}
          {activeTab === 'hours' && renderHoursTracking()}
          {activeTab === 'upload' && renderExcelUpload()}
          {activeTab === 'events' && renderEventAttendance()}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;