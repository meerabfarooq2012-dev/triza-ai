// =============================================================================
// CSRF Token API — Generates and serves CSRF tokens (double-submit cookie)
// GET /api/csrf-token → { success: true, token: "..." }
// Sets a non-HttpOnly cookie so JS can read it for the x-csrf-token header.
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

  // Set the CSRF token as a cookie (non-HttpOnly so JS can read it)
  response.cookies.set(cookieName, token, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  })

  return response
}
