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
  gradient?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const gradient = product.gradient || 'from-blue-500 to-purple-500';

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative group"
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
          <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-4`}>
            ₹{product.price}
          </p>
          
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
