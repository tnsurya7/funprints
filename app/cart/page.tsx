'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
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
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center py-10 sm:py-16 px-4 sm:px-8 bg-white rounded-3xl border border-gray-200 shadow-xs mt-4 sm:mt-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-amber-200/80">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black mb-2 text-gray-950">
              Your Shopping Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6 max-w-sm mx-auto leading-relaxed">
              Discover our collection of custom premium t-shirts and hoodies to get started.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 text-xs sm:text-sm font-black rounded-full shadow-xs hover:shadow transition-all border border-amber-400/60"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-36 sm:pb-20 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Continue Shopping Button */}
        <div className="mb-3 sm:mb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-950 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Page Title & Clear Cart */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-[11px] sm:text-xs text-gray-500 hover:text-red-600 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-xs p-3.5 sm:p-5 border border-gray-200/90 hover:border-gray-300 transition-all"
              >
                <div className="flex gap-3 sm:gap-5 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-xl sm:rounded-2xl shrink-0 relative overflow-hidden border border-gray-100">
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
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-contain p-1.5 sm:p-2"
                    />
                  </div>
                  
                  {/* Content details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      {/* Title & Delete button */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-gray-950 leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1 -mr-1 -mt-1 transition-colors shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">{item.color}</span>
                        <span className="text-gray-300">•</span>
                        <span>Size:</span>
                        <span className="font-mono font-black text-gray-950 bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.2 rounded text-[10px] sm:text-[11px]">
                          {item.size}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Price & Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                      <div>
                        <span className="text-sm sm:text-base font-black text-gray-950">
                          ₹{item.price}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1.5">
                            (Total: ₹{item.price * item.quantity})
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 border border-gray-200 rounded-full px-2 py-0.5 sm:py-1 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 sm:w-6 text-center text-xs font-black text-gray-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs p-4 sm:p-6 sticky top-24 border border-gray-200">
              <h2 className="text-base sm:text-lg font-black mb-3 sm:mb-4 text-gray-950">Order Summary</h2>
              
              {/* State Selection */}
              <div className="mb-4 sm:mb-5">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-700">
                  Delivery Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#FFC006] bg-white text-gray-800 text-xs sm:text-sm font-medium outline-none transition-all"
                >
                  <option value="Tamil Nadu">Tamil Nadu (₹60 or Free over ₹1000)</option>
                  <option value="Other">Outside Tamil Nadu (₹100 or Free over ₹1000)</option>
                </select>
              </div>
              
              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} {items.length > 1 ? 'items' : 'item'})</span>
                  <span className="font-bold text-gray-950">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-950'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-[11px] sm:text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center">
                    🎉 Free shipping unlocked!
                  </p>
                )}
                <div className="border-t border-gray-200 pt-2.5 sm:pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-gray-950 text-sm sm:text-base">Total</span>
                  <span className="font-black text-xl sm:text-2xl text-gray-950">₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-3 sm:py-3.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 rounded-full font-black text-xs sm:text-sm shadow-xs hover:shadow transition-all border border-amber-400/60 flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}