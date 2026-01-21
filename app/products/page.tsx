'use client';

import { useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { getAllEnhancedProducts } from '@/lib/enhanced-products';

export default function ProductsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const products = getAllEnhancedProducts();
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);

  const getGradient = (category: string) => {
    switch (category) {
      case 'Round Neck': return 'from-blue-500 to-cyan-500';
      case 'Polo': return 'from-purple-500 to-pink-500';
      case 'V-Neck': return 'from-green-500 to-teal-500';
      case 'Hoodie': return 'from-orange-500 to-red-500';
      case 'Zip Hoodie': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const productCard = {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[product.colors[0]]?.front || '/placeholder-image.jpg',
              category: product.category,
              gradient: getGradient(product.category),
              colors: product.colors,
            };
            
            return (
              <ProductCard key={product.id} product={productCard} />
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500">
              {filter === 'all' ? 'No products available' : `No ${filter} products available`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
