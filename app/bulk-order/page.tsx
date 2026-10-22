'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Shirt, Sparkles, CheckCircle2, Layers, Check, Palette, Scissors, Paintbrush } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

const AVAILABLE_CUSTOMIZATIONS = [
  {
    id: 'T-shirt color',
    title: 'T-shirt color',
    desc: '50+ in-stock shades & custom pantone dyeing for exact brand colors',
    icon: Palette,
  },
  {
    id: 'Collar & Cuff',
    title: 'Collar & Cuff',
    desc: 'Custom rib-knit collars, flat-knit cuffs, and two-tone necklines',
    icon: Scissors,
  },
  {
    id: 'Tipping',
    title: 'Tipping',
    desc: 'Single, double, and contrast tipping stripes on polo collars and sleeves',
    icon: Sparkles,
  },
  {
    id: 'Sublimation',
    title: 'Sublimation',
    desc: '360° all-over edge-to-edge breathable printing for jerseys and sports wear',
    icon: Layers,
  },
  {
    id: 'Print / Embroidery',
    title: 'Print / Embroidery',
    desc: 'HD DTF, Screen, Puff, High-Density 3D prints & dense thread embroidery',
    icon: Paintbrush,
  },
];

export default function BulkOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company: '',
    productType: 'Both T-Shirts & Hoodies',
    quantity: '',
    message: '',
  });

  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([
    'T-shirt color',
    'Print / Embroidery',
  ]);

  const toggleCustomization = (id: string) => {
    if (selectedCustomizations.includes(id)) {
      setSelectedCustomizations(selectedCustomizations.filter((c) => c !== id));
    } else {
      setSelectedCustomizations([...selectedCustomizations, id]);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedInfo, setLastSubmittedInfo] = useState({
    name: '',
    productType: '',
    quantity: '',
  });

  const rawNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917358782998').replace(/\D/g, '');
  const targetWhatsappNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;

  const customizationsList = selectedCustomizations.length > 0
    ? selectedCustomizations.join(', ')
    : 'All standard options';

  const bulkWhatsappMessage = encodeURIComponent(
    `Hi FunPrint Bulk Sales,\n\nI want to enquire about bulk orders:\n• Product Type: ${formData.productType}\n• Total Quantity: ${formData.quantity ? `${formData.quantity} units` : 'Not specified yet'}\n• Customizations Requested: ${customizationsList}\n• Name: ${formData.name || 'Not provided'}\n• Mobile: ${formData.mobile || 'Not provided'}\n• Email: ${formData.email || 'Not provided'}\n• Company/College: ${formData.company || 'Not provided'}\n• Requirements: ${formData.message || 'Please share catalog, size chart, and wholesale price breaks.'}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/bulk-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customizations: selectedCustomizations,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      toast.success('Bulk enquiry submitted! Confirmation email sent & our team will contact you shortly.');

      setLastSubmittedInfo({
        name: formData.name,
        productType: formData.productType,
        quantity: formData.quantity,
      });
      setSubmitted(true);

      if (targetWhatsappNumber) {
        window.open(`https://wa.me/${targetWhatsappNumber}?text=${bulkWhatsappMessage}`, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit bulk enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 font-serif">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Top Title & Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-3">
              T-Shirts & Hoodies Bulk Orders
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Special wholesale pricing and direct factory manufacturing for bulk orders of custom printed 
              <strong> T-Shirts</strong> (Crew Neck, Polo, Oversized, Dry-Fit) and <strong>Hoodies</strong> (300 GSM Pullover & Zip-Up).
            </p>
          </div>

          {/* Customizations Available Showcase Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
              <Sparkles className="w-5 h-5 text-[#FFC006]" />
              <h2 className="text-lg sm:text-xl font-black text-gray-950">
                Customizations available are:
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
              Tailor every element of your bulk garments. Select the custom features you require for your quotation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {AVAILABLE_CUSTOMIZATIONS.map((custom) => {
                const Icon = custom.icon;
                const isSelected = selectedCustomizations.includes(custom.id);
                return (
                  <button
                    key={custom.id}
                    type="button"
                    onClick={() => toggleCustomization(custom.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-gray-950 bg-amber-50/50 ring-1 ring-gray-950 shadow-xs'
                        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-gray-900 text-[#FFC006]' : 'bg-gray-200 text-gray-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-gray-950">
                          {custom.title}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-gray-950 bg-gray-950 text-white'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pl-10">
                      {custom.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-12 space-y-4 max-w-lg mx-auto"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-black uppercase tracking-wider">
                  Bulk Enquiry Received
                </span>

                <h3 className="text-xl sm:text-3xl font-extrabold text-gray-950">
                  Thank You, {lastSubmittedInfo.name || 'Valued Customer'}!
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We received your bulk quotation request for{' '}
                  <strong className="text-gray-900">{lastSubmittedInfo.productType}</strong>{' '}
                  {lastSubmittedInfo.quantity && `(${lastSubmittedInfo.quantity} units)`}. Our B2B bulk team will review your specs and contact you with wholesale price breaks and catalogue swatches.
                </p>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <a
                    href={`https://wa.me/${targetWhatsappNumber}?text=${bulkWhatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full transition-colors shadow-lg"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    <span>Instant WhatsApp Connect</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        mobile: '',
                        company: '',
                        productType: 'Both T-Shirts & Hoodies',
                        quantity: '',
                        message: '',
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs sm:text-sm font-bold rounded-full transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-950 pb-4 border-b border-gray-100">
                  Request Bulk Quotation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      What are you ordering? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'T-Shirts Bulk Order', label: 'T-Shirts Bulk Order', desc: 'Round Neck, Polo, Dry-Fit' },
                        { id: 'Hoodies Bulk Order', label: 'Hoodies Bulk Order', desc: 'Pullover & Zip-Up Hoodies' },
                        { id: 'Both T-Shirts & Hoodies', label: 'Both T-Shirts & Hoodies', desc: 'Combined apparel order' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, productType: option.id })}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            formData.productType === option.id
                              ? 'border-gray-950 bg-gray-50 shadow-xs ring-1 ring-gray-950'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <p className="font-bold text-sm text-gray-950">{option.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                        placeholder="Surya Kumar"
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
                        placeholder="surya@gmail.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Mobile / WhatsApp *
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
                        Company / College / Event Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                        placeholder="Acme Corp / College Fest"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Total Quantity (Min: 10 units) *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all text-sm outline-none"
                      placeholder="e.g. 50 T-shirts, 25 Hoodies"
                      required
                      min="10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Design &amp; Customization Details
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 focus:border-gray-950 transition-all resize-none text-sm outline-none"
                      placeholder="Specify fabric preference (e.g. 180 GSM Cotton T-Shirts, 300 GSM Fleece Hoodies), colors, logo placement (chest, back, sleeves), and target delivery date..."
                    />
                  </div>

                  {/* Submission & WhatsApp Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    {/* Instant WhatsApp Enquiry */}
                    <a
                      href={`https://wa.me/${targetWhatsappNumber}?text=${bulkWhatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg shrink-0"
                      title="Chat directly on WhatsApp"
                    >
                      <WhatsAppIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white shrink-0" />
                      <span>WhatsApp Enquiry</span>
                    </a>

                    {/* Curvly Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:flex-1 py-3 sm:py-3.5 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Bulk Enquiry...</span>
                        </>
                      ) : (
                        <span>Submit T-Shirts &amp; Hoodies Bulk Enquiry</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Value Highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs text-center">
              <Shirt className="w-8 h-8 mx-auto text-gray-800 mb-2" />
              <h3 className="text-lg font-bold text-gray-950 mb-1">T-Shirts Bulk</h3>
              <p className="text-xs text-gray-600">
                180-240 GSM bio-washed combed cotton & Dry-Fit aerotech styles in 50+ colors.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs text-center">
              <Layers className="w-8 h-8 mx-auto text-gray-800 mb-2" />
              <h3 className="text-lg font-bold text-gray-950 mb-1">Hoodies Bulk</h3>
              <p className="text-xs text-gray-600">
                300 GSM heavyweight premium fleece pullover & zip hoodies with kangaroo pockets.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <h3 className="text-lg font-bold text-gray-950 mb-1">Free Digital Proof</h3>
              <p className="text-xs text-gray-600">
                We prepare high-res mockups and color swatch approvals before production begins.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
