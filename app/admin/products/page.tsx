'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Eye, ToggleLeft, ToggleRight, Minus, PlusIcon, ArrowLeft, Upload, X, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  enabled: boolean;
  variants: ProductVariant[];
}

interface EditingProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  enabled: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getStockStatus = (variants: ProductVariant[]) => {
    const totalStock = getTotalStock(variants);
    if (totalStock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (totalStock <= 5) return { text: `Low Stock (${totalStock})`, color: 'text-orange-600 bg-orange-50' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  const toggleProductStatus = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      });
      
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error);
    }
  };

  const updateVariantStock = async (productId: string, variantId: string, change: number) => {
    try {
      const product = products.find(p => p.id === productId);
      const variant = product?.variants.find(v => v.id === variantId);
      if (!variant) return;

      const newStock = Math.max(0, variant.stock + change);
      
      const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;
    
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          base_price: editingProduct.base_price,
          enabled: editingProduct.enabled
        })
      });
      
      if (res.ok) {
        await fetchProducts();
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleImageUpload = async (productId: string, variantId: string, file: File) => {
    setUploadingImage(variantId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);
      formData.append('variantId', variantId);
      
      const res = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(null);
    }
  };

  const createProduct = async (productData: {
    name: string;
    category: string;
    description: string;
    base_price: number;
  }) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (res.ok) {
        await fetchProducts();
        setShowAddProduct(false);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === category
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Products' : category}
              {category !== 'all' && ` (${products.filter(p => p.category === category).length})`}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.variants);
            const totalStock = getTotalStock(product.variants);
            const firstVariant = product.variants[0];
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Product Image */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative group">
                  {firstVariant?.image_url ? (
                    <img 
                      src={firstVariant.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-purple-400" />
                  )}
                  
                  {/* Image Upload Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingImage === firstVariant?.id ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && firstVariant) {
                            handleImageUpload(product.id, firstVariant.id, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {editingProduct?.id === product.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-lg font-semibold"
                          />
                          <input
                            type="number"
                            value={editingProduct.base_price}
                            onChange={(e) => setEditingProduct({...editingProduct, base_price: Number(e.target.value)})}
                            className="w-full px-2 py-1 border rounded"
                          />
                          <textarea
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-sm"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className="flex items-center ml-2"
                    >
                      {product.enabled ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold">₹{product.base_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Variants:</span>
                      <span className="font-semibold">{product.variants.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Stock:</span>
                      <span className="font-semibold">{totalStock}</span>
                    </div>
                  </div>

                  {/* Variant Stock Controls */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Stock by Color:</h4>
                    {Array.from(new Set(product.variants.map(v => v.color))).map(color => {
                      const colorVariants = product.variants.filter(v => v.color === color);
                      const colorStock = colorVariants.reduce((sum, v) => sum + v.stock, 0);
                      const firstColorVariant = colorVariants[0];
                      
                      return (
                        <div key={color} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{color}:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateVariantStock(product.id, firstColorVariant.id, -1)}
                              className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-medium min-w-[2rem] text-center">{colorStock}</span>
                            <button
                              onClick={() => updateVariantStock(product.id, firstColorVariant.id, 1)}
                              className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingProduct?.id === product.id ? (
                      <>
                        <button 
                          onClick={saveProductEdit}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setEditingProduct({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            base_price: product.base_price,
                            enabled: product.enabled
                          })}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'No products available' : `No ${filter} products available`}
            </p>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal 
          onClose={() => setShowAddProduct(false)}
          onSave={createProduct}
        />
      )}
    </div>
  );
}

function AddProductModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Round Neck',
    description: '',
    base_price: 499
  });

  const categories = ['Round Neck', 'Polo', 'V-Neck', 'Hoodie', 'Zip Hoodie'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Enter product description"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}