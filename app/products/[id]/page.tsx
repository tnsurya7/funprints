'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  image_url: string;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  variants: ProductVariant[];
  enabled: boolean;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        // Set default selections
        if (data.product.variants.length > 0) {
          const firstVariant = data.product.variants[0];
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableColors = () => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map(v => v.color)));
  };

  const getAvailableSizes = () => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter(v => v.color === selectedColor && v.is_available)
      .map(v => v.size);
  };

  const getSelectedVariant = () => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
  };

  const getMaxQuantity = () => {
    const variant = getSelectedVariant();
    return variant ? Math.min(variant.stock, 10) : 0;
  };

  const handleAddToCart = () => {
    const variant = getSelectedVariant();
    if (!product || !variant) return;

    addItem({
      id: variant.id,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: product.base_price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: variant.image_url,
      category: product.category
    });

    // Show success message or redirect
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
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
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">Product not found</p>
            <button 
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedVariant = getSelectedVariant();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();
  const maxQuantity = getMaxQuantity();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              {selectedVariant?.image_url ? (
                <img 
                  src={selectedVariant.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="w-32 h-32 text-purple-400" />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-6">
              <p className="text-sm text-purple-600 font-medium mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
              <div className="text-3xl font-bold text-purple-600">₹{product.base_price}</div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(''); // Reset size when color changes
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedColor === color
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            {selectedColor && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="flex gap-3">
                  {availableSizes.map((size) => (
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
            )}

            {/* Quantity Selection */}
            {selectedVariant && (
              <div className="mb-6">
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
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedVariant.stock} items available
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                selectedVariant && selectedVariant.stock > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {selectedVariant && selectedVariant.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-4 text-center">
                {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                  <p className="text-orange-600 font-medium">Only {selectedVariant.stock} left in stock!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}