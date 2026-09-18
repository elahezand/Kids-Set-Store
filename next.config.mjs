/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: [
      'react-icons',
      '@mui/material',
    ],
  },

  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/uploads/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=604800',
        },
      ],
    },
  ],
};

export default nextConfig;