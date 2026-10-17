'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/retail-orders', label: 'Retail Orders' },
    { href: '/bulk-order', label: 'Bulk Orders' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-12 sm:h-14 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/fun-print-logo.avif"
                alt="FunPrint Logo"
                width={70}
                height={56}
                className="object-contain h-11 sm:h-13 w-auto"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">
              FunPrint
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-full text-sm font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative ml-3">
              <div className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#FFC006] text-gray-950 text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full bg-gray-100 text-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-gray-800 hover:bg-gray-100 rounded-full transition-colors font-semibold text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                className="flex items-center justify-between px-4 py-2.5 text-gray-800 hover:bg-gray-100 rounded-full transition-colors font-semibold text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className="bg-[#FFC006] text-gray-950 text-xs rounded-full px-2.5 py-0.5 font-bold">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
