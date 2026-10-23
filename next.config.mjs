/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/brands-file/[filename]': ['./app/brands_pdfs & images/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  transpilePackages: ['three'],
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://google-analytics.com https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com https://api.qrserver.com https://*.neon.tech https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://google-analytics.com https://*.analytics.google.com https://analytics.google.com https://*.google.com https://www.google.com https://*.google.co.in https://www.google.co.in https://*.doubleclick.net https://googleads.g.doubleclick.net;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://api.postalpincode.in https://*.google-analytics.com https://google-analytics.com https://*.analytics.google.com https://analytics.google.com https://*.googletagmanager.com https://googletagmanager.com https://*.google.com https://www.google.com https://*.google.co.in https://*.doubleclick.net https://stats.g.doubleclick.net https://vitals.vercel-insights.com https://*.neon.tech;
      frame-src 'self' https://www.youtube.com;
      frame-ancestors 'self';
      base-uri 'self';
      form-action 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
