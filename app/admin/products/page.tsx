'use client';

import AuthGuard from '@/components/admin/AuthGuard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProductColor {
  name: string;
  stock: number;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  gst_percent: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Round Neck' | 'Polo' | 'V-Neck' | 'Hoodie' | 'Zip Hoodie'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, color: string, newStock: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ color, stock: newStock }),
      });

      if (res.ok) {
        toast.success('Stock updated!');
        fetchProducts();
      } else {
        toast.error('Failed to update stock');
      }
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const updatePrice = async (productId: string, newPrice: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'updatePrice', price: newPrice }),
      });

      if (res.ok) {
        toast.success('Price updated!');
        fetchProducts();
      } else {
        toast.error('Failed to update price');
      }
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const toggleProductStatus = async (productId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'toggleStatus' }),
      });

      if (res.ok) {
        toast.success('Product status updated!');
        fetchProducts();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredProducts = products.filter(p => 
    filter === 'all' ? true : p.category === filter
  );

  const categories = ['all', 'Round Neck', 'Polo', 'V-Neck', 'Hoodie', 'Zip Hoodie'];

  const getStockStatus = (colors: ProductColor[]) => {
    const totalStock = colors.reduce((sum, color) => sum + color.stock, 0);
    if (totalStock === 0) return { status: 'Out of Stock', color: 'text-red-600' };
    if (totalStock <= 5) return { status: `Only ${totalStock} left`, color: 'text-orange-600' };
    return { status: 'In Stock', color: 'text-green-600' };
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your products, prices, and stock</p>
          </div>
          <Link href="/admin">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
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
              {cat !== 'all' && ` (${products.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.colors);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {product.colors[0]?.image_url ? (
                        <Image
                          src={product.colors[0].image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {!product.enabled && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold">DISABLED</span>
                        </div>
                      )}
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
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={product.base_price}
                            onChange={(e) => updatePrice(product.id, Number(e.target.value))}
                            className="text-xl font-bold text-purple-600 bg-transparent border-b border-transparent hover:border-purple-300 focus:border-purple-500 outline-none w-20"
                          />
                          <span className="text-xl font-bold text-purple-600">₹</span>
                        </div>
                        <p className={`text-sm font-semibold mt-1 ${stockStatus.color}`}>
                          {stockStatus.status}
                        </p>
                      </div>

                      {/* Colors with Stock */}
                      <div className="mt-3 space-y-2">
                        {product.colors.map((color) => (
                          <div key={color.name} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{color.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateStock(product.id, color.name, color.stock - 1)}
                                className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold">{color.stock}</span>
                              <button
                                onClick={() => updateStock(product.id, color.name, color.stock + 1)}
                                className="w-6 h-6 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => toggleProductStatus(product.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                          product.enabled 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {product.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
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
          </>
        )}

        {/* Add Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Product</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                setShowAddForm(false);
                toast.success('Product added! (Feature coming soon)');
              }}>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <select className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="">Select Category</option>
                    <option value="Round Neck">Round Neck</option>
                    <option value="Polo">Polo</option>
                    <option value="V-Neck">V-Neck</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Zip Hoodie">Zip Hoodie</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}
