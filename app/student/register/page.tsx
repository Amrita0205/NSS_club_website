'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function StudentRegister() {
  const [form, setForm] = useState({
    name: '', rollNo: '', email: '', phone: '', year: '', branch: '', password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [errorList, setErrorList] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'rollNo') {
      setForm({ ...form, rollNo: e.target.value.trim().toUpperCase() });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Step validation
  const validateStep = () => {
    setError('');
    setErrorList([]);
    if (step === 1) {
      if (!form.name || !form.rollNo || !form.email) {
        setError('Please fill all fields.');
        return false;
      }
      // Basic email validation
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        setError('Please enter a valid email.');
        return false;
      }
      // Organization domain validation
      if (!form.email.toLowerCase().endsWith('@iiitr.ac.in')) {
        setError('Only @iiitr.ac.in email accounts are allowed for registration.');
        return false;
      }
    } else if (step === 2) {
      if (!form.phone || !form.year || !form.branch) {
        setError('Please fill all fields.');
        return false;
      }
      if (!/^[6-9]\d{9}$/.test(form.phone)) {
        setError('Please enter a valid phone number.');
        return false;
      }
    } else if (step === 3) {
      if (!form.password) {
        setError('Please enter a password.');
        return false;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setError('');
    setErrorList([]);
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/student/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        rollNo: form.rollNo,
        phone: form.phone,
        year: Number(form.year),
        branch: form.branch,
      });
      const data = res.data;
      setSuccess('Registration successful! Please wait for admin approval.');
      toast.success('Registration successful! Please login after approval.');
      setForm({ name: '', rollNo: '', email: '', phone: '', year: '', branch: '', password: '' });
      setTimeout(() => router.push('/student/login'), 1500);
    } catch (err: any) {
      const data = err.response?.data || {};
      setError(data.message || 'Registration failed.');
      if (data.errors && Array.isArray(data.errors)) {
        setErrorList(data.errors.map((err: any) => {
          if (err.msg && err.msg.includes('roll number format')) {
            return 'Invalid roll number format (e.g., CS23B1006)';
          }
          return err.msg || JSON.stringify(err);
        }));
      }
      toast.error(data.message || 'Registration failed.');
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
      
      console.log('Initializing Google Sign-In');
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            // Decode id token to prefill name and email
            const idToken = response.credential as string;
            try {
              const base64 = idToken.split('.')[1];
              const decoded = JSON.parse(atob(base64));
              const fetchedName = decoded?.name || '';
              const fetchedEmail = (decoded?.email || '').toLowerCase();
              setForm(prev => ({ ...prev, name: fetchedName || prev.name, email: fetchedEmail || prev.email }));
              toast.success(`Fetched name from Google: ${fetchedName || 'Unknown'}`);
            } catch {}

            // prompt for rollNo then register/login via google endpoint
            const roll = window.prompt('Enter your roll number (e.g., CS23B1006)');
            if (!roll) { setLoading(false); return; }
            const res = await axios.post('http://localhost:5000/api/student/google-login', { idToken, rollNo: roll });
            const data = res.data;
            if (data?.success) {
              localStorage.setItem('student_token', data.token);
              toast.success('Registered via Google! Await approval if pending.');
              setTimeout(() => router.push('/'), 800);
            }
          } catch (err: any) {
            const msg = err?.response?.data?.message || 'Google registration failed';
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        ux_mode: 'popup'
      });
      
      if (googleBtnRef.current) {
        console.log('Rendering Google button');
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
          Student Registration
        </h2>
        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="bg-white/5 backdrop-blur-[32px] border-2 border-white/30 rounded-3xl shadow-2xl ring-1 ring-white/10 p-8 w-full max-w-md flex flex-col space-y-5">
          {step === 1 && (
            <>
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
              <input name="rollNo" placeholder="Roll Number" value={form.rollNo} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
            </>
          )}
          {step === 2 && (
            <>
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
              <select name="year" value={form.year} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required>
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <input name="branch" placeholder="Branch" value={form.branch} onChange={handleChange} className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
            </>
          )}
          {step === 3 && (
            <>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-base" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
              <div className="bg-gray-900/40 rounded-lg p-4 mt-2 text-sm text-gray-200">
                <div className="mb-2 font-semibold text-white">Review your details:</div>
                <div><span className="font-medium">Name:</span> {form.name}</div>
                <div><span className="font-medium">Roll No:</span> {form.rollNo}</div>
                <div><span className="font-medium">Email:</span> {form.email}</div>
                <div><span className="font-medium">Phone:</span> {form.phone}</div>
                <div><span className="font-medium">Year:</span> {form.year}</div>
                <div><span className="font-medium">Branch:</span> {form.branch}</div>
              </div>
            </>
          )}
          {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
          {errorList.length > 0 && (
            <ul className="text-red-400 text-sm font-medium text-center space-y-1">
              {errorList.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          )}
          {success && <div className="text-green-400 text-sm font-medium text-center">{success}</div>}
          <div className="flex gap-2 mt-2">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg text-white font-semibold text-base shadow-md transition-all duration-200">Back</button>
            )}
            {step < 3 && (
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500/80 px-4 py-3 rounded-lg text-white font-bold text-base shadow-md transition-all duration-200">Next</button>
            )}
            {step === 3 && (
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500/80 px-4 py-3 rounded-lg text-white font-bold text-base shadow-md transition-all duration-200 disabled:opacity-60" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            )}
          </div>
          <Link href="/student/login" className="text-blue-400 hover:underline text-center">Already registered? Login here</Link>
        </form>
        <div className="mt-6 w-full max-w-md flex flex-col items-center">
          <div className="text-gray-400 text-sm mb-2">or</div>
          <div ref={googleBtnRef} className="min-h-[40px] flex items-center justify-center w-full">
            {/* Always show fallback button */}
            <button 
              type="button"
              onClick={() => {
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1083888259368-od9dlep0pdmopg7d3bun0r57a13rrsik.apps.googleusercontent.com';
                // @ts-ignore
                if ((window as any).google?.accounts?.id) {
                  // @ts-ignore
                  (window as any).google.accounts.id.prompt();
                } else {
                  toast.error('Google Sign-In not loaded. Please refresh the page.');
                }
              }}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 w-full justify-center"
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
          <div className="text-xs text-gray-400 mt-2">Use your @iiitr.ac.in email</div>
        </div>
        <Link href="/" className="mt-4 text-gray-300 hover:text-white hover:underline text-center">Back to Home</Link>
      </div>
      {loading && <SplashScreen />}
    </main>
  );
} 