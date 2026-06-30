// =============================================================================
// TRIZA CSRF Token Utility — Generate and validate signed CSRF tokens
// Uses HMAC signing with a server-side secret (double-submit cookie pattern)
// =============================================================================

import { createHmac } from 'crypto'

// Lazy initialization: do NOT throw at module import time.
// On Vercel, a missing env var at import time would crash the entire route handler
// and cause Next.js to return an HTML error page instead of JSON.
let _csrfSecret: string | undefined
function getCsrfSecret(): string {
  if (!_csrfSecret) {
    _csrfSecret = process.env.CSRF_SECRET || process.env.JWT_SECRET
  }
  if (!_csrfSecret) {
    throw new Error('CSRF_SECRET or JWT_SECRET environment variable must be set')
  }
  return _csrfSecret
}

/**
 * Generate a signed CSRF token.
 * Format: `randomId.hmacSignature`
 * The HMAC is computed over the randomId using the server secret.
 */
export function generateCsrfToken(): string {
  const randomId = crypto.randomUUID()
  const signature = createHmac('sha256', getCsrfSecret())
    .update(randomId)
    .digest('hex')
  return `${randomId}.${signature}`
}

/**
 * Validate a CSRF token by verifying its HMAC signature.
 * @returns true if the token is valid, false otherwise
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [randomId, signature] = parts
  if (!randomId || !signature) return false

  const expectedSignature = createHmac('sha256', getCsrfSecret())
    .update(randomId)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return false

  let mismatch = 0
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }

  return mismatch === 0
}
