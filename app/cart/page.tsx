'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateShipping } from '@/lib/enhanced-products';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const router = useRouter();
  const [selectedState, setSelectedState] = useState('Tamil Nadu');

  // Calculate totals without GST - only product price and shipping
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = calculateShipping(subtotal, selectedState);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-xs mt-8">
          <h1 className="text-3xl font-extrabold mb-3 text-gray-950">Your Shopping Cart is Empty</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Discover our collection of custom premium t-shirts and hoodies to get started.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold rounded-full shadow-xs hover:shadow transition-all border border-amber-400/60"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-xs text-gray-500 hover:text-red-600 font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="bg-white rounded-2xl shadow-xs p-4 sm:p-5 border border-gray-200"
              >
                <div className="flex gap-4 sm:gap-6 items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex-shrink-0 relative overflow-hidden border border-gray-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-gray-950 truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">{item.color}</span> • Size: <span className="font-semibold">{item.size}</span>
                    </p>
                    <p className="text-base font-extrabold text-gray-950">₹{item.price}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between h-20 sm:h-24 py-1">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Curvly stepper */}
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2 py-1 bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-950">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-950 px-5 py-2.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xs p-6 sticky top-24 border border-gray-200">
              <h2 className="text-lg font-extrabold mb-5 text-gray-950">Order Summary</h2>
              
              {/* State Selection */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700">
                  Delivery Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-950 bg-white text-gray-800 text-sm font-medium outline-none"
                >
                  <option value="Tamil Nadu">Tamil Nadu (₹60 or Free over ₹1000)</option>
                  <option value="Other">Outside Tamil Nadu (₹100 or Free over ₹1000)</option>
                </select>
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} {items.length > 1 ? 'items' : 'item'})</span>
                  <span className="font-semibold text-gray-950">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-950'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-emerald-700 font-semibold">🎉 Free shipping unlocked!</p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-gray-950 text-base">Total</span>
                  <span className="font-black text-2xl text-gray-950">₹{total}</span>
                </div>
              </div>

              {/* Curvly Checkout Button */}
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 rounded-full font-bold text-base shadow-xs hover:shadow transition-all border border-amber-400/60"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}