import ProductDetail from '@/components/products/ProductDetail';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Product ${params.id} - Fun Prints`,
    description: 'Premium custom t-shirt with 360° view',
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}
