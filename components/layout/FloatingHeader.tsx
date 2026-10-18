'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import AuthModal from '@/components/auth/AuthModal';

export default function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const [customer, setCustomer] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';

  // Customer session check on public pages
  useEffect(() => {
    fetch('/api/customer/auth')
      .then((res) => (res.ok ? res.json() : fetch('/api/auth/me').then((r) => r.json())))
      .then((data) => {
        if (data?.authenticated && data.customer) {
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Auto sign out admin if navigating to public pages (home, cart, accounts, retail-orders, bulk-orders, contact)
  // Only "View Products" (/products) keeps the admin logged in!
  useEffect(() => {
    if (!pathname.startsWith('/admin') && pathname !== '/products') {
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const publicNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/retail-orders', label: 'Retail Orders' },
    { href: '/bulk-order', label: 'Bulk Orders' },
    { href: '/contact', label: 'Contact' },
  ];

  const adminNavLinks = [
    { href: '/admin?tab=overview', label: 'Overview', key: 'overview' },
    { href: '/admin?tab=analytics', label: 'Analytics', key: 'analytics' },
    { href: '/admin?tab=live_visitors', label: 'Live Visitors', key: 'live_visitors' },
    { href: '/admin?tab=payments', label: 'Verify Payments', key: 'payments' },
    { href: '/admin?tab=orders', label: 'Orders', key: 'orders' },
    { href: '/admin?tab=inventory', label: 'Products & Inventory', key: 'inventory' },
    { href: '/admin?tab=customers', label: 'Customers', key: 'customers' },
    { href: '/admin?tab=enquiries', label: 'Enquiries', key: 'enquiries' },
    { href: '/admin?tab=settings', label: 'Settings', key: 'settings' },
  ];

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'pt-2 sm:pt-3' : 'pt-3 sm:pt-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div
            className={`rounded-full transition-all duration-300 border ${
              isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-md border-gray-200'
                : 'bg-white/90 backdrop-blur-md shadow-sm border-gray-200/80'
            }`}
          >
            <div className="flex items-center justify-between h-12 sm:h-16 px-3 sm:px-6">
              {/* Public Logo and Header Name (Identical across public and admin pages) */}
              <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-2 group py-1">
                <div className="relative h-9 sm:h-12 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/fun-print-logo.avif"
                    alt="FunPrint Logo"
                    width={64}
                    height={50}
                    className="object-contain h-8 sm:h-11 w-auto"
                    priority
                  />
                </div>
                <span className="text-lg sm:text-2xl font-black tracking-tight text-gray-950 font-serif">
                  FunPrint
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden xl:flex items-center gap-0.5">
                {!isAdminPage &&
                  publicNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <div
                          className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gray-900 text-white shadow-sm'
                              : 'text-gray-700 hover:text-gray-950 hover:bg-gray-100'
                          }`}
                        >
                          {link.label}
                        </div>
                      </Link>
                    );
                  })}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {isAdminPage ? (
                  <>
                    {/* Admin Sign Out */}
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-[10.5px] sm:text-xs font-bold border border-red-200 flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap shadow-2xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Customer Account / Orders Button */}
                    <Link
                      href={customer ? '/account/orders' : '#'}
                      onClick={(e) => {
                        if (!customer) {
                          e.preventDefault();
                          setShowAuthModal(true);
                        }
                      }}
                      title={customer ? `My Orders (${customer.fullName})` : 'Sign In / Register'}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800" />
                        {customer && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </motion.div>
                    </Link>

                    {/* Cart Button */}
                    <Link href="/cart">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800" />
                        {cartItems.length > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-4.5 px-0.5 bg-[#FFC006] text-gray-950 text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartItems.length}
                          </span>
                        )}
                      </motion.div>
                    </Link>

                    {/* Login / Account Button - Desktop */}
                    {customer ? (
                      <Link href="/account/orders" className="hidden lg:block">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-3.5 py-1.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-xs shadow-sm hover:shadow transition-all border border-amber-400/60 flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>My Account</span>
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        onClick={() => setShowAuthModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-xs shadow-sm hover:shadow transition-all border border-amber-400/60 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Login</span>
                      </motion.button>
                    )}
                  </>
                )}

                {/* Mobile Menu Button (Only for Public store) */}
                {!isAdminPage && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="xl:hidden flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-3.5 h-3.5 text-gray-800" />
                    ) : (
                      <Menu className="w-3.5 h-3.5 text-gray-800" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown (Public Store Only) */}
      <AnimatePresence>
        {!isAdminPage && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-3 right-3 z-50 xl:hidden"
            >
              <div className="rounded-3xl bg-white shadow-xl border border-gray-200 overflow-hidden p-3.5 space-y-1">
                {isAdminPage ? (
                  <div className="space-y-2 p-1">
                    <div className="px-3 py-2 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-black text-amber-950 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-800" />
                        FunPrint Admin
                      </span>
                      <button
                        onClick={handleAdminLogout}
                        className="text-red-700 font-bold flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                    <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-900 bg-stone-100 hover:bg-stone-200 border border-gray-200 flex items-center justify-between">
                        <span>View Products (Store Preview)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    </Link>
                  </div>
                ) : (
                  <>
                    {publicNavLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div
                            className={`w-full px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                              isActive
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {link.label}
                          </div>
                        </Link>
                      );
                    })}

                    {/* Customer Account / Orders Link */}
                    <Link
                      href={customer ? '/account/orders' : '#'}
                      onClick={(e) => {
                        if (!customer) {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          setShowAuthModal(true);
                        }
                      }}
                    >
                      <div className="w-full px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-gray-800 hover:bg-gray-100 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-600" />
                          {customer ? `My Orders (${customer.fullName?.split(' ')[0]})` : 'Sign In / Orders'}
                        </span>
                        {customer ? (
                          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
                            Logged in
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    <div className="pt-2">
                      {customer ? (
                        <Link href="/account/orders">
                          <button className="w-full py-2.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-xs sm:text-sm shadow-sm transition-all border border-amber-400/60 flex items-center justify-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            <span>My Account ({customer.fullName?.split(' ')[0]})</span>
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setShowAuthModal(true);
                          }}
                          className="w-full py-2.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-xs sm:text-sm shadow-sm transition-all border border-amber-400/60 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Login / Create Account</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(c) => setCustomer(c)}
      />

      {/* Spacer to prevent content from going under header */}
      <div className="h-14 sm:h-20" />
    </>
  );
}
