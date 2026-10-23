'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { getColorDisplay } from '@/lib/colors';
import { trackSelectItem } from '@/lib/analytics';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors?: string[];
  selectedColor?: string; // For color-specific cards
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Create the product URL with color parameter if selectedColor exists
  const getProductUrl = () => {
    const baseUrl = `/products/${product.id}`;
    return product.selectedColor ? `${baseUrl}?color=${encodeURIComponent(product.selectedColor)}` : baseUrl;
  };

  const displayedColors = product.colors || ['White', 'Black'];
  const maxVisibleColors = 6;
  const visibleColors = displayedColors.slice(0, maxVisibleColors);
  const remainingCount = displayedColors.length - maxVisibleColors;

  return (
    <div className="relative group w-full h-full">
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Product Image Frame */}
        <Link
          href={getProductUrl()}
          onClick={() => {
            trackSelectItem({
              item_id: product.id,
              item_name: product.name,
              price: product.price,
              item_category: product.category,
              item_variant: product.selectedColor,
            });
          }}
          className="relative block aspect-square bg-gray-50 overflow-hidden"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 z-10 ${
            isWishlisted 
              ? 'bg-amber-50 text-amber-600 border border-amber-300' 
              : 'bg-white/90 backdrop-blur-xs text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-amber-500' : ''}`} />
        </button>

        {/* Content */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col">
          {/* Category */}
          <div className="mb-1.5">
            <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-[11px] font-semibold border border-gray-200">
              {product.category}
            </span>
          </div>
          
          {/* Title */}
          <Link href={getProductUrl()}>
            <h3 className="text-xs sm:text-base font-bold text-gray-950 line-clamp-2 hover:text-amber-700 transition-colors mb-1.5">
              {product.name}
            </h3>
          </Link>
          
          {/* Price */}
          <div className="text-sm sm:text-xl font-extrabold text-gray-950 mb-2 sm:mb-3">
            ₹{product.price}
          </div>
          
          {/* Color swatches */}
          <div className="mb-3 sm:mb-4 mt-auto">
            <p className="text-[10px] sm:text-[11px] text-gray-500 mb-1 font-medium">
              Colors ({displayedColors.length}):
            </p>
            <div className="flex gap-1 sm:gap-1.5 flex-wrap items-center">
              {visibleColors.map((color) => (
                <div
                  key={color}
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border border-gray-300 shadow-xs"
                  style={{ backgroundColor: getColorDisplay(color) }}
                  title={color}
                />
              ))}
              {remainingCount > 0 && (
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded-full">
                  +{remainingCount}
                </span>
              )}
            </div>
          </div>
          
          {/* Curvly CTA button */}
          <Link href={getProductUrl()} className="block w-full">
            <button
              type="button"
              className="w-full py-1.5 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm bg-gray-900 text-white hover:bg-[#FFC006] hover:text-gray-950 transition-all duration-200 shadow-xs"
            >
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
