import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retail Custom Orders - FunPrint',
  description: 'Create and customize your individual t-shirt and hoodie orders with instant live previews.',
  alternates: {
    canonical: '/retail-orders',
  },
  openGraph: {
    title: 'Retail Custom Orders - FunPrint',
    description: 'Create and customize your individual t-shirt and hoodie orders with instant live previews.',
    url: 'https://www.funprint.in/retail-orders',
  },
};

export default function RetailOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
