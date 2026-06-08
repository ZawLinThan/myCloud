/** @type {import('next').NextConfig} */
const nextConfig = {
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
      bodySizeLimit: '200mb',
    },
  },
};

module.exports = nextConfig;
