'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function FloatingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);

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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/retail-orders', label: 'Retail Orders' },
    { href: '/bulk-order', label: 'Bulk Orders' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'pt-2.5 sm:pt-3' : 'pt-4 sm:pt-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-full transition-all duration-300 border ${
              isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-md border-gray-200'
                : 'bg-white/90 backdrop-blur-md shadow-sm border-gray-200/80'
            }`}
          >
            <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group py-1">
                <div className="relative h-11 sm:h-13 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/fun-print-logo.avif"
                    alt="FunPrint Logo"
                    width={68}
                    height={54}
                    className="object-contain h-10 sm:h-12 w-auto"
                    priority
                  />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 font-serif">
                  FunPrint
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
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
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Cart Button */}
                <Link href="/cart">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-800" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FFC006] text-gray-950 text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cartItems.length}
                      </span>
                    )}
                  </motion.div>
                </Link>

                {/* CTA Button - Desktop */}
                <Link href="/products" className="hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-sm shadow-sm hover:shadow transition-all border border-amber-400/60"
                  >
                    Shop Now
                  </motion.button>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-800" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-800" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div className="rounded-3xl bg-white shadow-xl border border-gray-200 overflow-hidden p-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`w-full px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
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

                <div className="pt-2">
                  <Link href="/products">
                    <button className="w-full py-3 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-sm shadow-sm transition-all border border-amber-400/60">
                      Shop Now
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under header */}
      <div className="h-20 sm:h-24" />
    </>
  );
}
