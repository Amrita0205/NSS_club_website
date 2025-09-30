'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import axios from 'axios';
import SplashScreen from '../../components/SplashScreen';
import { Eye, EyeOff } from 'lucide-react';

export default function StudentLogin() {
  const [rollOrEmail, setRollOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log("Attempting login with:", { rollOrEmail: rollOrEmail, password: "***" });
      console.log("Making API call to:", 'http://localhost:5000/api/student/login');
      
      const res = await axios.post('http://localhost:5000/api/student/login', { rollNo: rollOrEmail, password });
      const data = res.data;
      console.log("Login response:", data);
      console.log("Response status:", res.status);
      
      console.log("Login successful! Response data:", data);
      console.log("Token to store:", data.token ? data.token.substring(0, 50) + "..." : "null");
      
      // Store the token
      localStorage.setItem('student_token', data.token);
      console.log("Token stored in localStorage");
      
      // Show success message and redirect to home page
      toast.success('Student login successful!');
      
      // Redirect to home page first (like admin flow)
      setTimeout(() => {
        console.log("Redirecting to home page...");
        router.push('/');
      }, 600);
    } catch (err: any) {
      console.error("Login error:", err);
      const data = err.response?.data || {};
      setError(data.message || 'Login failed. Please check your credentials.');
      toast.error(data.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1083888259368-od9dlep0pdmopg7d3bun0r57a13rrsik.apps.googleusercontent.com';
    if (!clientId) {
      console.log('Google Client ID not configured');
      return;
    }
    
    const init = () => {
      // @ts-ignore
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.id) {
        console.log('Google not loaded yet');
        return;
      }
      
      console.log('Initializing Google Sign-In for student login');
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            setError('');
            const idToken = response.credential;
            
            // First attempt without rollNo (for existing users)
            try {
              const res = await axios.post('http://localhost:5000/api/student/google-login', { idToken });
              const data = res.data;
              if (data?.success) {
                localStorage.setItem('student_token', data.token);
                toast.success('Login successful!');
                setTimeout(() => router.push('/'), 600);
                return;
              }
            } catch (err: any) {
              // If user doesn't exist, prompt for rollNo to register
              const needsRoll = err?.response?.status === 400 && /rollNo/i.test(err?.response?.data?.message || '');
              if (needsRoll) {
                const rollNo = window.prompt('Enter your roll number (e.g., CS23B1006) to complete registration');
                if (rollNo) {
                  try {
                    const res2 = await axios.post('http://localhost:5000/api/student/google-login', { idToken, rollNo });
                    const data2 = res2.data;
                    if (data2?.success) {
                      localStorage.setItem('student_token', data2.token);
                      toast.success('Registration completed! Awaiting admin approval.');
                      setTimeout(() => router.push('/'), 600);
                      return;
                    }
                  } catch (err2: any) {
                    const msg = err2?.response?.data?.message || 'Registration failed';
                    setError(msg);
                    toast.error(msg);
                  }
                } else {
                  toast.error('Registration cancelled');
                }
              } else {
                const msg = err?.response?.data?.message || 'Google login failed';
                setError(msg);
                toast.error(msg);
              }
            }
          } catch (err: any) {
            const msg = err?.response?.data?.message || 'Google login failed';
            setError(msg);
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        ux_mode: 'popup'
      });
      
      if (googleBtnRef.current) {
        console.log('Rendering Google button for student login');
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          width: 320,
          text: 'signin_with'
        });
      }
    };
    
    const ready = () => typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts;
    if (ready()) {
      init();
    } else {
      console.log('Waiting for Google to load...');
      const id = setInterval(() => {
        if (ready()) { 
          clearInterval(id); 
          init(); 
        }
      }, 300);
      return () => clearInterval(id);
    }
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans">
      {/* Pure Black Background */}
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
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-center tracking-tight leading-tight drop-shadow-lg" style={{fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'}}>
          Student Login
        </h2>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-[32px] border-2 border-white/30 rounded-3xl shadow-2xl ring-1 ring-white/10 p-8 w-full max-w-md flex flex-col space-y-5">
          <input
            type="text"
            placeholder="Roll Number or Email"
            value={rollOrEmail}
            onChange={e => setRollOrEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-base" required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-base" required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500/80 px-4 py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-200 disabled:opacity-60" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          <Link href="/student/register" className="text-blue-400 hover:underline text-center">New user? Register here</Link>
        </form>
        <div className="mt-6 w-full max-w-md flex flex-col items-center">
          <div className="text-gray-400 text-sm mb-2">or</div>
          <div ref={googleBtnRef} />
          <div className="text-xs text-gray-400 mt-2">Use your organization Gmail</div>
        </div>
        <Link href="/portal" className="mt-4 text-gray-300 hover:text-white hover:underline text-center">Back to Home</Link>
      </div>
      {loading && <SplashScreen message="Signing you in..." />}
    </main>
  );
} 