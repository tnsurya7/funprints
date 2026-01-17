'use client';

import { useCartStore } from '@/store/cartStore';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoUpload from '@/components/cart/LogoUpload';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, addItem } = useCartStore();
  const router = useRouter();

  const handleLogoUpdate = (itemId: string, logoUrl: string) => {
    const item = items.find(i => `${i.id}-${i.size}-${i.color}` === itemId);
    if (item) {
      addItem({ ...item, logo: logoUrl });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="card p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.color} • {item.size}
                    </p>
                    <p className="text-xl font-bold text-brand-600">₹{item.price}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded border hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logo Upload Section */}
                <LogoUpload
                  onLogoSelect={(logoUrl) => handleLogoUpdate(`${item.id}-${item.size}-${item.color}`, logoUrl)}
                  currentLogo={item.logo}
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-brand-600">₹{getTotalPrice()}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full btn-primary"
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
