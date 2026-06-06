import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '21.0.15.82',
    '21.0.13.77',
  ],

  // Required for Prisma + PostgreSQL on Vercel serverless
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'bcryptjs', 'sharp'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'veplxumszgotnkassotw.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
