import { MetadataRoute } from 'next';

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('funprint.com') && !envUrl.includes('localhost')) {
    return envUrl.startsWith('https://www.') ? envUrl.replace(/\/$/, '') : 'https://www.funprint.in';
  }
  return 'https://www.funprint.in';
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/payment/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
