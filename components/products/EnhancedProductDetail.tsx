'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { calculateShipping, calculateTotal } from '@/lib/enhanced-products';
import { getColorDisplay } from '@/lib/colors';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colors: string[];
  sizes: string[];
  images: {
    [color: string]: {
      front?: string;
      back?: string;
      side?: string;
    };
  };
  features?: string[];
  fabric?: string;
  gsm?: number;
  inStock?: boolean;
}

export default function EnhancedProductDetail({ product }: { product: Product }) {
  const router = useRouter();

  // State for color selection - default to first color
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Black');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedPhotoView, setSelectedPhotoView] = useState<'front' | 'side' | 'back'>('front');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Handle URL parameters for color pre-selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const preSelectedColor = searchParams.get('color');

      if (preSelectedColor) {
        // Case-insensitive match against product colors
        const match = product.colors.find(c => c.toLowerCase() === preSelectedColor.toLowerCase());
        if (match) {
          setSelectedColor(match);
        }
      }
    }
  }, [product.colors]);

  const colorImages = product.images[selectedColor] || {};

  // Get current image based on selected color and view
  const getCurrentImage = () => {
    return colorImages[selectedPhotoView] || colorImages.front || colorImages.side || colorImages.back || null;
  };

  const isViewAvailable = (view: 'front' | 'side' | 'back') => {
    return !!colorImages[view];
  };

  const subtotal = product.price * quantity;
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, shipping);
  const currentImage = getCurrentImage();

  // Handle add to cart
  const handleAddToCart = async () => {
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`;

    const cartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: currentImage || colorImages?.front || '/placeholder-image.jpg',
      category: product.category,
    };

    if (typeof window !== 'undefined') {
      try {
        const { useCartStore } = await import('@/store/cartStore');
        const { addItem } = useCartStore.getState();
        addItem(cartItem);
        toast.success('Added to cart!');
      } catch (error) {
        console.error('Cart store error, fallback to localStorage', error);
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        existingCart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(existingCart));
        toast.success('Added to cart!');
      }
    }

    router.push('/cart');
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const views: Array<{ key: 'front' | 'side' | 'back'; label: string }> = [
    { key: 'front', label: 'Front' },
    { key: 'side', label: 'Side' },
    { key: 'back', label: 'Back' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Curvly Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-5 py-2.5 bg-white rounded-full shadow-xs hover:shadow-sm transition-all text-gray-700 hover:text-gray-950 font-semibold text-sm border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Product Photo Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            {/* Main Image Display */}
            <div className="relative aspect-square w-full bg-white rounded-3xl shadow-xs overflow-hidden border border-gray-200 flex items-center justify-center group">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={`${product.name} - ${selectedColor} - ${selectedPhotoView}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-6 sm:p-10 transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <p className="text-sm font-medium">Image not available</p>
                </div>
              )}

              {/* Angle View Pill */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-xs border border-gray-200 uppercase tracking-wider">
                {selectedPhotoView} view • <span className="text-gray-950">{selectedColor}</span>
              </div>
            </div>

            {/* Angle Selector Thumbnails (Curvy Pill-Style Buttons) */}
            <div className="grid grid-cols-3 gap-3">
              {views.map(({ key, label }) => {
                const isAvailable = isViewAvailable(key);
                const thumbImg = colorImages[key];
                const isSelected = selectedPhotoView === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => isAvailable && setSelectedPhotoView(key)}
                    disabled={!isAvailable}
                    className={`relative p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                      isSelected && isAvailable
                        ? 'border-gray-900 bg-gray-50 shadow-xs ring-1 ring-gray-900'
                        : isAvailable
                        ? 'border-gray-200 hover:border-gray-400 bg-white'
                        : 'border-gray-200 bg-gray-100 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                      {thumbImg ? (
                        <Image
                          src={thumbImg}
                          alt={`${product.name} ${label}`}
                          fill
                          sizes="120px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-gray-950' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quality & Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200 text-gray-700 text-xs shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Bio-Washed Fabric</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200 text-gray-700 text-xs shadow-xs">
                <Truck className="w-4 h-4 text-gray-800 flex-shrink-0" />
                <span className="font-semibold">Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200 text-gray-700 text-xs shadow-xs">
                <RotateCcw className="w-4 h-4 text-gray-800 flex-shrink-0" />
                <span className="font-semibold">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Controls */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-200">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider mb-3 border border-gray-200">
                {product.category}
              </span>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 leading-tight">
                  {product.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center flex-shrink-0 ${
                    isWishlisted
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.description && (
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-950">
                  ₹{product.price}
                </span>
                <span className="text-xs text-gray-500 font-medium">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Color Selection Swatches (Curvy Pills) */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Color: <span className="text-gray-950 font-extrabold">{selectedColor}</span>
                </h3>
                <span className="text-xs text-gray-500">
                  {product.colors.length} available
                </span>
              </div>

              <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto p-1 scrollbar-none">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all text-xs font-semibold ${
                        isSelected
                          ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                          : 'border-gray-200 hover:border-gray-400 bg-white text-gray-700'
                      }`}
                      title={color}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs flex-shrink-0"
                        style={{ backgroundColor: getColorDisplay(color) }}
                      />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection (Curvy Pills) */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Size: <span className="text-gray-950 font-extrabold">{selectedSize}</span>
                </h3>
              </div>

              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] px-4 py-2 rounded-full border font-bold text-xs sm:text-sm transition-all ${
                        isSelected
                          ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper (Curvy Buttons) */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold min-w-[2rem] text-center text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fabric & Spec Highlights */}
            {(product.fabric || product.gsm || product.features) && (
              <div className="border-t border-gray-100 pt-5 space-y-2 text-xs text-gray-600">
                {product.fabric && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Fabric Composition:</span>
                    <span className="font-medium text-gray-900">{product.fabric}</span>
                  </div>
                )}
                {product.gsm && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">GSM Weight:</span>
                    <span className="font-medium text-gray-900">{product.gsm} GSM</span>
                  </div>
                )}
                {product.features && product.features.length > 0 && (
                  <div className="pt-1">
                    <span className="font-semibold text-gray-700 block mb-1.5">Highlights:</span>
                    <ul className="space-y-1">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Price & Shipping Summary */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-[11px] text-emerald-700 font-semibold">🎉 Free shipping unlocked on this order!</p>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-gray-900 text-sm">Total</span>
                <span className="text-xl font-black text-gray-950">₹{total}</span>
              </div>
            </div>

            {/* Curvly Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all text-sm sm:text-base border border-amber-400/60"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-full font-bold bg-gray-900 hover:bg-black text-white transition-colors text-sm sm:text-base shadow-xs"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}