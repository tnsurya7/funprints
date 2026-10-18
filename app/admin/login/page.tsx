'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
        }
        toast.success('Admin login successful!');
        router.push('/admin');
      } else {
        toast.error(data.error || 'Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 font-serif flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFC006]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to store */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-950 transition-colors bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to FunPrint Store</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-xl border border-gray-200/90">
          {/* Logo & Header */}
          <div className="text-center mb-7">
            <div className="relative w-16 h-14 mx-auto mb-3 flex items-center justify-center">
              <Image
                src="/fun-print-logo.avif"
                alt="FunPrint Logo"
                width={70}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Admin Portal Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder-gray-400 bg-white"
                  placeholder="surya@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all placeholder-gray-400 bg-white"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-full shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-amber-400/60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}