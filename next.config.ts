import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'lh3.googleusercontent.com',
        protocol: 'https',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // increase from default 4mb
    },
  },
};

export default nextConfig;
