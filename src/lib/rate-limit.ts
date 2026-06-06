// =============================================================================
// Marketo Rate Limiting Utility — In-memory rate limiter
// Tracks requests by IP or userId with configurable window and max requests
// =============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const limits = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limits) {
    if (now > entry.resetTime) limits.delete(key)
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

// =============================================================================
// Convenience presets
// =============================================================================

/** Auth endpoints: 10 requests per 15 minutes */
export const authRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 10 }

/** General API: 60 requests per minute */
export const apiRateLimit = { windowMs: 60 * 1000, maxRequests: 60 }

/** Password reset: 5 requests per 15 minutes */
export const passwordResetRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 5 }
