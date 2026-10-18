'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const payment = searchParams.get('payment');
  const isUpi = payment === 'UPI';

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gray-50/70">
      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center border border-gray-200 shadow-xs"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 bg-emerald-100 rounded-full mb-3 sm:mb-5"
          >
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </motion.div>

          <h1 className="text-xl sm:text-3xl font-black mb-2 text-gray-950">Order Placed Successfully!</h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            Thank you for shopping with FunPrint. Your order is recorded in our system.
          </p>

          <div className="bg-stone-50 border border-gray-200 rounded-2xl p-3.5 sm:p-5 mb-4 sm:mb-6">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Order ID</p>
            <p className="text-lg sm:text-2xl font-mono font-black text-gray-950 break-all">{orderId || 'FP-SUCCESS'}</p>
          </div>

          {isUpi && (
            <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 sm:mb-6 text-left">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">UPI Verification in Progress</h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                    Your submitted UTR reference has been queued for verification with accounts. Once confirmed by admin, your tracking status will update to Order Confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 sm:mb-6 text-left">
            <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">Track Order Progress</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Follow live manufacturing & courier shipment updates
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">Need Immediate Help?</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Reach our Chennai team directly on WhatsApp or phone
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
            <Link
              href="/account/orders"
              className="py-2.5 sm:py-3 px-5 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs border border-amber-400/60 text-xs sm:text-sm inline-flex items-center justify-center gap-1.5"
            >
              <span>View & Track Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="py-2.5 sm:py-3 px-5 rounded-full font-semibold bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs sm:text-sm text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-sm text-gray-500">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
