import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Building2, Factory, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          {/* Brand & Socials (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 p-1 border border-white/20 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="FunPrint Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  FunPrint
                </h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Premium custom-printed apparel, bio-washed cotton T-shirts, fleece hoodies, and corporate bulk wear engineered for vibrant, long-lasting prints.
            </p>

            {/* Social links */}
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                Connect With Us
              </p>
              <div className="flex gap-2.5">
                <a
                  href="https://www.facebook.com/thefunprint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-[#FFC006] text-gray-300 hover:text-gray-950 flex items-center justify-center transition-all border border-gray-800"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href="https://www.instagram.com/funprint.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-[#FFC006] text-gray-300 hover:text-gray-950 flex items-center justify-center transition-all border border-gray-800"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://www.youtube.com/@funprint19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-[#FFC006] text-gray-300 hover:text-gray-950 flex items-center justify-center transition-all border border-gray-800"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="pt-2 space-y-2 text-xs sm:text-sm">
              {(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) && (
                <a
                  href={`tel:+${(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '')}`}
                  className="flex items-center gap-2.5 text-gray-300 hover:text-[#FFC006] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-[#FFC006]">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">
                    +{ (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '') }
                  </span>
                </a>
              )}

              <a
                href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@funprint.in'}`}
                className="flex items-center gap-2.5 text-gray-300 hover:text-[#FFC006] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-[#FFC006]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>{process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@funprint.in'}</span>
              </a>
            </div>
          </div>

          {/* Quick Links & Catalog (Col 5-7) */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h4 className="font-bold mb-3 text-white text-xs sm:text-sm uppercase tracking-wider">
                Catalog & Ordering
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Shop Catalog</span>
                  </Link>
                </li>
                <li>
                  <Link href="/retail-orders" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Retail Orders (Custom Logos)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/bulk-order" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Bulk Orders (T-Shirts & Hoodies)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-white text-xs sm:text-sm uppercase tracking-wider">
                Policies & Terms
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Refund & Exchange Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms#cancellations" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Cancellation Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-[#FFC006] transition-colors flex items-center gap-1.5 text-gray-400 hover:underline">
                    <ChevronRight className="w-3 h-3 text-[#FFC006]" />
                    <span>Admin Panel</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Addresses (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
              Company & Locations
            </h4>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                <Building2 className="w-4 h-4 text-[#FFC006] flex-shrink-0" />
                <span>Head Office</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed pl-6">
                <strong className="text-white block">FunPrint (OSHIVO EXIM OPC PVT LTD)</strong>
                Savithri Palace No: 325, Paper Mills Road, Perambur, Chennai - 600011, Tamil Nadu, India.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                <Factory className="w-4 h-4 text-[#FFC006] flex-shrink-0" />
                <span>Production Unit</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed pl-6">
                105, Linga Gounder Street, Odakkadu, Tirupur - 641602, Tamil Nadu, India.
              </p>
            </div>
          </div>
        </div>

        {/* Highlighted Terms & Policies Summary Box in Footer */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-gray-900/50 border border-gray-800/80">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFC006]" />
              <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">
                Order & Refund Policy Summary
              </h4>
            </div>
            <Link
              href="/terms"
              className="text-xs text-[#FFC006] hover:underline font-bold"
            >
              Read Full Terms & Conditions &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="text-white font-bold mb-1">Plain T-Shirts Dispatch</p>
              <p>
                Plain t-shirts delivered within a maximum of 3 business days from confirmation. Damaged items require opening video evidence to claim refund.
              </p>
            </div>

            <div>
              <p className="text-white font-bold mb-1">Custom Bulk Orders</p>
              <p>
                Personalized logo orders cannot be cancelled or refunded once production has begun. Full agreed payment required upon dispatch.
              </p>
            </div>

            <div>
              <p className="text-white font-bold mb-1">Exchanges & Cancellations</p>
              <p>
                Size exchanges available for plain t-shirts (subject to stock). Cancellations for plain items accepted prior to courier dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} FunPrint. All rights reserved.</p>
          <div className="hidden md:flex gap-4 flex-wrap justify-center items-center">
            <span>GST Registered</span>
            <span>•</span>
            <span>Made in Tirupur & Chennai</span>
            <span>•</span>
            <span>Pan-India Doorstep Dispatch</span>
          </div>
          <div className="hidden md:flex items-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#FFC006] transition-colors font-medium hover:underline py-1 px-2.5 rounded-lg border border-gray-800/80 bg-gray-900/40 hover:bg-gray-900"
              title="Admin Panel Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC006]" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
