'use client';

import { motion } from 'framer-motion';

export default function BrandStory() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <span className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg">
                Our Story
              </span>
            </motion.div>
            
            <h2 className="text-5xl font-bold mb-6 text-gradient">Our Story</h2>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Fun Prints was born from a passion for self-expression and quality craftsmanship. 
                We believe everyone deserves to wear something that truly represents who they are.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                From small batches to bulk orders, we treat every project with the same dedication 
                to excellence. Our team works closely with you to bring your vision to life.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Join thousands of satisfied customers who trust Fun Prints for their custom apparel needs.
              </p>
            </div>

            {/* Stats with gradient cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { number: '5+', label: 'Years' },
                { number: '10K+', label: 'Customers' },
                { number: '50K+', label: 'Orders' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative card-gradient p-4 text-center">
                    <div className="text-3xl font-bold text-gradient mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-30"></div>
            
            {/* Image card */}
            <div className="relative card-gradient p-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-center"
                >
                  <p className="text-white text-3xl font-bold mb-2">Fun Prints</p>
                  <p className="text-white/80 text-lg">Brand Story Image</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
