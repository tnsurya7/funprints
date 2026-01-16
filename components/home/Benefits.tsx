'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Users } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Personalized Service',
    description: 'Tailored designs that match your unique style and vision.',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Premium fabrics and printing techniques for lasting quality.',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'Creative Collaboration',
    description: 'Work directly with our design team to perfect your creation.',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
  },
];

export default function Benefits() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-semibold shadow-lg">
              Why Choose Us
            </span>
          </motion.div>
          <h2 className="text-5xl font-bold mb-4 text-gradient">Why Choose Fun Prints?</h2>
          <p className="text-xl text-gray-600">Excellence in every stitch</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              
              {/* Card */}
              <div className="relative card-gradient p-8 text-center h-full">
                {/* Icon with gradient background */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${benefit.gradient} rounded-2xl mb-6 shadow-lg`}
                >
                  <benefit.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                
                {/* Decorative gradient line */}
                <div className={`mt-6 h-1 w-20 mx-auto bg-gradient-to-r ${benefit.gradient} rounded-full`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
