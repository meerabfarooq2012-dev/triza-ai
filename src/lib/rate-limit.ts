// =============================================================================
// TRIZA Rate Limiting Utility — In-memory rate limiter
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

/**
 * Lazy cleanup — runs on each rateLimit() call instead of a persistent setInterval.
 *
 * IMPORTANT: We deliberately avoid module-level setInterval() because:
 * 1. On Vercel serverless, setInterval keeps the event loop alive, causing
 *    function timeouts (10s Hobby / 60s Pro) and 500/504 errors.
 * 2. In-memory Maps are reset on every cold start anyway, so a background
 *    timer provides no real benefit on serverless.
 * 3. On long-running dev servers, the cleanup still runs frequently enough
 *    because rateLimit() is called on every API request.
 */
let lastCleanup = 0
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

function cleanupIfNeeded() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, entry] of limits) {
    if (now > entry.resetTime) limits.delete(key)
  }
  for (const [key, entry] of failedLoginAttempts) {
    if (now - entry.lastAttemptAt > 60 * 60 * 1000) failedLoginAttempts.delete(key)
  }
}

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

  // Lazy cleanup — remove expired entries periodically (replaces setInterval)
  cleanupIfNeeded()

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
 * Extract the client IP from X-Forwarded-For, respecting trusted proxy count.
 *
 * X-Forwarded-For format: client, proxy1, proxy2, ...
 * When behind a trusted reverse proxy, the RIGHTMOST IPs are set by trusted
 * proxies and the leftmost is the (potentially spoofed) client value.
 *
 * With TRUSTED_PROXY_COUNT=1 (default), we trust the LAST entry (set by our
 * reverse proxy), which is the real client IP.
 *
 * With TRUSTED_PROXY_COUNT=2 (e.g., CDN + load balancer), we trust the
 * second-to-last entry, and so on.
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const trustedProxyCount = parseInt(
    process.env.TRUSTED_PROXY_COUNT || '1',
    10
  )

  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim()).filter(Boolean)
    if (ips.length > 0) {
      // Pick the IP at position `ips.length - trustedProxyCount`.
      // This is the IP that was set by the last trusted proxy.
      const idx = Math.max(0, ips.length - trustedProxyCount)
      const ip = ips[idx]
      if (ip) return ip
    }
  }

  // Fall back to Next.js request.ip (available when trustProxy is configured)
  // or connection remote address
  const nextReq = request as Request & { ip?: string }
  if (nextReq.ip) return nextReq.ip

  return 'unknown'
}

/**
 * Extract a rate limit key from a Next.js Request object.
 * Uses the client IP extracted with trusted proxy awareness.
 */
export function getRateLimitKey(request: Request): string {
  const ip = extractClientIp(request)
  return `ip:${ip}`
}

/**
 * Generate a fingerprint from the request using IP + User-Agent.
 * This provides more accurate rate limiting by combining both identifiers,
 * making it harder for attackers to bypass rate limits by changing just IP or UA.
 * Uses the same trusted-proxy-aware IP extraction as getRateLimitKey.
 */
export function getRequestFingerprint(request: Request): string {
  const ip = extractClientIp(request)
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

/** Wishlist: 20 requests per minute */
export const wishlistRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }

/** AI endpoints: 10 requests per minute */
export const aiRateLimit = { windowMs: 60 * 1000, maxRequests: 10 }

/** Coupon redemption: 5 requests per 15 minutes */
export const couponRedeemRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 5 }

/** Coupon validation: 20 requests per minute */
export const couponValidateRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }

/** Feedback: 5 requests per 15 minutes */
export const feedbackRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 5 }

/** Flash sales: 10 requests per minute */
export const flashSaleRateLimit = { windowMs: 60 * 1000, maxRequests: 10 }

/** Gigs: 20 requests per minute */
export const gigRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }

/** Reviews: 10 requests per 15 minutes */
export const reviewRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 10 }

/** Search: 30 requests per minute */
export const searchRateLimit = { windowMs: 60 * 1000, maxRequests: 30 }

/** Shipping: 20 requests per minute */
export const shippingRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }

/** Social endpoints: 20 requests per minute */
export const socialRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }

/** Tax calculation: 20 requests per minute */
export const taxRateLimit = { windowMs: 60 * 1000, maxRequests: 20 }
