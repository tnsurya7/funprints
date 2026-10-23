import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - FunPrint | Premium Custom T-Shirts & Hoodies',
  description: 'Explore our complete collection of custom t-shirts, polos, and hoodies designed for print perfection.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Products - FunPrint | Premium Custom T-Shirts & Hoodies',
    description: 'Explore our complete collection of custom t-shirts, polos, and hoodies designed for print perfection.',
    url: 'https://www.funprint.in/products',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
