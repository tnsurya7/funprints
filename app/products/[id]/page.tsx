import { notFound } from 'next/navigation';
import { getEnhancedProductById } from '@/lib/enhanced-products';
import EnhancedProductDetail from '@/components/products/EnhancedProductDetail';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getEnhancedProductById(params.id);

  if (!product) {
    notFound();
  }

  return <EnhancedProductDetail product={product} />;
}