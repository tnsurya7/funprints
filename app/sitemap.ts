import { MetadataRoute } from 'next';
import { enhancedProducts } from '@/lib/enhanced-products';

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('funprint.com') && !envUrl.includes('localhost')) {
    return envUrl.startsWith('https://www.') ? envUrl.replace(/\/$/, '') : 'https://www.funprint.in';
  }
  return 'https://www.funprint.in';
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const productUrls: MetadataRoute.Sitemap = enhancedProducts.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: new Date('2026-10-20T00:00:00.000Z'),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-10-23T00:00:00.000Z'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date('2026-10-23T00:00:00.000Z'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/retail-orders`,
      lastModified: new Date('2026-10-20T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/bulk-order`,
      lastModified: new Date('2026-10-20T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date('2026-10-20T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-01-16T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2026-01-16T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-16T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date('2026-01-16T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date('2026-01-16T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...productUrls];
}
