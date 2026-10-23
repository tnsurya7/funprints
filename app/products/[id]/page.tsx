import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEnhancedProductById } from '@/lib/enhanced-products';
import EnhancedProductDetail from '@/components/products/EnhancedProductDetail';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = getEnhancedProductById(params.id);
  if (!product) return {};

  return {
    title: `${product.name} - FunPrint`,
    description: product.description,
    alternates: {
      canonical: `/products/${params.id}`,
    },
    openGraph: {
      title: `${product.name} - FunPrint`,
      description: product.description,
      url: `https://www.funprint.in/products/${params.id}`,
    },
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getEnhancedProductById(params.id);

  if (!product) {
    notFound();
  }

  return <EnhancedProductDetail product={product} />;
}