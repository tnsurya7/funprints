'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { enhancedProducts } from '@/lib/enhanced-products';

// Highlight featured products across diverse categories
const featuredIds = [
  'cotton-supersoft-round-neck-180-gsm',
  'cotton-aero-polo-240-gsm',
  'cotton-pullover-hood-300-gsm',
  'dry-fit-aerotech-polo-200-gsm',
];

const selectedProducts = featuredIds
  .map(id => enhancedProducts.find(p => p.id === id))
  .filter((p): p is (typeof enhancedProducts)[0] => !!p);

const baseFeatured = selectedProducts.length >= 4 ? selectedProducts : enhancedProducts.slice(0, 4);

const featuredProducts = baseFeatured.map((product) => {
  const firstColor = product.colors[0];
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: (firstColor && product.images[firstColor]?.front) || '/placeholder-image.jpg',
    category: product.category,
    colors: product.colors,
  };
});

export default function FeaturedProducts() {
  return (
    <section className="py-14 sm:py-20 bg-white border-b border-gray-200/80 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight mb-3">
            Featured <span className="text-[#D97706]">Collection</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Explore our best-selling crew necks, polos, and athletic wear available in multiple vibrant colors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <Link href="/products">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 border border-amber-400/60"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
