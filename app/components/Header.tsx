'use client'

import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, Calendar, Phone, Clock, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const router = useRouter();

  // Read auth state from localStorage
  const updateAuthFromStorage = () => {
    try {
      if (typeof window === 'undefined') return;
      const studentToken = localStorage.getItem('student_token');
      const adminToken = localStorage.getItem('admin_token');
      if (studentToken) {
        setIsLoggedIn(true);
        setUserType('student');
      } else if (adminToken) {
        setIsLoggedIn(true);
        setUserType('admin');
      } else {
        setIsLoggedIn(false);
        setUserType(null);
      }
    } catch (err) {
      console.error('Error reading auth from storage:', err);
      setIsLoggedIn(false);
      setUserType(null);
    }
  };

  useEffect(() => {
    updateAuthFromStorage();
    // Listen for cross-tab storage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'student_token' || e.key === 'admin_token') {
        updateAuthFromStorage();
      }
    };
    window.addEventListener('storage', onStorage);
    // Also re-check shortly after mount to catch same-tab login just performed
    const t = window.setTimeout(updateAuthFromStorage, 700);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearTimeout(t);
    };
  }, []);

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'About Us', icon: Users, href: '/#about' },
    { name: 'Events', icon: Calendar, href: '/#events' },
    { name: 'Gallery', icon: Calendar, href: '/#gallery' },
    { name: 'Contact Us', icon: Phone, href: '/#contact' },
    { name: 'NSS Constitution', icon: Users, href: '/#constitution' },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student_token');
      localStorage.removeItem('admin_token');
      setIsLoggedIn(false);
      setUserType(null);
      router.push('/');
    }
  };

  const handleLogin = () => {
    router.push('/portal');
  };

  const handleDashboard = () => {
    console.log('Dashboard clicked! userType:', userType);
    console.log('localStorage student_token:', localStorage.getItem('student_token') ? 'exists' : 'missing');
    console.log('localStorage admin_token:', localStorage.getItem('admin_token') ? 'exists' : 'missing');
    
    // Route purely based on the tracked userType
    if (userType === 'student') {
      console.log('Routing to student dashboard...');
      router.push('/student/dashboard');
    } else if (userType === 'admin') {
      console.log('Routing to admin dashboard...');
      router.push('/admin/dashboard');
    } else {
      console.log('No user type, routing to portal...');
      router.push('/portal');
    }
  };

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl border border-gray-300/10 shadow-lg rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center">
                <Image 
                  src="/images/nss-inverted.png" 
                  alt="NSS Logo" 
                  width={48} 
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-md">NSS </h1>
                <p className="text-xs text-blue-400 font-medium mt-1">IIIT Raichur</p>
              </div>
            </div>
            
            {/* Center Section - Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative flex items-center gap-2 px-4 py-2 text-white hover:text-gray-200 transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector('.hover-line')?.classList.remove('w-0');
                    e.currentTarget.querySelector('.hover-line')?.classList.add('w-full');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector('.hover-line')?.classList.remove('w-full');
                    e.currentTarget.querySelector('.hover-line')?.classList.add('w-0');
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 w-0 transition-all duration-300 hover-line"></span>
                </a>
              ))}
              
              {/* OUR TEAM Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTeamOpen(!teamOpen)}
                  className="relative flex items-center gap-2 px-4 py-2 text-white hover:text-gray-200 transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector('.hover-line')?.classList.remove('w-0');
                    e.currentTarget.querySelector('.hover-line')?.classList.add('w-full');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector('.hover-line')?.classList.remove('w-full');
                    e.currentTarget.querySelector('.hover-line')?.classList.add('w-0');
                  }}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">OUR TEAM</span>
                  <span className="text-xs transition-transform duration-300">▼</span>
                  <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 w-0 transition-all duration-300 hover-line"></span>
                </button>
                {teamOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl border border-gray-300/10 rounded-2xl shadow-lg overflow-hidden">
                    <a href="/team/2024-25" className="block px-4 py-3 text-white hover:bg-gray-700/40 transition-all duration-300">Team 2024-25</a>
                    <a href="/team/2023-24" className="block px-4 py-3 text-white hover:bg-gray-700/40 transition-all duration-300">Team 2023-24</a>
                    <a href="/team/2022-23" className="block px-4 py-3 text-white hover:bg-gray-700/40 transition-all duration-300">Team 2022-23</a>
                    <a href="/team/2021-22" className="block px-4 py-3 text-white hover:bg-gray-700/40 transition-all duration-300">Team 2021-22</a>
                  </div>
                )}
              </div>
            </nav>
            
            {/* Right Section - My Dashboard Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDashboard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 hover:from-gray-700/40 hover:to-gray-600/40 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-gray-300/20 shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  {userType === 'student' ? 'Student' : userType === 'admin' ? 'Admin' : 'My'}
                  <br />Dashboard
                </span>
              </button>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-white bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-2 rounded-xl transition-all duration-300 backdrop-blur-md hover:bg-gray-700/40"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl border border-gray-300/10 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:bg-gray-700/40 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                ))}
                
                {/* OUR TEAM for mobile */}
                <div className="relative">
                  <button
                    onClick={() => setTeamOpen(!teamOpen)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:bg-gray-700/40 rounded-xl transition-all duration-300 w-full text-left"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">OUR TEAM</span>
                    <span className="text-xs ml-auto transition-transform duration-300">▼</span>
                  </button>
                  {teamOpen && (
                    <div className="mt-2 ml-4 space-y-1 bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-2">
                      <a href="/team/2024-25" className="block px-3 py-2 text-white hover:bg-gray-700/40 rounded-lg transition-all duration-300">Team 2024-25</a>
                      <a href="/team/2023-24" className="block px-3 py-2 text-white hover:bg-gray-700/40 rounded-lg transition-all duration-300">Team 2023-24</a>
                      <a href="/team/2022-23" className="block px-3 py-2 text-white hover:bg-gray-700/40 rounded-lg transition-all duration-300">Team 2022-23</a>
                      <a href="/team/2021-22" className="block px-3 py-2 text-white hover:bg-gray-700/40 rounded-lg transition-all duration-300">Team 2021-22</a>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    handleDashboard();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 hover:from-gray-700/40 hover:to-gray-600/40 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-gray-300/20 shadow-md w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{userType === 'student' ? 'Student Dashboard' : userType === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500/30 to-red-400/20 hover:from-red-500/40 hover:to-red-400/30 text-white rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-red-400/20 shadow-md w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Login/Logout Button in Corner */}
      {isLoggedIn ? (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="group relative">
            <button 
              onClick={handleLogout}
              className="w-14 h-14 bg-gradient-to-br from-red-600/70 to-red-500/50 hover:from-red-700/70 hover:to-red-600/50 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border-2 border-red-400/20"
            >
              <LogOut className="w-6 h-6" />
            </button>
            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-300/10">
              Logout
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/70"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-6 left-6 z-50">
          <div className="group relative">
            <button 
              onClick={handleLogin}
              className="w-14 h-14 bg-gradient-to-br from-blue-600/70 to-blue-500/50 hover:from-blue-700/70 hover:to-blue-600/50 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border-2 border-blue-400/20"
            >
              <LogIn className="w-6 h-6" />
            </button>
            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-300/10">
              Login
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/70"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;