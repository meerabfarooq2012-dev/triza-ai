// =============================================================================
// Marketo Security Headers Proxy
// Adds security-related headers to all responses except static assets
// Next.js 16 uses the "proxy" convention instead of "middleware"
// =============================================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that should NOT have security headers applied (static assets, etc.)
const EXCLUDED_PATHS = [
  '/_next/static/',
  '/_next/image',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

// Supabase storage domain for CSP image-src directive
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseDomain = ''
try {
  if (SUPABASE_URL) {
    supabaseDomain = new URL(SUPABASE_URL).hostname
  }
} catch {
  // Ignore invalid URLs
}

export function proxy(request: NextRequest) {
  // Skip security headers for excluded paths (static assets)
  const pathname = request.nextUrl.pathname
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // ──────────────────────────────────────────────
  // Security Headers
  // ──────────────────────────────────────────────

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking — deny all framing
  response.headers.set('X-Frame-Options', 'DENY')

  // Enable browser XSS filtering
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information leakage
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Disable unnecessary browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Content Security Policy
  // Allow self, inline scripts/styles (needed for Next.js), and Supabase images
  const cspImageSources = ["'self'", 'data:', 'blob:']
  if (supabaseDomain) {
    cspImageSources.push(`https://${supabaseDomain}`)
  }

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`, // Next.js requires unsafe-inline and unsafe-eval
    `style-src 'self' 'unsafe-inline'`, // Next.js CSS requires unsafe-inline
    `img-src ${cspImageSources.join(' ')}`,
    `font-src 'self' data:`,
    `connect-src 'self' https://${supabaseDomain || '*.supabase.co'} https://api.stripe.com`,
    `frame-ancestors 'none'`, // Equivalent to X-Frame-Options: DENY
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  // Match all routes except static assets and API routes that need raw access
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
