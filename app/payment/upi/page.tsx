/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

function UPIPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || '';
  const amount = searchParams.get('amount') || '499';

  const [upiId, setUpiId] = useState(process.env.NEXT_PUBLIC_UPI_ID || '');
  const [upiName, setUpiName] = useState(process.env.NEXT_PUBLIC_UPI_NAME || 'FunPrint');
  const [phoneNumber, setPhoneNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          if (data.settings.upiId) setUpiId(data.settings.upiId);
          if (data.settings.upiName) setUpiName(data.settings.upiName);
          if (data.settings.whatsappNumber) setPhoneNumber(data.settings.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Deep link string
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`FunPrint Order ${orderId}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field}!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim() || !payerName.trim() || !payerPhone.trim()) {
      toast.error('Please enter your Name, Mobile / UPI ID, and 12-digit UTR.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          transactionRef: transactionRef.trim(),
          payerName: payerName.trim(),
          payerPhone: payerPhone.trim(),
          upiId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit payment details.');
      } else {
        setSubmitted(true);
        toast.success('Payment submitted for verification!');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pt-24 sm:pt-28 pb-16 font-serif">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-md"
        >
          {/* Header */}
          <div className="text-center pb-6 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-950 text-xs font-bold rounded-full mb-3 border border-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Direct Bank UPI Payment</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              Complete Your Payment
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Order ID: <span className="font-bold text-gray-950">{orderId || 'Generated Order'}</span>
            </p>
            <div className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-950">
              ₹{amount}
            </div>
          </div>

          {!submitted ? (
            <div className="mt-6 space-y-6">
              {/* QR Code and Quick Pay Box */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="p-2.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex-shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-40 h-40 object-contain rounded-xl"
                  />
                  <p className="text-[10px] text-center text-gray-500 mt-1 font-sans">Scan with GPay / PhonePe / Paytm</p>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">UPI ID</span>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-950">
                      <span className="truncate mr-2 font-mono">{upiId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(upiId, 'UPI ID')}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedField === 'UPI ID' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">Business / Merchant Name</span>
                    <p className="text-sm font-bold text-gray-950">{upiName}</p>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">Support Phone</span>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-800">
                      <span>{phoneNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(phoneNumber, 'Phone Number')}
                        className="text-amber-800 font-bold hover:underline text-xs flex items-center gap-1"
                      >
                        {copiedField === 'Phone Number' ? 'Copied!' : 'Copy Phone'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Verification Form */}
              <div className="pt-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-950 mb-1">
                  Step 2: Enter Transaction Details
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  After paying via your UPI app, please enter the UTR / Transaction Reference number below. Our team verifies this with our bank account.
                </p>

                <form onSubmit={handlePaymentSubmission} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      12-Digit UTR / Transaction Reference ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 423456789012"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Payer UPI Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="Surya Kumar"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Payer Mobile / UPI ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="e.g. 9876543210 or surya@upi"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#FFC006] hover:bg-amber-400 text-gray-950 font-black rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {submitting ? 'Submitting Reference...' : 'Submit Payment Reference for Verification'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* SUBMITTED CONFIRMATION */
            <div className="mt-8 text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800 border-2 border-amber-300">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                Submitted for Verification!
              </h2>

              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you! Your payment details (UTR: <strong className="text-gray-950">{transactionRef}</strong>) have been submitted to our accounts department. We are verifying the bank deposit.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 text-xs text-left max-w-md mx-auto space-y-1.5">
                <p><strong>Order ID:</strong> {orderId}</p>
                <p><strong>Amount:</strong> ₹{amount}</p>
                <p><strong>Status:</strong> <span className="text-amber-800 font-bold">SUBMITTED_FOR_VERIFICATION</span></p>
                <p className="text-gray-500 pt-1">You will receive an email confirmation once verified by accounts.</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => router.push(`/order-success?orderId=${orderId}`)}
                  className="px-6 py-2.5 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors"
                >
                  View Order Summary
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/account/orders')}
                  className="px-6 py-2.5 bg-[#FFC006] text-gray-950 rounded-full font-black text-xs hover:bg-amber-400 transition-colors"
                >
                  Track in Customer Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function UPIPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading UPI Checkout...</div>}>
      <UPIPaymentContent />
    </Suspense>
  );
}
