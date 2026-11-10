/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'pg'],
};

export default nextConfig;
