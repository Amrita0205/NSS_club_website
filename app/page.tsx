'use client'

import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Activities from './components/Activities'
import EventSlider from './components/EventSlider'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Welcome message for logged in users */}
      <WelcomeMessage />
      <Hero />
      <About />
      <Activities />
      <EventSlider />
      <Contact />
      <Footer />
    </div>
  );
}

function WelcomeMessage() {
  if (typeof window === 'undefined') return null as any;
  // small component; use inline effect without importing React hooks at top-level file
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ReactRef = require('react');
  const { useState, useEffect } = ReactRef;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showWelcome, setShowWelcome] = useState(false);
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const studentToken = localStorage.getItem('student_token');
    const adminToken = localStorage.getItem('admin_token');
    
    if (studentToken) {
      setUserType('student');
      setShowWelcome(true);
      // Hide welcome message after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000);
    } else if (adminToken) {
      setUserType('admin');
      setShowWelcome(true);
      // Hide welcome message after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000);
    }
  }, []);
  
  if (!showWelcome) return null;
  
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-600/90 to-blue-600/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl animate-fade-in">
      <div className="text-center text-white">
        <h3 className="text-xl font-bold mb-2">
          Welcome back, {userType === 'student' ? 'Student' : 'Admin'}! 👋
        </h3>
        <p className="text-sm mb-4 opacity-90">
          You can access your dashboard using the "My Dashboard" button in the header.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => window.location.href = userType === 'student' ? '/student/dashboard' : '/admin/dashboard'}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => setShowWelcome(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}