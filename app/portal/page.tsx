'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield } from 'lucide-react';
import Image from 'next/image';

export default function PortalPage() {
  const router = useRouter();

  const portalOptions = [
    {
      title: 'Student Portal',
      description: 'Access your NSS hours and events',
      icon: User,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800',
      onClick: () => router.push('/student/login')
    },
    {
      title: 'Admin Portal',
      description: 'Manage students and events',
      icon: Shield,
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800',
      onClick: () => router.push('/admin/login')
    }
  ];

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{background: 'black'}} />
      
      {/* Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <Image
          src="/images/logo_white.png"
          alt="NSS Logo"
          width={600}
          height={600}
          className="opacity-5 blur-[1px] w-[70vw] max-w-[600px] h-auto object-contain"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight drop-shadow-lg">
            NSS Portal
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose your portal to access the National Service Scheme platform
          </p>
        </div>

        {/* Portal Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
          {portalOptions.map((option, index) => (
            <div
              key={index}
              onClick={option.onClick}
              className={`bg-gradient-to-br ${option.color} ${option.hoverColor} backdrop-blur-[32px] border-2 border-white/30 rounded-3xl shadow-2xl ring-1 ring-white/10 p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl group`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{option.title}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{option.description}</p>
                <div className="w-full h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-white/40 rounded-full transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <button
          onClick={() => router.push('/')}
          className="mt-12 px-8 py-3 bg-white/10 backdrop-blur-[32px] border-2 border-white/30 rounded-2xl text-white font-medium transition-all duration-300 hover:bg-white/20 hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
} 