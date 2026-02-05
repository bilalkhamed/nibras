import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nebras-public.t3.storage.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
