// =============================================================================
// Thiora With-Session Middleware — Validates that a session is still active
// Wraps API route handlers to enforce session-based token validation
// Supports both Authorization header and httpOnly cookie token extraction
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session'
import { extractToken, verifyToken, type AuthPayload } from '@/lib/auth-middleware'

type SessionHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse> | NextResponse

/**
 * Wrap an API route handler with session validation.
 * Extracts the JWT token (from Authorization header or httpOnly cookie),
 * verifies it, then checks that the session has not been revoked in the database.
 *
 * Usage:
 * ```ts
 * import { withSession } from '@/lib/with-session'
 *
 * export const GET = withSession(async (request) => {
 *   // Handler code — session is already validated
 * })
 * ```
 */
export function withSession(handler: SessionHandler): SessionHandler {
  return async (request, context) => {
    // 1. Extract the token from Authorization header or httpOnly cookie
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    // 2. Verify the JWT itself (signature + expiry)
    const payload: AuthPayload | null = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    // 3. Check that the session hasn't been revoked in the database
    const isValidSession = await validateSession(token)
    if (!isValidSession) {
      return NextResponse.json(
        { success: false, error: 'Session expired or revoked' },
        { status: 401 },
      )
    }

    // 4. Session is valid — proceed to the handler
    return handler(request, context)
  }
}
