'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors?: string[];
  gradient?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const gradient = product.gradient || 'from-blue-500 to-purple-500';

  // Get available colors based on category
  const getAvailableColors = (category: string) => {
    const categoryColors: { [key: string]: string[] } = {
      'Round Neck': ['White', 'Black', 'Grey', 'Navy Blue', 'Maroon'],
      'V-Neck': ['White', 'Black', 'Grey', 'Navy Blue', 'Maroon'],
      'Polo': ['White', 'Black', 'Grey', 'Navy Blue'],
      'Hoodie': ['Black', 'Navy Blue'],
      'Zip Hoodie': ['Black', 'Grey', 'Maroon']
    };
    return categoryColors[category] || ['White', 'Black'];
  };

  // Color mapping for display
  const getColorDisplay = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'White': '#FFFFFF',
      'Black': '#000000',
      'Grey': '#6B7280',
      'Navy Blue': '#1E3A8A',
      'Maroon': '#7F1D1D'
    };
    return colorMap[color] || '#6B7280';
  };

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative group w-full h-full"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
      
      {/* Card */}
      <div className="relative card-gradient overflow-hidden h-full flex flex-col">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100">
            {/* Product Image */}
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>
        </Link>

        {/* Wishlist button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-4 right-4 p-3 rounded-xl shadow-lg transition-all duration-300 z-10 ${
            isWishlisted 
              ? `bg-gradient-to-r ${gradient} text-white` 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
          }`}
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
          />
        </motion.button>

        <div className="p-6 flex-1 flex flex-col">
          {/* Category badge */}
          <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-semibold mb-3 shadow-md self-start`}>
            {product.category}
          </span>
          
          <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">{product.name}</h3>
          
          {/* Price */}
          <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
            ₹{product.price}
          </p>
          
          {/* Available Colors */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Available Colors:</p>
            <div className="flex gap-1 flex-wrap">
              {(product.colors || getAvailableColors(product.category)).map((color) => (
                <div
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: getColorDisplay(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <Link href={`/products/${product.id}`} className="mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${gradient} shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
