'use client';

import { CartItem } from '@/store/cartStore';
import { calculatePrice } from '@/lib/supabase-db';
import Image from 'next/image';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  // Calculate breakdown using single source of truth
  let subtotal = 0;
  let totalGst = 0;

  items.forEach(item => {
    const itemCalc = calculatePrice(item.price, 18, item.quantity);
    subtotal += itemCalc.basePrice;
    totalGst += itemCalc.gstAmount;
  });

  const finalTotal = subtotal + totalGst;

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const itemCalc = calculatePrice(item.price, 18, item.quantity);
          return (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500">
                  {item.color} • {item.size} • Qty: {item.quantity}
                </p>
                {item.logo && (
                  <p className="text-xs text-purple-600 font-semibold">✓ With Logo</p>
                )}
                <p className="text-sm font-semibold mt-1">₹{itemCalc.totalAmount}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-green-600">FREE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (GST 18%)</span>
          <span className="font-medium">₹{totalGst}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-xl text-brand-600">₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );
}
