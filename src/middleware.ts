import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// =============================================================================
// Marketo Edge Middleware — Security headers only (Vercel Edge compatible)
// No Prisma, no rate-limiting, no JWT verification in middleware.
// Auth is handled by each API route handler using authenticateRequest().
// =============================================================================

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // --- Security Headers ---
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy — allows necessary resources for the marketplace
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://veplxumszgotnkassotw.supabase.co https://*.supabase.co https://lh3.googleusercontent.com https://ui-avatars.com",
    "connect-src 'self' https://veplxumszgotnkassotw.supabase.co https://*.supabase.co https://www.googleapis.com",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

// Only run on API routes and pages (skip static assets)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|offline.html|icon-|apple-touch-icon|logo).*)',
  ],
}
