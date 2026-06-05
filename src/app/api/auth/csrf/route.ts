import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

/**
 * GET /api/auth/csrf
 * Generates a CSRF token and sets it as an HttpOnly cookie.
 * Also returns the token in the response body for client-side storage.
 *
 * Uses the double-submit cookie pattern:
 * - The token is set as an HttpOnly, SameSite=Strict cookie (server can verify)
 * - The token is also returned in the body (client sends it back in headers)
 */
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

  // Set the CSRF token as an HttpOnly cookie
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })

  return response
}
