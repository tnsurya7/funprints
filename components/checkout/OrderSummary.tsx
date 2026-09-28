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
    <div className="card p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
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
              <h3 className="font-medium text-sm text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-500">
                {item.color} • {item.size} • Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-purple-600 mt-1">₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        {shipping === 0 && (
          <p className="text-xs text-green-600 font-medium">🎉 Free shipping on orders ₹1000+</p>
        )}
        <div className="border-t pt-2 flex justify-between items-baseline">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-xl text-purple-600">₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );
}
