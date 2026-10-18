'use client';

import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const message = encodeURIComponent('Hi! I want to know more about FunPrint custom t-shirts and hoodies.');

  if (!whatsappNumber) return null;

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 sm:right-6 z-50 group"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Real WhatsApp Button with Authentic WhatsApp Brand Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-white flex items-center justify-center"
        aria-label="Chat with us on WhatsApp"
      >
        {/* Authentic WhatsApp Icon Vector */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-7 sm:h-7 fill-white"
          aria-hidden="true"
        >
          <path d="M12.01 2.002C6.49 2.002 2.01 6.482 2.01 12.002c0 1.898.53 3.674 1.45 5.197L2.01 22.002l4.945-1.39a9.92 9.92 0 005.055 1.39c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.83 14.39c-.24.67-1.18 1.29-1.88 1.44-.48.1-1.1.18-3.19-.68-2.67-1.11-4.39-3.82-4.52-4-.13-.18-1.09-1.45-1.09-2.76 0-1.31.69-1.96.93-2.23.25-.27.54-.34.72-.34.18 0 .36 0 .51.01.16.01.39-.06.6.46.23.54.77 1.88.84 2.02.07.14.11.3.02.48-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.91 1.9 1.2 2.16 1.33.27.13.43.12.58-.06.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.25.09 1.56.74 1.83.87.27.13.45.2.51.31.07.11.07.65-.17 1.32z" />
        </svg>

        {/* Pulse status dot */}
        <span className="absolute top-0 right-0 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-white"></span>
        </span>
      </motion.div>

      {/* Clean Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-950 text-white text-xs font-semibold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        WhatsApp Us
      </div>
    </motion.a>
  );
}
