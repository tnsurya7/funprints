'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Ruler, Sparkles } from 'lucide-react';
import Simple3DViewer from './Simple3DViewer';
import ThreeDTshirtViewer from './ThreeDTshirtViewer';
import SizeGuide from './SizeGuide';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string;
  colors: Array<{
    name: string;
    stock: number;
    image_url: string;
  }>;
  sizes: string[];
}

// Color mapping for 3D viewer
const colorMap: Record<string, string> = {
  White: '#ffffff',
  Black: '#000000',
  'Navy Blue': '#1e3a8a',
  Grey: '#6b7280',
  Red: '#b91c1c',
  Maroon: '#7f1d1d',
};

export default function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setSelectedColor(data.product.colors[0]?.name || '');
        setSelectedSize(data.product.sizes[2] || data.product.sizes[0] || '');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedColorData = product.colors.find(c => c.name === selectedColor);
  const currentImage = selectedColorData?.image_url || product.colors[0]?.image_url || '';
  const stockStatus = selectedColorData?.stock || 0;

  const handleAddToCart = () => {
    if (stockStatus === 0) {
      toast.error('This color is out of stock');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: currentImage,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (stockStatus === 0) {
      toast.error('This color is out of stock');
      return;
    }
    
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-400">No image available</div>
                </div>
              )}
            </div>
            
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
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-brand-600">₹{product.base_price}</p>
              <p className="text-sm text-gray-500 mt-2">+ 18% GST</p>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Stock Status */}
            <div className="p-3 rounded-lg bg-gray-50">
              <p className={`text-sm font-semibold ${
                stockStatus === 0 ? 'text-red-600' : 
                stockStatus <= 5 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {stockStatus === 0 ? 'Out of Stock' : 
                 stockStatus <= 5 ? `Only ${stockStatus} left` : 'In Stock'}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Color</label>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    disabled={color.stock === 0}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${color.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {color.name}
                    {color.stock === 0 && <span className="text-xs text-red-500 ml-1">(Out)</span>}
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
                {product.sizes.map((size) => (
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
                  onClick={() => setQuantity(Math.min(stockStatus, quantity + 1))}
                  disabled={quantity >= stockStatus}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-brand-600 transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart} 
                disabled={stockStatus === 0}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow} 
                disabled={stockStatus === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Premium quality fabric
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Comfortable fit
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Durable print quality
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                  Machine washable
                </li>
              </ul>
            </div>

            {/* Specifications */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST</p>
                  <p className="font-medium">18%</p>
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
