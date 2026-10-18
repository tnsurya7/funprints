'use client';

import { useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { getAllEnhancedProducts } from '@/lib/enhanced-products';

export default function ProductsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const products = getAllEnhancedProducts();
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
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
    <div className="min-h-screen pt-24 pb-16 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mb-2">
            Explore All Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select a style to customize, or filter by category to see all available colorways.
          </p>
        </div>
        
        {/* Category Filter Pills (Compact on mobile) */}
        <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-8 overflow-x-auto pb-2 no-scrollbar items-center">
          {categories.map((category) => {
            const isSelected = filter === category;
            return (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#FFC006] text-gray-950 shadow-sm border border-amber-400'
                    : 'bg-white text-gray-700 hover:text-gray-950 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
                <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs ${isSelected ? 'text-gray-900 font-extrabold' : 'text-gray-500'}`}>
                  ({getCategoryCount(category)})
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <p className="text-xl font-bold text-gray-900 mb-2">No products found</p>
            <p className="text-gray-500 text-sm">
              {filter === 'all' ? 'No products available' : `No ${filter} products available`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
