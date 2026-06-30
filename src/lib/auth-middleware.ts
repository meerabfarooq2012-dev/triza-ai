// =============================================================================
// TRIZA JWT Auth Middleware — Token signing, verification, and extraction
// Uses jsonwebtoken for JWT operations
// =============================================================================

import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { validateSession } from '@/lib/session'

// Lazy initialization: do NOT throw at module import time.
// On Vercel, a missing env var at import time would crash the entire route handler
// and cause Next.js to return an HTML error page instead of JSON.
let _jwtSecret: string | undefined
function getJwtSecret(): string {
  if (!_jwtSecret) {
    _jwtSecret = process.env.JWT_SECRET
  }
  if (!_jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return _jwtSecret
}
const JWT_EXPIRES_IN = '24h' // 24 hours (balanced security + UX)
const REFRESH_TOKEN_EXPIRES_IN = '30d' // 30 days

export interface AuthPayload {
  userId: string
  email: string
  role: string
  twoFactorPending?: boolean
}

/**
 * Sign a JWT token with the given payload
 */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify a JWT token
 * @returns the decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Extract the JWT token from an Authorization header or httpOnly cookie
 * Expected format: "Bearer <token>" or cookie "auth-token=<value>"
 */
export function extractToken(request: Request): string | null {
  // 1. Check Authorization header first (preferred)
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const parts = authHeader.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1]
    }
  }

  // 2. Fallback: check httpOnly cookie (auth-token)
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';')
    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith('auth-token=')) {
        const token = trimmed.slice('auth-token='.length)
        if (token) return token
      }
    }
  }

  return null
}

/**
 * Authenticate a request by extracting and verifying the JWT token
 * @returns the AuthPayload if valid, null otherwise
 */
export async function authenticateRequest(request: Request): Promise<AuthPayload | null> {
  const token = extractToken(request)
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) {
    // Token expired or invalid — try refresh token
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      for (const cookie of cookies) {
        const trimmed = cookie.trim()
        if (trimmed.startsWith('refresh-token=')) {
          const refreshToken = trimmed.slice('refresh-token='.length)
          if (refreshToken) {
            const refreshedPayload = verifyRefreshToken(refreshToken)
            if (refreshedPayload && !refreshedPayload.twoFactorPending) {
              return refreshedPayload
            }
          }
        }
      }
    }
    return null
  }

  // Reject tokens that still have 2FA pending
  if (decoded.twoFactorPending) {
    return null
  }

  return decoded
}

/**
 * Authenticate a request by extracting and verifying the JWT token,
 * AND validating that the session is still active (not revoked) in the database.
 * Use this for critical endpoints where revoked sessions must be rejected immediately.
 * @returns the AuthPayload if valid and session is active, null otherwise
 */
export async function authenticateRequestWithSession(request: Request): Promise<AuthPayload | null> {
  const token = extractToken(request)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // Reject tokens that still have 2FA pending
  if (payload.twoFactorPending) {
    return null
  }

  // Check if the session is still active (not revoked)
  const isValidSession = await validateSession(token)
  if (!isValidSession) return null

  return payload
}

/**
 * Sign a refresh token with the given payload
 */
export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

/**
 * Verify a refresh token
 * @returns the decoded payload or null if invalid/expired
 */
export function verifyRefreshToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Set authentication cookies on a NextResponse object
 * Sets httpOnly cookies for both access token and refresh token
 */
export function setAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => unknown } },
  token: string,
  refreshToken?: string
): void {
  const isSecure = process.env.NODE_ENV === 'production'

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  })

  if (refreshToken) {
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
  }
}

/**
 * Clear authentication cookies on a NextResponse object
 */
export function clearAuthCookies(
  response: { cookies: { delete: (name: string) => unknown } }
): void {
  response.cookies.delete('auth-token')
  response.cookies.delete('refresh-token')
}

/**
 * Generate a random hex string for password reset tokens
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Generate a reset token expiry timestamp (1 hour from now)
 */
export function generateResetExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1)
  return expiry
}
