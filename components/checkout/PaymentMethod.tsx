'use client';

import { motion } from 'framer-motion';
import { Banknote, Smartphone } from 'lucide-react';

interface PaymentMethodProps {
  paymentMethod: 'COD' | 'UPI';
  setPaymentMethod: (method: 'COD' | 'UPI') => void;
  onPlaceOrder: () => void;
  onBack: () => void;
}

export default function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
  onPlaceOrder,
  onBack,
}: PaymentMethodProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs"
    >
      <h2 className="text-2xl font-black mb-6 text-gray-950">Payment Method</h2>

      <div className="space-y-4 mb-8">
        <button
          type="button"
          onClick={() => setPaymentMethod('COD')}
          className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'COD'
              ? 'border-gray-950 bg-gray-50 shadow-xs'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full border border-gray-200">
              <Banknote className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-950">Cash on Delivery (COD)</h3>
              <p className="text-xs text-gray-600">Pay cash or UPI upon package handover</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('UPI')}
          className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'UPI'
              ? 'border-gray-950 bg-gray-50 shadow-xs'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full border border-gray-200">
              <Smartphone className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-950">Instant UPI Payment</h3>
              <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm, or BHIM</p>
            </div>
          </div>
        </button>
      </div>

      {paymentMethod === 'UPI' && (
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
          <p className="text-xs text-amber-900 font-medium">
            You will be redirected to the secure UPI gateway. After completion, your order confirmation will appear immediately.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 px-6 rounded-full font-semibold border border-gray-300 hover:bg-gray-50 text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          className="flex-1 py-3.5 px-6 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60"
        >
          {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
        </button>
      </div>
    </motion.div>
  );
}
