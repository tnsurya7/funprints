'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Phone, User, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1); // 1: details, 2: OTP, 3: password
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegStep(1);
    }
  }, [isOpen, initialMode]);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      toast.error('Please enter your email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed.');
      } else {
        toast.success('Welcome back, ' + (data.customer?.fullName || 'Customer') + '!');
        onSuccess(data.customer);
        onClose();
      }
    } catch (err) {
      toast.error('Network error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error('Full Name, Phone, and Email are all mandatory.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', fullName, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP.');
      } else {
        toast.success('Verification OTP sent to ' + email);
        setRegStep(2);
      }
    } catch (err) {
      toast.error('Network error while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP.');
      } else {
        toast.success('Email verified successfully! Now set your password.');
        setRegStep(3);
      }
    } catch (err) {
      toast.error('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, password: regPassword, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed.');
      } else {
        toast.success('Account verified & created successfully!');
        onSuccess(data.customer);
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = '/account/orders';
        }
      }
    } catch (err) {
      toast.error('Network error creating account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      toast.success(data.message || 'Check your email for reset instructions.');
      setMode('login');
    } catch (err) {
      toast.error('Error sending reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-950 text-xs font-bold rounded-full mb-2">
            FunPrint Customer Portal
          </span>
          <h2 className="text-2xl font-black text-gray-950">
            {mode === 'login' ? 'Sign In to Your Account' : mode === 'register' ? 'Create Your Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to continue with checkout'
              : mode === 'register'
              ? 'Quick verification to track orders and save details'
              : 'Enter your email to receive a secure password reset link'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-5 border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegStep(1);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address or Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="surya@gmail.com or 9876543210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In & Continue'}
            </button>

            <div className="text-center pt-2 text-xs text-gray-600">
              New customer?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setRegStep(1); }}
                className="font-bold text-amber-800 hover:underline"
              >
                Create Account (OTP)
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION STEP 1: Details */}
        {mode === 'register' && regStep === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Surya Kumar"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (WhatsApp) <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="surya@gmail.com"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending OTP...' : 'Send Email OTP'}
            </button>

            <div className="text-center pt-2 text-xs text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-amber-800 hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION STEP 2: Verify OTP */}
        {mode === 'register' && regStep === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900">
              We sent a 6-digit OTP to <strong>{email}</strong>. It expires in <strong>5 minutes</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-2xl font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full text-sm disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className="hover:underline"
              >
                &larr; Change Details
              </button>
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-amber-800 font-bold hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION STEP 3: Set Password */}
        {mode === 'register' && regStep === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Email verified! Create your account password:</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Create Password (Min 6 chars)</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full text-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration & Open Dashboard'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email Address</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="surya@gmail.com"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full text-sm disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-gray-500 hover:text-gray-800 font-semibold"
              >
                &larr; Back to Sign In
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
