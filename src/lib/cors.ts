import { NextResponse } from 'next/server'

// Specific allowed origins only — no wildcards.
// To add more origins, set the ADDITIONAL_CORS_ORIGINS env var (comma-separated).
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // Parse additional origins from env var (comma-separated)
  ...(process.env.ADDITIONAL_CORS_ORIGINS
    ? process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : []),
].filter(Boolean)

/**
 * Returns CORS headers for the given request origin.
 *
 * Same-origin requests are ALWAYS allowed: if the requestOrigin host matches
 * the provided requestHost (e.g. triza-ai.vercel.app), we reflect it back.
 * This makes the chatbot work on ANY Vercel deployment URL without env config.
 */
export function getCorsHeaders(requestOrigin?: string | null, requestHost?: string): Record<string, string> {
  const origin = requestOrigin || ''
  let isAllowed = ALLOWED_ORIGINS.some(allowed => origin === allowed)

  // Same-origin: request origin host matches the server's own host
  if (!isAllowed && origin && requestHost) {
    try {
      isAllowed = new URL(origin).host === requestHost
    } catch {
      // invalid origin URL — leave isAllowed as false
    }
  }

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}
