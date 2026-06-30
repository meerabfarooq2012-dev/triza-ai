// =============================================================================
// TRIZA CSRF Validation Middleware — Passthrough Mode
//
// CSRF protection is now handled by Origin-based validation in the proxy
// (src/proxy.ts), which checks Origin/Referer headers on mutating requests.
//
// This wrapper is kept as a passthrough so existing route handlers continue
// to work without code changes. The proxy provides equivalent (and more
// reliable) CSRF protection at the Edge Runtime level.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'

type RouteHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>

/**
 * Higher-order function that wraps an API route handler.
 * CSRF validation is now handled by the proxy (Origin-based), so this
 * simply passes through to the handler.
 *
 * @example
 * ```typescript
 * import { withCsrf } from '@/lib/with-csrf'
 *
 * export const POST = withCsrf(async (request: NextRequest) => {
 *   // Your handler code here — CSRF is already validated by the proxy
 * })
 * ```
 */
export function withCsrf(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    // CSRF protection is now handled by Origin-based validation in the proxy.
    // Simply pass through to the route handler.
    return handler(request, context)
  }
}
