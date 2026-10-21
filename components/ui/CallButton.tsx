'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function CallButton() {
  const pathname = usePathname();
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  if (pathname?.startsWith('/admin') || !phoneNumber) return null;

  return (
    <motion.a
      href={`tel:${phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`}`}
      className="fixed bottom-[8.75rem] right-5 sm:right-6 z-50 group"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, duration: 0.4 }}
    >
      {/* Real Phone Call Button with Dial Handset Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-white flex items-center justify-center"
        aria-label="Call Us Directly"
      >
        {/* Authentic Solid Phone Call Handset Vector */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 sm:w-6 sm:h-6 fill-white"
          aria-hidden="true"
        >
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4.07c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c-.01-.55-.46-1-1.06-1z" />
        </svg>
      </motion.div>

      {/* Clean Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-950 text-white text-xs font-semibold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        Call Us Directly
      </div>
    </motion.a>
  );
}
