'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

const ThreeDTshirtViewer = dynamic(
  () => import('@/components/products/ThreeDTshirtViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full rounded-2xl flex items-center justify-center bg-gray-50/80 animate-pulse border border-gray-100">
        <div className="text-center text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-500" />
          <p className="font-medium text-sm">Loading 3D Experience...</p>
        </div>
      </div>
    )
  }
);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient"></div>
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20"
      ></motion.div>
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full blur-3xl opacity-20"
      ></motion.div>

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur-3xl opacity-20"
      ></motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="text-center">
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass mb-8 animate-float"
          >
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Premium Custom T-Shirts
            </span>
            <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
          </motion.div>

          {/* Main heading with gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            Create Your
            <br />
            <span className="text-gradient animate-gradient inline-block">
              Perfect
            </span>
            {' '}T-Shirt
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Premium quality custom t-shirts with{' '}
            <span className="font-semibold text-gradient-blue">personalized designs</span>.
            From concept to creation, we bring your vision to life.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary btn-glow inline-flex items-center gap-3 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/bulk-order">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary inline-flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                <span>Bulk Orders</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* 360° Interactive 3D Product Viewer with Classic Round Neck Grey T-Shirt */}
          <div className="mt-16 sm:mt-20">
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Main card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-white">
                <ThreeDTshirtViewer
                  color="Grey"
                  modelPath="/models/tshirts/round-neck.glb"
                  productName="Classic Round Neck T-Shirt - Grey"
                  className="aspect-[4/3] sm:aspect-video h-[380px] sm:h-[480px] md:h-[560px]"
                  initialAutoRotate={true}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50K+', label: 'Orders Delivered' },
              { number: '4.9★', label: 'Average Rating' },
              { number: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="glass p-6 rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
