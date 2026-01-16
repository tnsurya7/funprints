'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Ruler, Sparkles } from 'lucide-react';
import Simple3DViewer from './Simple3DViewer';
import ThreeDTshirtViewer from './ThreeDTshirtViewer';
import SizeGuide from './SizeGuide';
import { useCartStore } from '@/store/cartStore';
import { products } from '@/lib/products-data';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Color mapping for 3D viewer
const colorMap: Record<string, string> = {
  White: '#ffffff',
  Black: '#000000',
  Navy: '#1e3a8a',
  Grey: '#6b7280',
  Red: '#b91c1c',
  Maroon: '#7f1d1d',
};

// Get product by color
const getProductByColor = (baseProductId: string, color: string) => {
  const baseProduct = products.find(p => p.id === baseProductId);
  if (!baseProduct) return null;
  
  const category = baseProduct.category.toLowerCase().replace(' ', '-');
  const colorLower = color.toLowerCase().replace(' ', '');
  const targetId = `${category}-${colorLower}`;
  
  return products.find(p => p.id === targetId) || baseProduct;
};

export default function ProductDetail({ productId }: { productId: string }) {
  const initialProduct = products.find(p => p.id === productId);
  const [selectedColor, setSelectedColor] = useState(initialProduct?.colors[0] || 'White');
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(initialProduct?.sizes[2] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (initialProduct) {
      const newProduct = getProductByColor(productId, selectedColor);
      if (newProduct) {
        setCurrentProduct(newProduct);
      }
    }
  }, [selectedColor, productId, initialProduct]);

  if (!currentProduct) {
    return <div className="min-h-screen pt-24 text-center">Product not found</div>;
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    addItem({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.images.front,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 3D Product Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Simple3DViewer
              productId={currentProduct.id}
              frontImage={currentProduct.images.front}
              backImage={currentProduct.images.back}
              sideImage={currentProduct.images.side}
            />
            
            {/* View in 3D Customizer Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShow3D(true)}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Customize in 3D
            </motion.button>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{currentProduct.name}</h1>
              <p className="text-3xl font-bold text-brand-600">₹{currentProduct.price}</p>
            </div>

            <p className="text-gray-600">{currentProduct.description}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Color</label>
              <div className="flex gap-3">
                {initialProduct?.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold">Size</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-brand-600 text-sm flex items-center gap-1 hover:underline"
                >
                  <Ruler className="w-4 h-4" />
                  Size Guide
                </button>
              </div>
              <div className="flex gap-3">
                {currentProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-brand-600 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-brand-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button onClick={handleAddToCart} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-primary flex-1">
                Buy Now
              </button>
              <button className="btn-secondary px-4">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Product Features</h3>
              <ul className="space-y-2">
                {currentProduct.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fabric</p>
                  <p className="font-medium">{currentProduct.fabric}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GSM</p>
                  <p className="font-medium">{currentProduct.gsm}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
      
      {/* 3D Viewer Modal */}
      {show3D && (
        <ThreeDTshirtViewer
          color={colorMap[selectedColor] || '#ffffff'}
          onClose={() => setShow3D(false)}
        />
      )}
    </div>
  );
}
