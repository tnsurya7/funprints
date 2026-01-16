'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Event Organizer',
    content: 'Amazing quality and service! Our team t-shirts turned out perfect.',
    rating: 5,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Priya Patel',
    role: 'Startup Founder',
    content: 'Fast delivery and excellent customization options. Highly recommend!',
    rating: 5,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Amit Kumar',
    role: 'College Student',
    content: 'Best custom t-shirts in town. Great prices and quality.',
    rating: 5,
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"></div>
      
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
            <span className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white text-sm font-semibold shadow-lg">
              Testimonials
            </span>
          </motion.div>
          <h2 className="text-5xl font-bold mb-4 text-gradient">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">Real feedback from real people</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              
              {/* Card */}
              <div className="relative card-gradient p-8 h-full">
                {/* Stars with gradient */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.2 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star className={`w-5 h-5 fill-current bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent`} style={{ fill: 'url(#star-gradient)' }} />
                    </motion.div>
                  ))}
                </div>
                
                {/* SVG gradient definition */}
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-4">
                  {/* Avatar with gradient */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
