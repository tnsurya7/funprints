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
      className="card p-8"
    >
      <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => setPaymentMethod('COD')}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            paymentMethod === 'COD'
              ? 'border-brand-600 bg-brand-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg">
              <Banknote className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Cash on Delivery</h3>
              <p className="text-sm text-gray-600">Pay when you receive your order</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setPaymentMethod('UPI')}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            paymentMethod === 'UPI'
              ? 'border-brand-600 bg-brand-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg">
              <Smartphone className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">UPI Payment</h3>
              <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
            </div>
          </div>
        </button>
      </div>

      {paymentMethod === 'UPI' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            You'll be redirected to your UPI app. After payment, upload the screenshot for verification.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          Back
        </button>
        <button onClick={onPlaceOrder} className="btn-primary flex-1">
          {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
        </button>
      </div>
    </motion.div>
  );
}
