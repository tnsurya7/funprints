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
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919344925600';
        const whatsappMessage = encodeURIComponent(
          `Hi FunPrint,\n\nName: ${formData.name}\nEmail: ${formData.email}\nMobile: ${formData.mobile}\n\nMessage: ${formData.message}`
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
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-block mb-3 sm:mb-4">
            <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm font-semibold border border-gray-200">
              Get In Touch
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-3">
            Contact FunPrint
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto">
            Have questions about custom printing, bulk quantities, or fabric weights? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black mb-5 text-gray-950">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                  placeholder="9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all resize-none text-sm outline-none"
                  placeholder="Describe your design, quantity, or query..."
                  required
                />
              </div>

              {/* Curvly Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details Cards */}
          <div className="space-y-4 font-serif">
            {[
              {
                icon: Phone,
                title: 'Phone Support & WhatsApp',
                content: '+91 93449 25600',
                link: 'tel:+919344925600',
              },
              {
                icon: Mail,
                title: 'Official Email',
                content: 'contact@funprint.in',
                link: 'mailto:contact@funprint.in',
              },
              {
                icon: MapPin,
                title: 'Head Office',
                content: 'FunPrint (OSHIVO EXIM OPC PVT LTD), Savithri Palace No: 325, Paper Mills Road, Perambur, Chennai - 600011, Tamil Nadu, India.',
                link: null,
              },
              {
                icon: MapPin,
                title: 'Production Unit',
                content: '105, Linga Gounder Street, Odakkadu, Tirupur - 641602',
                link: null,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#FFC006]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-0.5">
                    {item.title}
                  </h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm sm:text-base font-bold text-gray-900 hover:text-amber-700 transition-colors"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Business Hours */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950 mb-3">
                Working Hours
              </h3>
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <p className="flex justify-between">
                  <span>Monday – Saturday:</span>
                  <strong className="text-gray-900">9:30 AM – 7:30 PM</strong>
                </p>
                <p className="flex justify-between">
                  <span>Sunday:</span>
                  <strong className="text-gray-900">10:00 AM – 4:00 PM</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}