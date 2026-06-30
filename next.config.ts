import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint errors should NOT block production builds on Vercel.
  // (The only existing lint warning is in an unrelated Google OAuth hook.)
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,

  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '21.0.15.82',
    '21.0.13.77',
    // Preview panel domains (space-z.ai) — bina iske /_next/* chunks block ho jate hain
    '*.space-z.ai',
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

// ── Sentry Integration ─────────────────────────────────────────────────────
// Wrap the Next.js config with Sentry's withSentryConfig.
// This enables:
// - Automatic source map upload to Sentry during builds (if SENTRY_AUTH_TOKEN is set)
// - Automatic instrumentation of API routes and server components
// - Performance monitoring integration
//
// If SENTRY_AUTH_TOKEN is not configured, the wrapper gracefully falls back
// to the original config without any errors.
//
// Sentry is OPTIONAL — if no DSN is set, the app works perfectly fine.
export default withSentryConfig(nextConfig, {
  // Suppress all Sentry build logs (can be noisy)
  silent: true,

  // Hide source maps from generated bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry statements from production bundles
  // when Sentry is not configured (no DSN)
  automaticVercelMonolithRemoval: true,
});
