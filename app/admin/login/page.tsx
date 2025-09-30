'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import axios from 'axios';
import SplashScreen from '../../components/SplashScreen';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passKey, setPassKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassKey, setShowPassKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { 
        email, 
        password, 
        passKey 
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.success) {
        toast.success('Admin login successful!');
        localStorage.setItem('admin_token', res.data.data.token);
        setTimeout(() => router.push('/'), 600);
      } else {
        setError('Login failed. Please check your credentials.');
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check if the server is running.');
        toast.error('Request timeout. Please check if the server is running.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Login failed. Please try again.');
        toast.error('Login failed. Please try again.');
      }
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
      
      console.log('Initializing Google Sign-In for admin login');
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            setError('');
            const pass = window.prompt('Enter admin passkey');
            if (!pass) {
              setLoading(false);
              return;
            }
            const idToken = response.credential;
            const res = await axios.post('http://localhost:5000/api/admin/google-login', { idToken, passKey: pass });
            if (res.data?.success) {
              toast.success('Admin login successful!');
              localStorage.setItem('admin_token', res.data.data.token);
              setTimeout(() => router.push('/'), 600);
            } else {
              setError('Login failed.');
              toast.error('Login failed.');
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
        console.log('Rendering Google button for admin login');
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
          Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-[32px] border-2 border-white/30 rounded-3xl shadow-2xl ring-1 ring-white/10 p-8 w-full max-w-md flex flex-col space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
          <div className="relative">
            <input
              type={showPassKey ? 'text' : 'password'}
              placeholder="Pass Key"
              value={passKey}
              onChange={e => setPassKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
            />
            <button type="button" onClick={() => setShowPassKey(!showPassKey)} aria-label={showPassKey ? 'Hide pass key' : 'Show pass key'} className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white">{showPassKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
          {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500/80 px-4 py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-200 disabled:opacity-60" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          <div className="flex flex-col space-y-2 mt-4">
            <Link href="/admin/register" className="text-blue-400 hover:text-blue-300 hover:underline text-center">Register New Admin</Link>
            <Link href="/portal" className="text-gray-300 hover:text-white hover:underline text-center">Back to Home</Link>
          </div>
        </form>
        <div className="mt-6 w-full max-w-md flex flex-col items-center">
          <div className="text-gray-400 text-sm mb-2">or</div>
          <div ref={googleBtnRef} />
          <div className="text-xs text-gray-400 mt-2">Use your organization Gmail + passkey</div>
        </div>
      </div>
      {loading && <SplashScreen message="Signing you in..." />}
    </main>
  );
} 