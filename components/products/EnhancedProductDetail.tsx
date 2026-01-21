'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus, Upload, X, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
}

interface LogoCustomization {
  file: File | null;
  url: string;
  position: { x: number; y: number };
  scale: number;
  isPlain: boolean;
}

export default function EnhancedProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  
  // State for color selection - will be updated by useEffect for URL params
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [selectedView, setSelectedView] = useState<'front' | 'side' | 'back'>('front');
  const [quantity, setQuantity] = useState(1);
  
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
  
  // Logo customization state
  const [logoCustomization, setLogoCustomization] = useState<LogoCustomization>({
    file: null,
    url: '',
    position: { x: 0, y: -20 },
    scale: 1.0,
    isPlain: false
  });
  
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current image based on selected color and view
  const getCurrentImage = () => {
    const colorImages = product.images[selectedColor];
    if (!colorImages) return null;
    
    return colorImages[selectedView] || colorImages.front || null;
  };

  // Check if view is available for current color
  const isViewAvailable = (view: 'front' | 'side' | 'back') => {
    return !!product.images[selectedColor]?.[view];
  };

  // Color mapping for display
  const getColorDisplay = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'White': '#FFFFFF',
      'Black': '#000000',
      'Grey': '#6B7280',
      'Navy Blue': '#1E3A8A',
      'Maroon': '#7F1D1D',
      'Red': '#DC2626',
      'Blue': '#2563EB',
      'Green': '#16A34A'
    };
    return colorMap[color] || '#6B7280';
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoCustomization(prev => ({
        ...prev,
        file,
        url,
        isPlain: false
      }));
      setShowLogoEditor(true);
    }
  };

  // Calculate shipping
  const calculateShipping = (subtotal: number, state: string = "Tamil Nadu") => {
    if (subtotal >= 1000) return 0;
    return state.toLowerCase() === "tamil nadu" ? 60 : 100;
  };

  const subtotal = product.price * quantity;
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  // Handle add to cart
  const handleAddToCart = async () => {
    // Create a unique cart item ID
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}-${Date.now()}`;
    
    const cartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: getCurrentImage() || '/placeholder-image.jpg',
      category: product.category,
      logo: logoCustomization.url || undefined
    };

    // Add to cart store (if available)
    if (typeof window !== 'undefined') {
      try {
        const { useCartStore } = await import('@/store/cartStore');
        const { addItem } = useCartStore.getState();
        addItem(cartItem);
      } catch (error) {
        console.log('Cart store not available, using localStorage');
        // Fallback to localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        existingCart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(existingCart));
      }
    }

    router.push('/cart');
  };

  const currentImage = getCurrentImage();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image with Logo Preview */}
            <div className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden relative">
              {currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={`${product.name} - ${selectedColor} - ${selectedView}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Logo Overlay */}
                  {logoCustomization.url && !logoCustomization.isPlain && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img
                        src={logoCustomization.url}
                        alt="Logo preview"
                        className="max-w-[120px] max-h-[120px]"
                        style={{
                          transform: `
                            scale(${logoCustomization.scale})
                            translate(${logoCustomization.position.x}px, ${logoCustomization.position.y}px)
                          `
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* View Switcher */}
            <div className="flex gap-2 justify-center">
              {(['front', 'side', 'back'] as const).map((view) => {
                const isAvailable = isViewAvailable(view);
                return (
                  <button
                    key={view}
                    onClick={() => isAvailable && setSelectedView(view)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedView === view && isAvailable
                        ? 'bg-purple-600 text-white'
                        : isAvailable
                        ? 'bg-white text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                    {!isAvailable && (
                      <span className="block text-xs">Coming Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-purple-600 font-medium uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}
              <div className="text-3xl font-bold text-purple-600">₹{product.price}</div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedColor === color
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorDisplay(color) }}
                    />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedSize === size
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Customization */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customization</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setLogoCustomization(prev => ({ ...prev, isPlain: true, file: null, url: '' }))}
                  className={`w-full p-4 rounded-lg border-2 transition-colors ${
                    logoCustomization.isPlain
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Plain T-Shirt (No Logo)
                </button>
                
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors ${
                      logoCustomization.file
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      <span>
                        {logoCustomization.file ? 'Change Logo' : 'Upload Your Logo'}
                      </span>
                    </div>
                    {logoCustomization.file && (
                      <p className="text-sm text-gray-600 mt-1">
                        {logoCustomization.file.name}
                      </p>
                    )}
                  </button>
                </div>

                {logoCustomization.file && (
                  <button
                    onClick={() => setShowLogoEditor(true)}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Preview & Adjust Logo
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-sm text-green-600 mb-2">🎉 Free shipping on orders ₹1000+</p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Logo Editor Modal */}
      <AnimatePresence>
        {showLogoEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Logo Preview & Adjustment</h2>
                <button
                  onClick={() => setShowLogoEditor(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview Container */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="relative w-full max-w-md mx-auto">
                      {/* T-shirt Base Image */}
                      {currentImage && (
                        <Image
                          src={currentImage}
                          alt={`${product.name} - ${selectedColor}`}
                          width={400}
                          height={400}
                          className="w-full h-auto block object-contain"
                        />
                      )}
                      
                      {/* Logo Overlay */}
                      {logoCustomization.url && (
                        <img
                          src={logoCustomization.url}
                          alt="Logo preview"
                          className="absolute top-1/2 left-1/2 max-w-[120px] max-h-[120px] pointer-events-none"
                          style={{
                            transform: `
                              translate(-50%, -50%)
                              scale(${logoCustomization.scale})
                              translate(${logoCustomization.position.x}px, ${logoCustomization.position.y}px)
                            `
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Size</label>
                    <input
                      type="range"
                      min="0.4"
                      max="2.0"
                      step="0.05"
                      value={logoCustomization.scale}
                      onChange={(e) => setLogoCustomization(prev => ({
                        ...prev,
                        scale: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Horizontal Position</label>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      step="2"
                      value={logoCustomization.position.x}
                      onChange={(e) => setLogoCustomization(prev => ({
                        ...prev,
                        position: { ...prev.position, x: parseFloat(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vertical Position</label>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      step="2"
                      value={logoCustomization.position.y}
                      onChange={(e) => setLogoCustomization(prev => ({
                        ...prev,
                        position: { ...prev.position, y: parseFloat(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={() => setLogoCustomization(prev => ({
                      ...prev,
                      position: { x: 0, y: -20 },
                      scale: 1.0
                    }))}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Position & Size
                  </button>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setShowLogoEditor(false)}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      Apply Logo Customization
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}