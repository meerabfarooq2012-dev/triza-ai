// =============================================================================
// Marketo Rate Limiting Utility — In-memory rate limiter
// Tracks requests by IP or userId with configurable window and max requests
// Includes progressive delay for repeated failed attempts and IP+UA fingerprinting
// =============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

/** Tracks failed login attempts for progressive delay */
interface FailedAttemptEntry {
  count: number
  lastAttemptAt: number
}

const limits = new Map<string, RateLimitEntry>()

/** Map of fingerprint -> failed login attempt tracking for progressive delay */
const failedLoginAttempts = new Map<string, FailedAttemptEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limits) {
    if (now > entry.resetTime) limits.delete(key)
  }
  // Clean up stale failed login attempt entries (older than 1 hour)
  for (const [key, entry] of failedLoginAttempts) {
    if (now - entry.lastAttemptAt > 60 * 60 * 1000) failedLoginAttempts.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Check if a request is within rate limits
 * @returns success: true if allowed, remaining requests, and reset time
 */
export function rateLimit(options: {
  windowMs?: number    // time window in milliseconds (default: 15 minutes)
  maxRequests?: number // max requests per window (default: 10)
  key?: string         // custom key (e.g., IP or userId)
}): { success: boolean; remaining: number; resetTime: number } {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 10,
    key = 'global',
  } = options

  const now = Date.now()
  const entry = limits.get(key)

  // No existing entry or window has expired — start fresh
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs
    limits.set(key, { count: 1, resetTime })
    return { success: true, remaining: maxRequests - 1, resetTime }
  }

  // Within the current window — increment count
  entry.count++

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0, resetTime: entry.resetTime }
  }

  return { success: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

/**
 * Extract a rate limit key from a Next.js Request object
 * Uses X-Forwarded-For IP or falls back to 'unknown'
 */
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For may contain multiple IPs; use the first one
    const ip = forwarded.split(',')[0]?.trim()
    if (ip) return `ip:${ip}`
  }
  return 'ip:unknown'
}

/**
 * Generate a fingerprint from the request using IP + User-Agent.
 * This provides more accurate rate limiting by combining both identifiers,
 * making it harder for attackers to bypass rate limits by changing just IP or UA.
 */
export function getRequestFingerprint(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0]?.trim() || 'unknown' : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Combine IP and a truncated UA hash for a stable fingerprint
  // We use a simple combination rather than crypto to keep it fast
  const uaShort = userAgent.slice(0, 64)
  return `${ip}:${uaShort}`
}

/**
 * Get a rate limit key that includes both IP and User-Agent fingerprint.
 * More resistant to IP rotation and UA spoofing than IP alone.
 */
export function getFingerprintedRateLimitKey(request: Request, prefix: string): string {
  const fingerprint = getRequestFingerprint(request)
  return `${prefix}:${fingerprint}`
}

// =============================================================================
// Progressive Delay for Failed Login Attempts
// =============================================================================

/**
 * Record a failed login attempt and return the progressive delay in milliseconds.
 * After 3 failed attempts, the delay doubles with each additional failure:
 * - Attempt 1-2: No delay (0ms)
 * - Attempt 3: 1 second
 * - Attempt 4: 2 seconds
 * - Attempt 5: 4 seconds
 * - Attempt 6: 8 seconds
 * - And so on (exponential backoff, capped at 60 seconds)
 *
 * @param fingerprint - The request fingerprint (IP + User-Agent)
 * @returns The delay in milliseconds that should be applied before processing
 */
export function recordFailedLoginAttempt(fingerprint: string): number {
  const now = Date.now()
  const entry = failedLoginAttempts.get(fingerprint)

  if (!entry || now - entry.lastAttemptAt > 60 * 60 * 1000) {
    // No recent failures or older than 1 hour — start fresh
    failedLoginAttempts.set(fingerprint, { count: 1, lastAttemptAt: now })
    return 0
  }

  entry.count++
  entry.lastAttemptAt = now

  // Progressive delay starts after 3 failures
  if (entry.count >= 3) {
    const exponentialDelay = Math.pow(2, entry.count - 3) * 1000 // 1s, 2s, 4s, 8s...
    return Math.min(exponentialDelay, 60 * 1000) // Cap at 60 seconds
  }

  return 0
}

/**
 * Clear failed login attempts for a fingerprint (called on successful login).
 */
export function clearFailedLoginAttempts(fingerprint: string): void {
  failedLoginAttempts.delete(fingerprint)
}

/**
 * Get the current failed login attempt count for a fingerprint.
 */
export function getFailedLoginAttemptCount(fingerprint: string): number {
  const entry = failedLoginAttempts.get(fingerprint)
  if (!entry || Date.now() - entry.lastAttemptAt > 60 * 60 * 1000) {
    return 0
  }
  return entry.count
}

// =============================================================================
// Convenience presets
// =============================================================================

/** Auth endpoints: 10 requests per 15 minutes (general auth) */
export const authRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 10 }

/** General API: 60 requests per minute */
export const apiRateLimit = { windowMs: 60 * 1000, maxRequests: 60 }

/** Password reset: 5 requests per 15 minutes */
export const passwordResetRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 5 }

/** Login: 5 attempts per 15 minutes (stricter than general auth) */
export const loginRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 5 }

/** Registration: 3 registrations per hour */
export const registerRateLimit = { windowMs: 60 * 60 * 1000, maxRequests: 3 }
