'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Subtle badge */}
          <div className="inline-block mb-4 sm:mb-6">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-gray-200 text-xs sm:text-sm font-semibold border border-white/15">
              Ready to Order?
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 text-white tracking-tight leading-tight">
            Bring Your Apparel Vision to Life
          </h2>
          <p className="text-base sm:text-xl mb-8 sm:mb-10 text-gray-300 font-normal leading-relaxed">
            Order individual pieces or request wholesale bulk pricing.
            Fast doorstep dispatch across India with full quality guarantee.
          </p>
          
          {/* Curvly Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xl mx-auto flex-wrap">
            <Link href="/products" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold bg-[#FFC006] text-gray-950 hover:bg-[#E5AC00] shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base border border-amber-400/60"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/retail-orders" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold bg-white text-gray-950 hover:bg-gray-100 shadow-sm transition-all text-sm sm:text-base"
              >
                Customized Logo Orders
              </button>
            </Link>
            
            <Link href="/bulk-order" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-sm sm:text-base"
              >
                T-Shirts & Hoodies Bulk
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFC006]" />
              <span>Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFC006]" />
              <span>100% Bio-Washed Fabrics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFC006]" />
              <span>Instant WhatsApp Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
