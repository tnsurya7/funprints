import ProductCard from '@/components/products/ProductCard';
import { products } from '@/lib/products-data';

export const metadata = {
  title: 'Products - Fun Prints',
  description: 'Browse our collection of premium custom t-shirts',
};

export default function ProductsPage() {
  const productCards = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images.front,
    category: product.category,
    gradient: product.category === 'Round Neck' 
      ? 'from-blue-500 to-cyan-500' 
      : product.category === 'Polo'
      ? 'from-purple-500 to-pink-500'
      : product.category === 'V-Neck'
      ? 'from-green-500 to-teal-500'
      : 'from-orange-500 to-red-500',
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productCards.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
