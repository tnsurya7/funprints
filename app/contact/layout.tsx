import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - FunPrint',
  description: 'Get in touch with FunPrint for custom orders, bulk inquiries, support, and office visits.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - FunPrint',
    description: 'Get in touch with FunPrint for custom orders, bulk inquiries, support, and office visits.',
    url: 'https://www.funprint.in/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
