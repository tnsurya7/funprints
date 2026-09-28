'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-5 sm:p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6"
          >
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Order Placed Successfully!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Thank you for your order. We&apos;ll send you a confirmation shortly.
          </p>

          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Order ID</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 break-all">{orderId}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <Package className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Track Your Order</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                We&apos;ll send you tracking details via email and WhatsApp
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-900">Need Help?</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Contact us on WhatsApp for any queries
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/products" className="btn-primary w-full sm:w-auto">
              Continue Shopping
            </Link>
            <Link href="/" className="btn-secondary w-full sm:w-auto">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
