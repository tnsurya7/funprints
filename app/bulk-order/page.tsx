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
    productType: 'Bulk Order (Min 10 units)',
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
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
              T-Shirts & Hoodies Bulk Orders
            </h1>
          </div>

          {/* Customizations Available Showcase Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
              <Sparkles className="w-5 h-5 text-[#FFC006]" />
              <h2 className="text-lg sm:text-xl font-black text-gray-950">
                Customizations available are:
              </h2>
            </div>
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-5">
              {AVAILABLE_CUSTOMIZATIONS.map((custom) => {
                const Icon = custom.icon;
                const isSelected = selectedCustomizations.includes(custom.id);
                return (
                  <button
                    key={custom.id}
                    type="button"
                    onClick={() => toggleCustomization(custom.id)}
                    className={`flex-shrink-0 w-36 sm:w-40 lg:w-auto p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-gray-950 bg-amber-50/50 ring-1 ring-gray-950 shadow-xs'
                        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-gray-900 text-[#FFC006]' : 'bg-gray-200 text-gray-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'border-gray-950 bg-gray-950 text-white'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="font-extrabold text-[11.5px] sm:text-xs text-gray-950 leading-tight block">
                      {custom.title}
                    </span>
                    <p className="text-[10px] text-gray-500 leading-tight line-clamp-2 mt-1">
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
                        productType: 'Bulk Order (Min 10 units)',
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
                  {/* Bulk Order Minimum Quantity Mention */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC006] text-gray-950 flex items-center justify-center shrink-0 shadow-xs">
                      <Layers className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-gray-950">
                          Bulk Order
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200/90 text-amber-950 border border-amber-300">
                          Minimum 10 Quantity Required
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                        Wholesale bulk pricing and custom manufacturing apply for orders with a minimum quantity of <strong>10 units</strong>. You can combine sizes, colors, T-shirts, and hoodies in your order.
                      </p>
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
                        <span>Submit Bulk Order Enquiry</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Value Highlights */}
          <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
              <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-950 leading-tight">T-Shirts Bulk</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-950 leading-tight">Hoodies Bulk</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-950 leading-tight">Free Digital Proof</h3>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
