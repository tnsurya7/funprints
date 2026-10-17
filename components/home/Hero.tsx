'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const ThreeDTshirtViewer = dynamic(
  () => import('@/components/products/ThreeDTshirtViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full rounded-2xl flex items-center justify-center bg-gray-50 animate-pulse border border-gray-200">
        <div className="text-center text-gray-500">
          <Sparkles className="w-7 h-7 mx-auto mb-2 text-[#FFC006]" />
          <p className="font-semibold text-sm">Loading 3D Experience...</p>
        </div>
      </div>
    )
  }
);

const hero3DColors = [
  'White',
  'Black',
  'Grey',
  'Navy Blue',
  'Royal Blue',
  'Red',
  'Burgundy',
  'Bottle Green',
  'Chrome Yellow',
  'Purple',
  'Dark Orange',
];

export default function Hero() {
  const [colorIndex, setColorIndex] = useState(0);

  // Automatically cycle through colors every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % hero3DColors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const selected3DColor = hero3DColors[colorIndex];

  return (
    <section className="relative bg-slate-50/70 border-b border-gray-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 relative z-10">
        <div className="text-center">
          {/* Top pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 mb-4 sm:mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              Unleash Your Style with FunPrint
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-950 mb-3 sm:mb-5 leading-tight tracking-tight max-w-4xl mx-auto"
          >
            Create Your Perfect Custom T-Shirts & Hoodies
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            High-grade fabrics, tailored fits, and crisp customized logo printing for individuals and corporate teams.
            Available for retail customized orders and factory-direct bulk orders.
          </motion.p>

          {/* Curvly CTA Buttons (Shop Now & Contact Us only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md mx-auto"
          >
            <Link href="/products" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full font-bold text-gray-950 text-sm sm:text-base bg-[#FFC006] hover:bg-[#E5AC00] border border-amber-400/60 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <Link href="/contact" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full font-bold text-gray-900 text-sm sm:text-base bg-white hover:bg-gray-100 border border-gray-300 shadow-sm transition-all duration-200"
              >
                <span>Contact Us</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* 3D Interactive Product Viewer (Homepage only) */}
          <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <ThreeDTshirtViewer
                color={selected3DColor}
                modelPath="/models/tshirts/round-neck.glb"
                productName={`Classic Round Neck T-Shirt - ${selected3DColor}`}
                className="h-[280px] sm:h-[400px] md:h-[500px]"
                initialAutoRotate={true}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto"
          >
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50K+', label: 'Shirts Delivered' },
              { number: '4.9', suffix: '★', label: 'Average Rating' },
              { number: '24-48h', label: 'Quick Dispatch' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-sm text-center"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-1 inline-flex items-center justify-center">
                  <span>{stat.number}</span>
                  {'suffix' in stat && stat.suffix && (
                    <span className="text-[#FFC006] ml-0.5 text-[0.85em] leading-none drop-shadow-xs">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
