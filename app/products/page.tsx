'use client';

import { useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { getAllEnhancedProducts } from '@/lib/enhanced-products';

export default function ProductsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const products = getAllEnhancedProducts();
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
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
  
  // Create individual product cards for each color when category is filtered
  const getFilteredProducts = () => {
    if (filter === 'all') {
      // Show one card per product type with all colors
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[product.colors[0]]?.front || '/placeholder-image.jpg',
        category: product.category,
        gradient: getGradient(product.category),
        colors: product.colors,
      }));
    } else {
      // Show separate cards for each color in the selected category
      const categoryProducts = products.filter(p => p.category === filter);
      const colorCards: any[] = [];
      
      categoryProducts.forEach(product => {
        product.colors.forEach(color => {
          if (product.images[color]?.front) {
            colorCards.push({
              id: `${product.id}-${color.toLowerCase().replace(/\s+/g, '-')}`,
              name: `${product.name} - ${color}`,
              price: product.price,
              image: product.images[color].front,
              category: product.category,
              gradient: getGradient(product.category),
              colors: [color], // Show only this specific color
              originalProductId: product.id,
              selectedColor: color
            });
          }
        });
      });
      
      return colorCards;
    }
  };

  const filteredProducts = getFilteredProducts();
  
  const getCategoryCount = (category: string) => {
    if (category === 'all') return products.length;
    const categoryProducts = products.filter(p => p.category === category);
    return categoryProducts.reduce((count, product) => {
      return count + product.colors.filter(color => product.images[color]?.front).length;
    }, 0);
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
              {` (${getCategoryCount(category)})`}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                // For color-specific cards, link to the original product with color pre-selected
                id: product.originalProductId || product.id
              }} 
            />
          ))}
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
