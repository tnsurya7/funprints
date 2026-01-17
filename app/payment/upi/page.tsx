'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function UPIPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get('amount') || '0';

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'YOUR_UPI_ID';
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Your Business Name';
  const note = 'Fun Prints Order';

  useEffect(() => {
    // Generate UPI deep links
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // Try to open UPI app
    const openUPIApp = () => {
      // Google Pay
      const gpayLink = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
      
      // PhonePe
      const phonepeLink = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
      
      // Paytm
      const paytmLink = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

      // Try opening apps in sequence
      window.location.href = gpayLink;
      
      setTimeout(() => {
        window.location.href = phonepeLink;
      }, 1000);

      setTimeout(() => {
        window.location.href = paytmLink;
      }, 2000);

      // Fallback to generic UPI
      setTimeout(() => {
        window.location.href = upiString;
      }, 3000);
    };

    openUPIApp();
  }, [amount, upiId, upiName, note]);

  const handleSubmit = async () => {
    // Generate order ID
    const orderId = `FP${Date.now()}`;
    
    // Get customer info from localStorage (set during checkout)
    const customerInfo = localStorage.getItem('checkoutInfo');
    const customer = customerInfo ? JSON.parse(customerInfo) : { name: 'Customer', mobile: '' };

    // WhatsApp deep link
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'YOUR_WHATSAPP_NUMBER';
    const message = `Hello Fun Prints,

I have completed the payment.

Order ID: ${orderId}
Amount: ₹${amount}
Name: ${customer.name}
Mobile: ${customer.mobile}

Please find the payment screenshot attached.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Save order to backend
    try {
      const cartItems = localStorage.getItem('cart-storage');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: cartItems ? JSON.parse(cartItems).state.items : [],
          customer,
          paymentMethod: 'UPI',
          total: amount,
          status: 'PAYMENT_PENDING',
        }),
      });

      if (response.ok) {
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        toast.success('Opening WhatsApp to send screenshot...');
        
        // Redirect to success page
        setTimeout(() => {
          router.push(`/order-success?orderId=${orderId}`);
        }, 2000);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <h1 className="text-3xl font-bold mb-6">UPI Payment</h1>

          <div className="mb-8 p-6 bg-brand-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-brand-600">₹{amount}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold">Open your UPI app</h2>
            </div>
            <p className="text-gray-600 ml-10">
              Your UPI app should open automatically. Complete the payment of ₹{amount} to {upiId}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold">Send screenshot via WhatsApp</h2>
            </div>
            <p className="text-gray-600 ml-10">
              Click the button below to open WhatsApp and send your payment screenshot directly to us
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Screenshot via WhatsApp
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>How it works:</strong> We'll open WhatsApp with a pre-filled message. 
              Simply attach your payment screenshot and send it to us. We'll verify and confirm your order within 24 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function UPIPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UPIPaymentContent />
    </Suspense>
  );
}
