// =============================================================================
// Marketo JWT Auth Middleware — Token signing, verification, and extraction
// Uses jsonwebtoken for JWT operations
// Supports both access tokens (15 min) and refresh tokens (7 days)
// Supports both Authorization header and httpOnly cookie extraction
// =============================================================================

import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { validateSession } from '@/lib/session'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production')
  }
  // Only allow fallback in development
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'marketo-dev-secret-change-in-production'
const JWT_EXPIRES_IN = '15m' // 15 minutes for access token
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 7 days for refresh token

export interface AuthPayload {
  userId: string
  email: string
  role: string
}

/**
 * Sign a JWT access token with the given payload (15-minute expiry)
 */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, EFFECTIVE_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Sign a JWT refresh token with the given payload (7-day expiry)
 * Includes a `type: 'refresh'` claim to distinguish from access tokens
 */
export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign({ ...payload, type: 'refresh' }, EFFECTIVE_JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

/**
 * Verify a JWT access token
 * @returns the decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as AuthPayload & { type?: string }
    // Access tokens should NOT have type: 'refresh'
    if (decoded.type === 'refresh') return null
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch {
    return null
  }
}

/**
 * Verify a JWT refresh token
 * @returns the decoded payload or null if invalid/expired or not a refresh token
 */
export function verifyRefreshToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as AuthPayload & { type?: string }
    if (decoded.type !== 'refresh') return null
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch {
    return null
  }
}

/**
 * Extract the JWT token from an Authorization header or httpOnly cookie
 * Expected header format: "Bearer <token>"
 * Cookie name: "auth-token"
 */
export function extractToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const parts = authHeader.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1]
    }
  }

  // Fall back to httpOnly cookie
  if ('cookies' in request) {
    const cookieToken = (request as import('next/server').NextRequest).cookies.get('auth-token')?.value
    if (cookieToken) {
      return cookieToken
    }
  }

  return null
}

/**
 * Authenticate a request by extracting and verifying the JWT token
 * @returns the AuthPayload if valid, null otherwise
 */
export function authenticateRequest(request: Request): AuthPayload | null {
  const token = extractToken(request)
  if (!token) return null

  return verifyToken(token)
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

  // Check if the session is still active (not revoked)
  const isValidSession = await validateSession(token)
  if (!isValidSession) return null

  return payload
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

/**
 * Helper to set httpOnly auth cookies on a NextResponse
 * Sets both access token (15 min) and refresh token (7 days) as httpOnly cookies
 */
export function setAuthCookies(
  response: import('next/server').NextResponse,
  token: string,
  refreshToken?: string,
): import('next/server').NextResponse {
  // Set httpOnly cookie for access token (15 min)
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })

  // Set httpOnly cookie for refresh token (7 days)
  if (refreshToken) {
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
  }

  return response
}

/**
 * Helper to clear auth cookies on a NextResponse (for logout)
 */
export function clearAuthCookies(
  response: import('next/server').NextResponse,
): import('next/server').NextResponse {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  response.cookies.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
