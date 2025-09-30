'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passKey, setPassKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/register', { 
        name, 
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
        toast.success('Admin registration successful!');
        setTimeout(() => router.push('/admin/login'), 1000);
      } else {
        setError('Registration failed. Please try again.');
        toast.error('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
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
        setError('Registration failed. Please try again.');
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1083888259368-od9dlep0pdmopg7d3bun0r57a13rrsik.apps.googleusercontent.com';
    if (!clientId) {
      console.log('Google Client ID not found');
      return;
    }
    
    const init = () => {
      // @ts-ignore
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.id) {
        console.log('Google not loaded yet');
        return;
      }
      
      console.log('Initializing Google Sign-In for admin');
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            const pass = window.prompt('Enter admin passkey to register');
            if (!pass) { setLoading(false); return; }
            // Since register requires password, generate one or prompt
            const pwd = window.prompt('Set a password for admin account');
            if (!pwd) { setLoading(false); return; }
            const idToken = response.credential as string;
            // Prefill name and email from token
            try {
              const base64 = idToken.split('.')[1];
              const decoded = JSON.parse(atob(base64));
              const fetchedName = decoded?.name || '';
              const fetchedEmail = (decoded?.email || '').toLowerCase();
              if (fetchedName) (document.activeElement as HTMLElement)?.blur();
              setName(fetchedName || name);
              setEmail(fetchedEmail || email);
              setPassword(pwd);
              toast.success(`Fetched name from Google: ${fetchedName || 'Unknown'}`);
            } catch {}
            // Verify org via backend google-login first
            await axios.post('http://localhost:5000/api/admin/google-login', { idToken, passKey: pass });
            toast.success('Organization verified. Prefilled your name and email. Submit to finish.');
          } catch (err: any) {
            const msg = err?.response?.data?.message || 'Google verification failed';
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        ux_mode: 'popup'
      });
      
      if (googleBtnRef.current) {
        console.log('Rendering Google button for admin');
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          width: 320,
          text: 'signup_with'
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
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpolygon points='30 30 60 30 60 60 30 60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Registration</h1>
          <p className="text-gray-400">Create a new admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-[32px] border-2 border-white/30 rounded-3xl shadow-2xl ring-1 ring-white/10 p-8 w-full max-w-md flex flex-col space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
          />
          <input
            type="password"
            placeholder="Pass Key"
            value={passKey}
            onChange={e => setPassKey(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-base" required
          />
          {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500/80 px-4 py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-200 disabled:opacity-60" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
          <div className="mt-2 w-full flex flex-col items-center">
            <div className="text-gray-400 text-sm mb-2">or</div>
            <div ref={googleBtnRef} className="min-h-[40px] flex items-center justify-center">
              {/* Fallback button if Google doesn't load */}
              <button 
                type="button"
                onClick={() => {
                  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                  if (!clientId) {
                    toast.error('Google Client ID not configured');
                    return;
                  }
                  // @ts-ignore
                  if ((window as any).google?.accounts?.id) {
                    // @ts-ignore
                    (window as any).google.accounts.id.prompt();
                  } else {
                    toast.error('Google Sign-In not loaded. Please refresh the page.');
                  }
                }}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Quick Register with Google
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">Verify with @iiitr.ac.in email + passkey</div>
          </div>
          <Link href="/admin/login" className="mt-4 text-gray-300 hover:text-white hover:underline text-center">Already have an account? Login</Link>
        </form>
      </div>
      {loading && <SplashScreen />}
    </main>
  );
} 