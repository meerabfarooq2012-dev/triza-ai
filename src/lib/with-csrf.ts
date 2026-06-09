// =============================================================================
// Thiora CSRF Validation Middleware — Wraps API route handlers with CSRF checks
// Validates CSRF tokens on mutating requests (POST/PATCH/PUT/DELETE)
// Uses the double-submit cookie pattern
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

/**
 * Get the CSRF cookie name based on the request's security context.
 * Uses __Host- prefix when on HTTPS (more restrictive).
 */
function getCsrfCookieName(request: NextRequest): string {
  const isSecure =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:'
  return isSecure ? '__Host-csrf-token' : 'csrf-token'
}

/**
 * Extract the CSRF token from the request.
 * Checks the `x-csrf-token` header first, then falls back to `csrfToken` in the JSON body.
 */
async function extractCsrfToken(request: NextRequest): Promise<string | null> {
  // Check header first (preferred)
  const headerToken = request.headers.get('x-csrf-token')
  if (headerToken) return headerToken

  // Fall back to JSON body field — but we need to clone the request
  // so the original body can still be read by the handler
  try {
    const cloned = request.clone()
    const body = await cloned.json()
    if (body?.csrfToken && typeof body.csrfToken === 'string') {
      return body.csrfToken
    }
  } catch {
    // Body is not JSON or cannot be parsed — no CSRF token in body
  }

  return null
}

/**
 * Higher-order function that wraps an API route handler with CSRF validation.
 * Only validates CSRF tokens on mutating requests (POST/PATCH/PUT/DELETE).
 * GET and other safe methods are passed through without CSRF checks.
 *
 * @example
 * ```typescript
 * import { withCsrf } from '@/lib/with-csrf'
 *
 * export const POST = withCsrf(async (request: NextRequest) => {
 *   // Your handler code here
 * })
 *
 * export const GET = async (request: NextRequest) => {
 *   // GET requests don't need CSRF protection
 * }
 * ```
 */
export function withCsrf(handler: RouteHandler): RouteHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Only validate CSRF on mutating methods
    if (!MUTATING_METHODS.has(request.method)) {
      return handler(request, context)
    }

    // Extract the CSRF token from header or body
    const submittedToken = await extractCsrfToken(request)
    if (!submittedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    // Validate the token's signature
    if (!validateCsrfToken(submittedToken)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    // Compare with the cookie value (double-submit cookie pattern)
    const cookieName = getCsrfCookieName(request)
    const cookieToken = request.cookies.get(cookieName)?.value
    if (!cookieToken || cookieToken !== submittedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    // All checks passed — call the original handler
    return handler(request, context)
  }
}
