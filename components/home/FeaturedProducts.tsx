'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { products } from '@/lib/products-data';

// Get specific products for featured section
const featuredProducts = [
  products.find(p => p.id === 'round-neck-white'),
  products.find(p => p.id === 'polo-grey'),
  products.find(p => p.id === 'hoodie-navy'),
  products.find(p => p.id === 'zip-hoodie-maroon'),
].filter(Boolean).map((product) => ({
  id: product!.id,
  name: product!.name,
  price: product!.price,
  image: product!.images.front,
  category: product!.category,
  gradient: product!.category === 'Round Neck' 
    ? 'from-blue-500 to-cyan-500' 
    : product!.category === 'Polo'
    ? 'from-purple-500 to-pink-500'
    : product!.category === 'Hoodie'
    ? 'from-green-500 to-teal-500'
    : 'from-orange-500 to-red-500',
}));

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
