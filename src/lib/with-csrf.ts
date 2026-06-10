// =============================================================================
// Thiora CSRF Validation Middleware — Wraps API route handlers with CSRF checks
// Validates CSRF tokens on mutating requests (POST/PATCH/PUT/DELETE)
// Uses HMAC-signed tokens with server-side secret
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { validateCsrfToken } from '@/lib/csrf'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

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
 * Validation: The token must be HMAC-signed with the server's CSRF secret.
 * This ensures tokens cannot be forged by attackers.
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

    // Extract the CSRF token from header, body, or cookie
    const submittedToken = await extractCsrfToken(request)

    // If no token in header/body, check the cookie
    const cookieToken = request.cookies.get('csrf-token')?.value
    const tokenToValidate = submittedToken || cookieToken

    // If no token provided at all, reject
    if (!tokenToValidate) {
      return NextResponse.json(
        { success: false, error: 'CSRF token required' },
        { status: 403 }
      )
    }

    // Validate the token's HMAC signature
    // This is the core CSRF protection: tokens are signed with a server secret
    // and cannot be forged by attackers
    if (!validateCsrfToken(tokenToValidate)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    // All checks passed — call the original handler
    return handler(request, context)
  }
}
