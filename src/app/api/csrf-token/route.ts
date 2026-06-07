// =============================================================================
// CSRF Token API — Generates and serves CSRF tokens (double-submit cookie)
// GET /api/csrf-token → { success: true, token: "..." }
// Sets an HttpOnly cookie for server-side verification.
// The token is also returned in the response body for client-side use
// in the x-csrf-token header (double-submit cookie pattern).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  const token = generateCsrfToken()

  // Determine if the request is over HTTPS
  const isSecure =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:'

  // Use __Host- prefix when on HTTPS (more restrictive cookie prefix)
  const cookieName = isSecure ? '__Host-csrf-token' : 'csrf-token'

  const response = NextResponse.json({
    success: true,
    token,
  })

  // Set the CSRF token as an HttpOnly cookie (inaccessible to JS — prevents XSS exfil)
  // The double-submit pattern works because the client reads the token from the
  // response body and sends it back in the x-csrf-token header on mutating requests.
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour (matches /api/auth/csrf)
  })

  return response
}
