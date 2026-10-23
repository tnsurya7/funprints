import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Partnership & Custom Manufacturing - FunPrint',
  description: 'Partner with FunPrint for custom clothing manufacturing, bulk production, and premium apparel printing.',
  alternates: {
    canonical: '/brands',
  },
  openGraph: {
    title: 'Brand Partnership & Custom Manufacturing - FunPrint',
    description: 'Partner with FunPrint for custom clothing manufacturing, bulk production, and premium apparel printing.',
    url: 'https://www.funprint.in/brands',
  },
};

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
