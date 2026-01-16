'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit, Eye, EyeOff, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products-data';

export default function AdminProducts() {
  const [productList, setProductList] = useState(products);
  const [filter, setFilter] = useState<'all' | 'Round Neck' | 'Polo' | 'V-Neck' | 'Hoodie' | 'Zip Hoodie'>('all');

  const filteredProducts = productList.filter(p => 
    filter === 'all' ? true : p.category === filter
  );

  const categories = ['all', 'Round Neck', 'Polo', 'V-Neck', 'Hoodie', 'Zip Hoodie'];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your products, prices, and stock</p>
          </div>
          <Link href="/admin">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
              {cat !== 'all' && ` (${productList.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              {/* Product Image */}
              <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <Image
                  src={product.images.front}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-bold text-purple-600">₹{product.price}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.colors.length} colors available
                  </p>
                </div>

                {/* Colors */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stock Management */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Stock</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded bg-white border hover:bg-gray-100 flex items-center justify-center">
                      -
                    </button>
                    <span className="w-12 text-center font-bold">12</span>
                    <button className="w-8 h-8 rounded bg-white border hover:bg-gray-100 flex items-center justify-center">
                      +
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded hover:bg-green-200">
                    ✓ In Stock
                  </button>
                  <button className="flex-1 px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded hover:bg-gray-300">
                    Out of Stock
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="card p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No products available' : `No ${filter} products`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
