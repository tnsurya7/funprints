'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  Check,
  CheckCheck,
} from 'lucide-react';
import { BRANDS_DATA } from '@/lib/brands-data';
import toast from 'react-hot-toast';

interface BrandEnquiryFormProps {
  selectedBrands: string[];
  onToggleBrand: (brandName: string) => void;
  onSelectAllBrands: () => void;
  onClearBrands: () => void;
}

export default function BrandEnquiryForm({
  selectedBrands,
  onToggleBrand,
  onSelectAllBrands,
  onClearBrands,
}: BrandEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your mobile or WhatsApp number');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (selectedBrands.length === 0) {
      toast.error('Please select at least one brand for bulk enquiry');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/brand-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          brands: selectedBrands,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmitted(true);
      toast.success('Enquiry submitted successfully! Confirmation email sent.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi FunPrint Team,\n\nI am interested in bulk orders for brand collaborations:\n• Selected Brands: ${
      selectedBrands.length > 0 ? selectedBrands.join(', ') : 'All Brands'
    }\n• Name: ${formData.name || 'Not provided'}\n• Phone: ${formData.phone || 'Not provided'}\n• Email: ${
      formData.email || 'Not provided'
    }\n• Requirements: ${formData.message || 'Please share wholesale price chart and MOQ details.'}`
  );

  return (
    <div id="brand-bulk-enquiry-section" className="scroll-mt-24">
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-black text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 sm:py-16 space-y-4 max-w-lg mx-auto"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-black uppercase tracking-wider">
              Enquiry Received
            </span>

            <h3 className="text-xl sm:text-3xl font-extrabold text-white font-serif">
              Thank You, {formData.name}!
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              We received your brand bulk enquiry for{' '}
              <span className="font-bold text-amber-400">{selectedBrands.join(', ')}</span>. A confirmation email has
              been dispatched to <span className="font-semibold text-white">{formData.email}</span>.
            </p>

            <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-stone-300 max-w-sm mx-auto">
              Our B2B brand manager will contact you within 2 to 4 business hours via WhatsApp/Phone at{' '}
              <strong className="text-white">{formData.phone}</strong>.
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <a
                href={`https://wa.me/91${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917358782998').replace(/\D/g, '').slice(-10)}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-lg"
              >
                <span>Instant WhatsApp Connect</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', message: '' });
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10">
            {/* Header */}
            <div className="border-b border-white/10 pb-4 sm:pb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#FFC006] text-stone-950">
                  Bulk Order Enquiry
                </span>
                <span className="text-stone-400 text-[11px] sm:text-xs font-medium">
                  Direct Factory Wholesale Pricing
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                Collaborate &amp; Order in Bulk
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Get tiered volume wholesale quotes for official brands. Select your preferred brands below, enter your
                contact details, and our procurement team will share catalogue stock, price breaks, and sample options.
              </p>
            </div>

            {/* Brand Multi-Selector Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Select Brands (Single or Multiple):</span>
                  <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center gap-2 text-[10.5px] sm:text-xs">
                  <button
                    type="button"
                    onClick={onSelectAllBrands}
                    className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-stone-500">•</span>
                  <button
                    type="button"
                    onClick={onClearBrands}
                    className="text-stone-400 hover:text-stone-300 font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Brand Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {BRANDS_DATA.map((brand) => {
                  const isSelected = selectedBrands.includes(brand.name);
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => onToggleBrand(brand.name)}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md shadow-amber-400/20 font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold truncate">{brand.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-stone-950 text-amber-400 border-stone-950'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedBrands.length > 0 && (
                <p className="text-[11px] sm:text-xs text-amber-300/90 font-medium pt-0.5">
                  Selected ({selectedBrands.length}): {selectedBrands.join(', ')}
                </p>
              )}
            </div>

            {/* Contact Details Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-stone-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Name</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-stone-800/80 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-colors"
                />
              </div>

              {/* Mobile / WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-stone-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile / WhatsApp Number</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-stone-800/80 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-stone-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email ID</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rajesh@company.com"
                  className="w-full bg-stone-800/80 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Message Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold text-stone-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Message &amp; Order Requirements</span>
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your concern, approximate quantity (e.g. 50 pcs), size breakdown, custom logo printing/embroidery requirements, or expected delivery timeline..."
                className="w-full bg-stone-800/80 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[10.5px] sm:text-xs text-stone-400 text-center sm:text-left">
                <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Confirmation email sent to you immediately upon submission.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Instant WhatsApp Enquiry */}
                <a
                  href={`https://wa.me/91${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917358782998').replace(/\D/g, '').slice(-10)}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors"
                  title="Chat directly on WhatsApp"
                >
                  <span>WhatsApp</span>
                </a>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#FFC006] hover:bg-[#e0a800] disabled:opacity-60 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Brand Bulk Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
