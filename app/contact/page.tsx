'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', mobile: '', message: '' });
        
        // Also open WhatsApp
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'YOUR_WHATSAPP_NUMBER';
        const whatsappMessage = encodeURIComponent(
          `Hi Fun Prints,\n\nName: ${formData.name}\nEmail: ${formData.email}\nMobile: ${formData.mobile}\n\nMessage: ${formData.message}`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block mb-4"
          >
            <span className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-semibold shadow-lg">
              Get In Touch
            </span>
          </motion.div>
          <h1 className="text-5xl font-bold mb-4 text-gradient">Contact Us</h1>
          <p className="text-xl text-gray-600">We'd love to hear from you!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-gradient p-8">
              <h2 className="text-2xl font-bold mb-6 text-gradient">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Mobile *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary btn-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            {[
              {
                icon: Phone,
                title: 'Phone',
                content: '+91 98765 43210',
                link: 'tel:+919876543210',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Mail,
                title: 'Email',
                content: 'hello@funprints.com',
                link: 'mailto:hello@funprints.com',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: MessageCircle,
                title: 'WhatsApp',
                content: 'Chat with us',
                link: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                icon: MapPin,
                title: 'Address',
                content: 'Mumbai, Maharashtra, India',
                link: null,
                gradient: 'from-orange-500 to-red-500',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                
                <div className="relative card-gradient p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.link.startsWith('http') ? '_blank' : undefined}
                          rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-gray-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">{item.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="card-gradient p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
                <p>Sunday: 11:00 AM - 6:00 PM</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}