'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { enhancedProducts } from '@/lib/enhanced-products';

// Get specific products for featured section with all available colors
const featuredProducts = [
  {
    id: enhancedProducts[0].id, // Round Neck
    name: enhancedProducts[0].name,
    price: enhancedProducts[0].price,
    image: enhancedProducts[0].images["White"]?.front || '/placeholder-image.jpg',
    category: enhancedProducts[0].category,
    colors: enhancedProducts[0].colors, // Show all available colors
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: enhancedProducts[1].id, // V-Neck
    name: enhancedProducts[1].name,
    price: enhancedProducts[1].price,
    image: enhancedProducts[1].images["Maroon"]?.front || '/placeholder-image.jpg',
    category: enhancedProducts[1].category,
    colors: enhancedProducts[1].colors, // Show all available colors
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: enhancedProducts[2].id, // Polo
    name: enhancedProducts[2].name,
    price: enhancedProducts[2].price,
    image: enhancedProducts[2].images["Grey"]?.front || '/placeholder-image.jpg',
    category: enhancedProducts[2].category,
    colors: enhancedProducts[2].colors, // Show all available colors
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: enhancedProducts[3].id, // Hoodie
    name: enhancedProducts[3].name,
    price: enhancedProducts[3].price,
    image: enhancedProducts[3].images["Navy Blue"]?.front || '/placeholder-image.jpg',
    category: enhancedProducts[3].category,
    colors: enhancedProducts[3].colors, // Show all available colors
    gradient: 'from-orange-500 to-red-500'
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm font-semibold shadow-lg">
              Featured Collection
            </span>
          </motion.div>
          <h2 className="text-5xl font-bold mb-4 text-gradient">Featured Products</h2>
          <p className="text-xl text-gray-600">Discover our most popular designs</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary btn-glow"
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
