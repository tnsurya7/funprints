'use client';

import { CartItem } from '@/store/cartStore';
import { calculateShipping } from '@/lib/enhanced-products';
import Image from 'next/image';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  shippingState?: string;
}

export default function OrderSummary({ items, total, shippingState = "Tamil Nadu" }: OrderSummaryProps) {
  // Calculate breakdown without GST - only product price and shipping
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = calculateShipping(subtotal, shippingState);
  const finalTotal = subtotal + shipping;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 sticky top-24 border border-gray-200 shadow-xs">
      <h2 className="text-base sm:text-lg font-extrabold mb-3.5 sm:mb-5 text-gray-950">Order Summary</h2>

      <div className="space-y-3 sm:space-y-3.5 mb-4 sm:mb-6">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl sm:rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-200">
              <Image
                src={
                  (item.image || '')
                    .replace(/\/b\.jpg$/i, '/f.jpg')
                    .replace(/\/s\.jpg$/i, '/f.jpg')
                    .replace(/\/side\.jpg$/i, '/f.jpg')
                    .replace(/\/back\.jpg$/i, '/front.jpg') || '/placeholder-image.jpg'
                }
                alt={item.name}
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{item.name}</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">
                {item.color} • {item.size} • Qty: {item.quantity}
              </p>
              <p className="text-xs font-extrabold text-gray-950 mt-0.5">₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-950">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-950'}`}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        {shipping === 0 && (
          <p className="text-[11px] text-emerald-700 font-semibold">🎉 Free shipping unlocked on this order!</p>
        )}
        <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
          <span className="font-bold text-gray-950 text-sm">Total</span>
          <span className="font-black text-xl text-gray-950">₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );
}
