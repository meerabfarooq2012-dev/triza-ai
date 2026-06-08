// =============================================================================
// Marketo Next.js Proxy — Security Headers, Route Protection, Size Limiting
// Next.js 16 uses the "proxy" convention instead of "middleware"
// Runs on the Edge Runtime; uses `jose` for JWT verification (Edge-compatible)
// =============================================================================

import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getCorsHeaders } from '@/lib/cors'

// ---------------------------------------------------------------------------
// JWT Configuration — must match the secret used by `jsonwebtoken` in
// src/lib/auth-middleware.ts.  `jsonwebtoken` uses HMAC-SHA256 (HS256) by
// default, so we verify with the same secret as a symmetric key.
//
// IMPORTANT: On Vercel Edge Runtime, environment variables must be explicitly
// configured for the Edge. If JWT_SECRET is not available at Edge, we cannot
// verify tokens here — but we should NOT block the request, because the
// route handler (Node.js runtime) has full access to env vars and can
// authenticate the request itself. Only block if we can positively verify
// that the token is invalid/expired.
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET ?? ''

/** Admin routes that use their own key-based auth and should bypass JWT check */
const ADMIN_AUTH_WHITELIST = new Set([
  '/api/admin/sync-schema',
  '/api/setup/admin',       // Setup endpoint at /api/setup/admin (NOT /api/admin/setup)
  '/api/setup/sync-schema', // Schema sync at /api/setup/sync-schema
  '/api/setup/categories',  // Category seeding at /api/setup/categories
])

/** Allowed HTTP methods for API routes */
const ALLOWED_API_METHODS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
])

/** Maximum request body size for API routes (10 MB) */
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024

// ---------------------------------------------------------------------------
// Supabase storage domain for CSP directives
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseDomain = ''
try {
  if (SUPABASE_URL) {
    supabaseDomain = new URL(SUPABASE_URL).hostname
  }
} catch {
  // Ignore invalid URLs
}

// ---------------------------------------------------------------------------
// JWT Verification (Edge Runtime compatible via `jose`)
// ---------------------------------------------------------------------------

// Cache the imported key so we don't re-create it on every request
let cachedKey: Uint8Array | undefined

async function getSigningKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey
  // jsonwebtoken with HS256 uses the raw secret string as a UTF-8 buffer
  cachedKey = new TextEncoder().encode(JWT_SECRET)
  return cachedKey
}

interface JwtPayload {
  userId: string
  email: string
  role: string
  twoFactorPending?: boolean
}

async function verifyJwt(token: string): Promise<JwtPayload | null> {
  // If JWT_SECRET is not available on the Edge (e.g., not configured for
  // Edge Runtime on Vercel), we CANNOT verify the token — but we also
  // should NOT block the request. Return a special sentinel so the
  // admin route handler can fall through to its own Node.js-based auth.
  if (!JWT_SECRET) {
    console.warn('[proxy] JWT_SECRET not available on Edge — deferring auth to route handler')
    return { _deferred: true, userId: '', email: '', role: '' } as unknown as JwtPayload
  }
  try {
    const key = await getSigningKey()
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    const data = payload as Record<string, unknown>

    // Reject tokens that still have 2FA pending
    if (data.twoFactorPending) return null

    return {
      userId: data.userId as string,
      email: data.email as string,
      role: data.role as string,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

function buildSecurityHeaders(isDev: boolean): Record<string, string> {
  // Content-Security-Policy
  // Note: Next.js RSC uses inline <script> tags for flight data, so 'unsafe-inline'
  // is required for script-src. This is a known tradeoff with Next.js App Router.
  // In production, consider using nonce-based CSP for stronger protection.
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';" // Dev: needs both for HMR + RSC
    : "script-src 'self' 'unsafe-inline';" // Prod: unsafe-inline needed for Next.js RSC inline scripts

  const cspImageSources = ["'self'", 'data:', 'blob:', 'https:']
  if (supabaseDomain) {
    cspImageSources.push(`https://${supabaseDomain}`)
  }

  const cspConnectSources = ["'self'", 'ws:', 'wss:', 'https:', 'http:']
  if (supabaseDomain) {
    cspConnectSources.push(`https://${supabaseDomain}`)
  }

  const csp = [
    "default-src 'self';",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;", // unsafe-inline needed for Tailwind CSS
    "font-src 'self' https://fonts.gstatic.com data:;",
    `img-src ${cspImageSources.join(' ')};`, // data: for inline images, blob: & https: for remote
    `connect-src ${cspConnectSources.join(' ')};`, // ws:/wss: for Socket.io, https:/http: for API calls
    "worker-src 'self' blob:;", // blob: for worker scripts
    "frame-ancestors 'none';", // prevent clickjacking
    "base-uri 'self';",
    "form-action 'self';",
    "object-src 'none';",
  ].join(' ')

  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-DNS-Prefetch-Control': 'on',
  }

  // Strict-Transport-Security only in production (not in dev over HTTP)
  if (!isDev) {
    headers['Strict-Transport-Security'] =
      'max-age=63072000; includeSubDomains; preload'
  }

  return headers
}

// ---------------------------------------------------------------------------
// Helper: extract Bearer token from Authorization header
// ---------------------------------------------------------------------------

function extractBearerToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fall back to httpOnly cookie
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

// ---------------------------------------------------------------------------
// Main Proxy (middleware) — Next.js 16 convention
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  try {
    return await _proxyInner(request)
  } catch (error) {
    // CRITICAL: The proxy/middleware MUST never throw an unhandled error.
    // On Vercel Edge Runtime, an unhandled error returns an HTML error page,
    // which causes the client to see "Unexpected token '<'" when parsing JSON.
    // Always return a JSON response so the client can handle errors gracefully.
    console.error('[proxy] Unhandled error:', error)

    // For API routes, return a JSON error response
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Internal server error in proxy middleware',
          detail: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    }

    // For page routes, let Next.js handle it (return next to render the page)
    return NextResponse.next()
  }
}

