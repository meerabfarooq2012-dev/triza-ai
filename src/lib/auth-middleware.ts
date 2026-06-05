// =============================================================================
// Marketo JWT Auth Middleware — Token signing, verification, and extraction
// Uses jsonwebtoken for JWT operations
// =============================================================================

import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { validateSession } from '@/lib/session'

const JWT_SECRET = process.env.JWT_SECRET || 'marketo-dev-secret-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7 days

export interface AuthPayload {
  userId: string
  email: string
  role: string
}

/**
 * Sign a JWT token with the given payload
 */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify a JWT token
 * @returns the decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Extract the JWT token from an Authorization header
 * Expected format: "Bearer <token>"
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
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
