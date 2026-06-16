import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '21.0.15.82',
    '21.0.13.77',
  ],

  // Required for Prisma + PostgreSQL on Vercel serverless
  // jsdom/isomorphic-dompurify need to be external because they use native modules
  // that can crash during bundling on Vercel
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'bcryptjs', 'sharp', 'isomorphic-dompurify', 'jsdom', 'socket.io', 'socket.io-client', 'web-push'],

  images: {
    remotePatterns: [
      // Supabase Storage — allow any Supabase project subdomain
      // SECURITY: Don't hardcode specific project hostnames — use wildcard pattern
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Local development (e.g. local Supabase or asset server)
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
