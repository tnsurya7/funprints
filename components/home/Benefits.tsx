'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Users } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Personalized Customization',
    description: 'Bespoke screen, DTF, and embroidery options tailored to your exact graphics and branding.',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Pre-shrunk, bio-washed cotton and athletic fabrics engineered for long-lasting color and fit.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Direct collaboration with our production team to verify artwork dimensions and mockups.',
  },
];

export default function Benefits() {
  return (
    <section className="py-12 sm:py-20 bg-slate-50/60 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-block mb-3 sm:mb-4">
            <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm font-semibold border border-gray-200">
              Why Choose FunPrint
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-3">
            Built for Durability & Comfort
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            We handle design verification, sampling, and printing with strict quality benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mb-5">
                <benefit.icon className="w-6 h-6 text-amber-700" />
              </div>
              
              <h3 className="text-xl font-bold mb-2.5 text-gray-950">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
