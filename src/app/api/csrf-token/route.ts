// =============================================================================
// CSRF Token API — Generates and serves CSRF tokens
// GET /api/csrf-token → { success: true, token: "..." }
// Sets a cookie for reference, returns token in response body for client use.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  const token = generateCsrfToken()

  const isSecure =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:'

  const response = NextResponse.json({
    success: true,
    token,
  })

  // Set the CSRF token as a cookie
  // Using simple name without __Host- prefix for better compatibility on Vercel
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Client JS needs to read this for double-submit on same-origin
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours (matches JWT access token)
  })

  return response
}
