import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Custom T-Shirts & Corporate Merchandise - FunPrint',
  description: 'Order custom printed t-shirts and hoodies in bulk for your company, college, or event with volume pricing.',
  alternates: {
    canonical: '/bulk-order',
  },
  openGraph: {
    title: 'Bulk Custom T-Shirts & Corporate Merchandise - FunPrint',
    description: 'Order custom printed t-shirts and hoodies in bulk for your company, college, or event with volume pricing.',
    url: 'https://www.funprint.in/bulk-order',
  },
};

export default function BulkOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
