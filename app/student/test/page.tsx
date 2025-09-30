'use client';
import React from 'react';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Test Page</h1>
        <p className="text-gray-400 mb-6">This is a test page to verify routing works</p>
        <div className="space-y-4">
          <Link href="/student/login" className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            Go to Login
          </Link>
          <Link href="/student/dashboard" className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500">
            Go to Dashboard
          </Link>
          <Link href="/portal" className="block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500">
            Go to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
