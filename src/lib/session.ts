// =============================================================================
// Marketo Session Management — Token blacklist / session revocation
// Stores SHA-256 hashes of JWT tokens so sessions can be invalidated server-side
// =============================================================================

import { createHash } from 'crypto'
import { db } from '@/lib/db'

const SESSION_THROTTLE_MS = 5 * 60 * 1000 // 5 minutes — only update lastActiveAt this often
const JWT_ACCESS_TOKEN_EXPIRY_MINUTES = 15 // Access token expiry (must match auth-middleware.ts)
const JWT_REFRESH_TOKEN_EXPIRY_DAYS = 7 // Refresh token expiry

/**
 * Hash a JWT token using SHA-256. We NEVER store raw tokens.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Create a new session record after successful login.
 * Only the SHA-256 hash of the token is stored — never the raw JWT.
 */
export async function createSession(
  userId: string,
  token: string,
  deviceInfo?: string,
  ipAddress?: string,
) {
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + JWT_REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  // Clean up expired sessions for this user on each new login
  await cleanExpiredSessions()

  return db.session.create({
    data: {
      userId,
      tokenHash,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      expiresAt,
    },
  })
}

/**
 * Validate that a session is still active and not expired.
 * Throttles lastActiveAt updates to every 5 minutes to reduce DB writes.
 * Returns true if the session is valid, false otherwise.
 */
export async function validateSession(token: string): Promise<boolean> {
  const tokenHash = hashToken(token)

  const session = await db.session.findUnique({
    where: { tokenHash },
  })

  if (!session) return false

  // Check if session has expired
  if (new Date() > session.expiresAt) {
    // Clean up the expired session
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return false
  }

  // Throttled lastActiveAt update — only every 5 minutes
  const throttleThreshold = new Date(Date.now() - SESSION_THROTTLE_MS)
  if (session.lastActiveAt < throttleThreshold) {
    await db.session
      .update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {
        // Silently ignore update failures — the session is still valid
      })
  }

  return true
}

/**
 * Revoke (delete) a specific session by its JWT token.
 * Used when a user logs out.
 */
export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashToken(token)
  await db.session.deleteMany({ where: { tokenHash } })
}

/**
 * Revoke all sessions for a user, optionally keeping the current session.
 * Returns the number of sessions that were revoked.
 */
export async function revokeAllUserSessions(
  userId: string,
  exceptToken?: string,
): Promise<number> {
  if (exceptToken) {
    const currentHash = hashToken(exceptToken)
    const result = await db.session.deleteMany({
      where: {
        userId,
        tokenHash: { not: currentHash },
      },
    })
    return result.count
  }

  const result = await db.session.deleteMany({
    where: { userId },
  })
  return result.count
}

/**
 * Get all active (non-expired) sessions for a user.
 */
export async function getUserSessions(userId: string) {
  const sessions = await db.session.findMany({
    where: { userId },
    orderBy: { lastActiveAt: 'desc' },
  })

  // Filter out expired sessions client-side and clean them up
  const now = new Date()
  const activeSessions = sessions.filter((s) => s.expiresAt > now)

  // Delete expired ones in the background
  const expiredIds = sessions.filter((s) => s.expiresAt <= now).map((s) => s.id)
  if (expiredIds.length > 0) {
    db.session
      .deleteMany({ where: { id: { in: expiredIds } } })
      .catch(() => {})
  }

  return activeSessions
}

/**
 * Delete a specific session by ID.
 * Verifies that the session belongs to the given userId for security.
 * Returns true if a session was deleted, false otherwise.
 */
export async function revokeSessionById(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  const session = await db.session.findFirst({
    where: { id: sessionId, userId },
  })

  if (!session) return false

  await db.session.delete({ where: { id: sessionId } })
  return true
}

/**
 * Clean all expired sessions from the database.
 * Returns the count of cleaned sessions.
 */
export async function cleanExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return result.count
}
