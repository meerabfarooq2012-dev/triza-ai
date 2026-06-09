import { NextResponse } from 'next/server'

// Specific allowed origins only — no wildcards.
// To add more origins, set the ADDITIONAL_CORS_ORIGINS env var (comma-separated).
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://thiora.vercel.app',
  // Parse additional origins from env var (comma-separated)
  ...(process.env.ADDITIONAL_CORS_ORIGINS
    ? process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : []),
].filter(Boolean)

export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const origin = requestOrigin || ''
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin === allowed)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}
