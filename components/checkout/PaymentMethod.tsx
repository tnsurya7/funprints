'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Smartphone, QrCode, Copy, Check, ShieldCheck, Calendar, Hash, User, Phone } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface UpiPaymentDetails {
  payerName: string;
  payerPhone: string;
  transactionRef: string;
  paymentDateTime: string;
}

interface PaymentMethodProps {
  paymentMethod: 'COD' | 'UPI';
  setPaymentMethod: (method: 'COD' | 'UPI') => void;
  totalAmount: number;
  upiDetails: UpiPaymentDetails;
  setUpiDetails: React.Dispatch<React.SetStateAction<UpiPaymentDetails>>;
  onPlaceOrder: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  upiDetails,
  setUpiDetails,
  onPlaceOrder,
  onBack,
  isSubmitting = false,
}: PaymentMethodProps) {
  const [adminUpiId, setAdminUpiId] = useState(process.env.NEXT_PUBLIC_UPI_ID || '');
  const [adminUpiName, setAdminUpiName] = useState(process.env.NEXT_PUBLIC_UPI_NAME || 'FunPrint');
  const [adminUpiPhone, setAdminUpiPhone] = useState(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          if (data.settings.upiId) setAdminUpiId(data.settings.upiId);
          if (data.settings.upiName) setAdminUpiName(data.settings.upiName);
          if (data.settings.whatsappNumber) setAdminUpiPhone(data.settings.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label}!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // UPI deep link string for dynamic QR generation
  const cleanUpiPhone = adminUpiPhone.replace(/\D/g, '').slice(-10);
  const upiString = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(adminUpiName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('FunPrint Order Payment')}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200 shadow-xs"
    >
      <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-gray-950">Payment Method</h2>

      {/* Two payment choices */}
      <div className="space-y-3 sm:space-y-4 mb-6">
        {/* COD Option */}
        <button
          type="button"
          onClick={() => setPaymentMethod('COD')}
          className={`w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'COD'
              ? 'border-gray-950 bg-gray-50/80 shadow-xs'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-gray-200 shrink-0">
              <Banknote className="w-5 h-5 text-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-gray-950">Cash on Delivery (COD)</h3>
              <p className="text-xs text-gray-500">Pay cash or UPI upon package handover at your doorstep</p>
            </div>
          </div>
        </button>

        {/* Manual UPI Option */}
        <button
          type="button"
          onClick={() => setPaymentMethod('UPI')}
          className={`w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'UPI'
              ? 'border-gray-950 bg-amber-50/50 shadow-xs'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-gray-200 shrink-0">
              <QrCode className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-gray-950">Manual UPI Payment (Scan & Pay)</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  Direct Pay
                </span>
              </div>
              <p className="text-xs text-gray-500">Scan auto-generated QR code or pay to admin UPI ID / Phone</p>
            </div>
          </div>
        </button>
      </div>

      {/* Manual UPI Payment Panel */}
      {paymentMethod === 'UPI' && (
        <div className="mb-6 p-4 sm:p-6 bg-slate-50 border border-gray-200 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs sm:text-sm font-black text-gray-900">
              Step 1: Scan QR or Transfer to FunPrint Admin UPI
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200">
            {/* Auto QR Code */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                <img
                  src={qrUrl}
                  alt="FunPrint UPI QR Code"
                  width={150}
                  height={150}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mt-2 text-[11px] font-black text-gray-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Pay Exactly ₹{totalAmount}
              </span>
            </div>

            {/* Admin Details */}
            <div className="flex-1 min-w-0 w-full space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">Business Name</span>
                <span className="font-bold text-gray-900 text-xs sm:text-sm break-words">{adminUpiName}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Admin UPI ID</span>
                  <span className="font-mono font-bold text-gray-950 text-xs sm:text-sm truncate block">{adminUpiId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(adminUpiId, 'upiId', 'UPI ID')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 inline-flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'upiId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'upiId' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Admin UPI Number</span>
                  <span className="font-mono font-bold text-gray-950 text-xs sm:text-sm">{cleanUpiPhone || adminUpiPhone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(cleanUpiPhone || adminUpiPhone, 'phone', 'UPI Phone Number')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 inline-flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 Form */}
          <div className="pt-2">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-3.5">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs sm:text-sm font-black text-gray-900">
                Step 2: Enter Payment Details After Transfer
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Customer UPI Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={upiDetails.payerName}
                    onChange={(e) => setUpiDetails((prev) => ({ ...prev, payerName: e.target.value }))}
                    placeholder="Surya Kumar"
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border-2 border-gray-300 focus:border-purple-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Customer UPI / Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={upiDetails.payerPhone}
                    onChange={(e) => setUpiDetails((prev) => ({ ...prev, payerPhone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border-2 border-gray-300 focus:border-purple-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  UPI Transaction ID / 12-digit UTR <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={upiDetails.transactionRef}
                    onChange={(e) => setUpiDetails((prev) => ({ ...prev, transactionRef: e.target.value }))}
                    placeholder="e.g. 428938291048"
                    maxLength={30}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-mono border-2 border-gray-300 focus:border-purple-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Payment Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={upiDetails.paymentDateTime}
                  onChange={(e) => setUpiDetails((prev) => ({ ...prev, paymentDateTime: e.target.value }))}
                  className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-gray-300 focus:border-purple-500 rounded-xl outline-none"
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-500 leading-tight">
              ⚡ Admin will verify this UTR reference against bank statements before dispatching your package.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 sm:gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-2.5 sm:py-3.5 px-3 sm:px-6 rounded-full font-semibold border border-gray-300 hover:bg-gray-50 text-gray-800 transition-colors text-xs sm:text-sm text-center"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="flex-[2] py-2.5 sm:py-3.5 px-3 sm:px-6 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 text-xs sm:text-sm text-center disabled:opacity-50"
        >
          {isSubmitting
            ? 'Processing Order...'
            : paymentMethod === 'COD'
            ? 'Place Order (COD)'
            : 'Submit Payment & Place Order'}
        </button>
      </div>
    </motion.div>
  );
}
