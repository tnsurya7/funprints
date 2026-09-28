import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"></div>
      
      {/* Animated orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/10 shadow-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Fun Print Logo"
                  width={36}
                  height={36}
                  className="object-contain w-full h-full brightness-110"
                />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fun Print
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Premium custom t-shirts with personalized designs and quality assurance.
            </p>
            
            {/* Social icons with gradient */}
            <div className="flex gap-4 mt-6">
              {[
                { Icon: Facebook, gradient: 'from-blue-500 to-blue-600' },
                { Icon: Instagram, gradient: 'from-pink-500 to-purple-600' },
                { Icon: Twitter, gradient: 'from-blue-400 to-cyan-500' },
              ].map(({ Icon, gradient }, index) => (
                <a
                  key={index}
                  href="#"
                  className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white hover:scale-110 transition-transform shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/products', label: 'Products' },
                { href: '/bulk-order', label: 'Bulk Orders' },
                { href: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 transition-all group inline-flex items-center gap-2"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-4 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Support</h4>
            <ul className="space-y-3">
              {[
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns', label: 'Returns & Refunds' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 transition-all group inline-flex items-center gap-2"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-4 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-400">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>hello@funprint.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with gradient border */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-400 text-xs sm:text-sm">
              &copy; 2026 Fun Print. All rights reserved.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-gray-500">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400">
                ✓ Secure Payment
              </span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400">
                ✓ Fast Delivery
              </span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400">
                ✓ Quality Assured
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
