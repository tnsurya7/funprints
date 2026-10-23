import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEnhancedProductById } from '@/lib/enhanced-products';
import EnhancedProductDetail from '@/components/products/EnhancedProductDetail';
import ProductSchema from '@/components/seo/ProductSchema';

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

  const primaryImage =
    product.images[product.colors[0]]?.front ||
    product.images[Object.keys(product.images)[0]]?.front ||
    'https://www.funprint.in/fun-print-logo.avif';

  return (
    <>
      <ProductSchema
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: primaryImage,
          category: product.category,
        }}
      />
      <EnhancedProductDetail product={product} />
    </>
  );
}