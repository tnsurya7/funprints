'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
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
    { href: '/bulk-order', label: 'Bulk Orders' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'pt-3' : 'pt-5'
        }`}
      >
        <motion.nav
          animate={{
            scale: isScrolled ? 0.96 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}
        >
          <div
            className={`relative rounded-[24px] transition-all duration-300 ${
              isScrolled
                ? 'bg-white/85 backdrop-blur-2xl shadow-2xl shadow-black/10'
                : 'bg-white/80 backdrop-blur-xl shadow-xl shadow-black/5'
            } border border-white/40`}
            style={{
              background: isScrolled
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 100%)',
            }}
          >
            <div className="flex items-center justify-between h-16 sm:h-18 px-4 sm:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Fun Prints
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
                        pathname === link.href
                          ? 'text-purple-600 font-semibold'
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.label}
                      {pathname === link.href && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <motion.div
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full ${
                          pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Cart Button */}
                <Link href="/cart">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                    {cartItems.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      >
                        {cartItems.length}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                {/* CTA Button - Desktop */}
                <Link href="/products" className="hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Shop Now
                  </motion.button>
                </Link>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div
                className="rounded-[24px] bg-white/95 backdrop-blur-2xl shadow-2xl border border-white/40 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)',
                }}
              >
                <div className="p-4 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={link.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                            pathname === link.href
                              ? 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 text-purple-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* CTA Button - Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="pt-2"
                  >
                    <Link href="/products">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg"
                      >
                        Shop Now
                      </motion.button>
                    </Link>
                  </motion.div>
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
