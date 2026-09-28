'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Sparkles, Image as ImageIcon, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

import ProductViewerSkeleton from './ProductViewerSkeleton';
import { calculateShipping, calculateTotal } from '@/lib/enhanced-products';

// Dynamic import with SSR false for Three.js viewer
const ThreeDTshirtViewer = dynamic(() => import('./ThreeDTshirtViewer'), {
  ssr: false,
  loading: () => <ProductViewerSkeleton />
});

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  modelPath?: string;
  colors: string[];
  sizes: string[];
  images: {
    [color: string]: {
      front?: string;
      back?: string;
      side?: string;
    };
  };
}

export default function EnhancedProductDetail({ product }: { product: Product }) {
  const router = useRouter();

  // State for color selection - default to first color
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'White');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [selectedPhotoView, setSelectedPhotoView] = useState<'front' | 'side' | 'back'>('front');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Handle URL parameters for color pre-selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const preSelectedColor = searchParams.get('color');

      if (preSelectedColor && product.colors.includes(preSelectedColor)) {
        setSelectedColor(preSelectedColor);
      }
    }
  }, [product.colors]);

  // Get current image for photo mode based on selected color and view
  const getCurrentImage = () => {
    const colorImages = product.images[selectedColor];
    if (!colorImages) return null;
    return colorImages[selectedPhotoView] || colorImages.front || null;
  };

  const isViewAvailable = (view: 'front' | 'side' | 'back') => {
    return !!product.images[selectedColor]?.[view];
  };

  // Color mapping for swatch display
  const getColorDisplay = (color: string) => {
    const colorMap: { [key: string]: string } = {
      White: '#FFFFFF',
      Black: '#171717',
      Grey: '#6B7280',
      'Navy Blue': '#1E3A8A',
      Maroon: '#7F1D1D',
      Red: '#DC2626',
      Blue: '#2563EB',
      Green: '#16A34A',
      Yellow: '#EAB308',
      Orange: '#EA580C'
    };
    return colorMap[color] || '#6B7280';
  };

  const subtotal = product.price * quantity;
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, shipping);
  const currentImage = getCurrentImage();
  const colorImages = product.images[selectedColor];

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

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: Product Visualizer Area (3D 360° Viewer + Photo Toggle) */}
          <div className="space-y-4 sticky top-24">
            {/* View Mode Toggle (3D 360° vs Photos) */}
            <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    viewMode === '3d'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  3D 360° View
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('photo')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    viewMode === 'photo'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Photos
                </button>
              </div>

              <span className="text-xs text-purple-600 font-semibold px-3 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live 3D Preview
              </span>
            </div>

            {/* Main Visualizer Container */}
            {viewMode === '3d' ? (
              <ThreeDTshirtViewer
                color={selectedColor}
                modelPath={product.modelPath}
                productName={product.name}
                images={colorImages}
                fallbackImageUrl={colorImages?.front}
              />
            ) : (
              <div className="space-y-4">
                <div className="aspect-square bg-white rounded-3xl shadow-sm overflow-hidden relative border border-gray-100 flex items-center justify-center">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={`${product.name} - ${selectedColor} - ${selectedPhotoView}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-6"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>

                {/* Photo Angle Switcher */}
                <div className="flex gap-2 justify-center">
                  {(['front', 'side', 'back'] as const).map((view) => {
                    const isAvailable = isViewAvailable(view);
                    return (
                      <button
                        key={view}
                        onClick={() => isAvailable && setSelectedPhotoView(view)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                          selectedPhotoView === view && isAvailable
                            ? 'bg-purple-600 text-white shadow-md'
                            : isAvailable
                            ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                        {!isAvailable && <span className="block text-[10px] opacity-75">Coming Soon</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          {/* RIGHT: Product Details & Purchase Form */}
          <div className="space-y-5 sm:space-y-6 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs sm:text-sm text-purple-600 font-semibold uppercase tracking-wide mb-1.5 sm:mb-2">
                {product.category}
              </p>
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex-shrink-0 ${
                    isWishlisted
                      ? 'bg-pink-50 border-pink-200 text-pink-600'
                      : 'border-gray-200 text-gray-500 hover:text-pink-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.description && (
                <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed">{product.description}</p>
              )}

              <div className="mt-3 sm:mt-4 flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{product.price}
                </span>
                <span className="text-xs text-gray-400 font-medium">+ Free Shipping on ₹1000+</span>
              </div>
            </div>

            {/* Color Selection - Updates 3D viewer instantly */}
            <div className="border-t pt-4 sm:pt-5">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Select Color: <span className="text-purple-600 font-semibold">{selectedColor}</span>
                </h3>
                <span className="text-[11px] sm:text-xs text-gray-500">Instant 3D sync</span>
              </div>

              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 transition-all ${
                      selectedColor === color
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm scale-105'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div
                      className="w-4 sm:w-5 h-4 sm:h-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: getColorDisplay(color) }}
                    />
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="border-t pt-4 sm:pt-5">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Select Size: <span className="text-purple-600 font-semibold">{selectedSize}</span>
                </h3>
              </div>

              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[42px] sm:min-w-[48px] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all ${
                      selectedSize === size
                        ? 'border-purple-600 bg-purple-50 text-purple-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="border-t pt-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold min-w-[2.5rem] text-center text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price & Shipping Summary */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 font-medium">🎉 Free shipping unlocked on this order!</p>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-purple-600">₹{total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
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