async function _proxyInner(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDev = process.env.NODE_ENV === 'development'
  const isApiRoute = pathname.startsWith('/api/')

  // -----------------------------------------------------------------------
  // 1. CORS for API routes
  // -----------------------------------------------------------------------
  if (isApiRoute) {
    const requestOrigin = request.headers.get('origin')
    const corsHeaders = getCorsHeaders(requestOrigin)

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      })
    }
  }

  // -----------------------------------------------------------------------
  // 2. Method Validation for API Routes
  // -----------------------------------------------------------------------
  if (isApiRoute && !ALLOWED_API_METHODS.has(request.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  // -----------------------------------------------------------------------
  // 3. Request Size Limiting for API Routes
  // -----------------------------------------------------------------------
  if (isApiRoute && request.method !== 'GET' && request.method !== 'HEAD') {
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const length = parseInt(contentLength, 10)
      if (!isNaN(length) && length > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: 'Request payload too large. Maximum size is 10MB.' },
          { status: 413 }
        )
      }
    }
  }

  // -----------------------------------------------------------------------
  // 4. Route Protection — Admin API Routes
  // -----------------------------------------------------------------------
  if (pathname.startsWith('/api/admin/')) {
    // Check whitelist — routes with their own key-based auth
    if (ADMIN_AUTH_WHITELIST.has(pathname)) {
      // Let these through — they handle their own authentication
      const response = NextResponse.next()
      const secHeaders = buildSecurityHeaders(isDev)
      for (const [key, value] of Object.entries(secHeaders)) {
        response.headers.set(key, value)
      }
      // Add CORS headers
      const requestOrigin = request.headers.get('origin')
      const corsHeaders = getCorsHeaders(requestOrigin)
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value)
      }
      return response
    }

    // Verify JWT with admin role
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized — missing authentication token' },
        { status: 401 }
      )
    }

    const payload = await verifyJwt(token)

    // If payload is null, the token is definitively invalid/expired
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid or expired token' },
        { status: 401 }
      )
    }

    // If payload has _deferred flag, JWT_SECRET wasn't available on Edge.
    // Let the request through so the Node.js route handler can authenticate.
    const isDeferred = '_deferred' in (payload as Record<string, unknown>)

    if (!isDeferred) {
      // We verified the token on Edge — check admin role
      if (payload.role !== 'admin' && payload.role !== 'both') {
        return NextResponse.json(
          { error: 'Forbidden — admin access required' },
          { status: 403 }
        )
      }
    }

    // Valid admin request — pass through with user info in custom headers
    // (only set headers if we actually verified the token on Edge)
    const response = NextResponse.next()
    if (!isDeferred) {
      response.headers.set('x-mw-user-id', payload.userId)
      response.headers.set('x-mw-user-email', payload.email)
      response.headers.set('x-mw-user-role', payload.role)
    }

    // Add security headers
    const secHeaders = buildSecurityHeaders(isDev)
    for (const [key, value] of Object.entries(secHeaders)) {
      response.headers.set(key, value)
    }

    // Add CORS headers
    const requestOrigin = request.headers.get('origin')
    const corsHeaders = getCorsHeaders(requestOrigin)
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }

    return response
  }

  // -----------------------------------------------------------------------
  // 5. All Other Routes — Add Security Headers + CORS
  // -----------------------------------------------------------------------
  const response = NextResponse.next()

  // Add security headers to all responses
  const secHeaders = buildSecurityHeaders(isDev)
  for (const [key, value] of Object.entries(secHeaders)) {
    response.headers.set(key, value)
  }

  // Add CORS headers to API routes
  if (isApiRoute) {
    const requestOrigin = request.headers.get('origin')
    const corsHeaders = getCorsHeaders(requestOrigin)
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
  }

  return response
}

// ---------------------------------------------------------------------------
// Matcher Configuration — run on all routes except Next.js internals
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - Other common static asset extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf)$).*)',
  ],
}
