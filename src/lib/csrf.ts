// =============================================================================
// Marketo CSRF Token Utility — Generate and validate signed CSRF tokens
// Uses HMAC signing with a server-side secret (double-submit cookie pattern)
// =============================================================================

import { createHmac } from 'crypto'

// Derive the CSRF secret from CSRF_SECRET env, or fall back to JWT_SECRET, or a dev default
const CSRF_SECRET =
  process.env.CSRF_SECRET ||
  process.env.JWT_SECRET ||
  'marketo-csrf-dev-secret-change-in-production'

/**
 * Generate a signed CSRF token.
 * Format: `randomId.hmacSignature`
 * The HMAC is computed over the randomId using the server secret.
 */
export function generateCsrfToken(): string {
  const randomId = crypto.randomUUID()
  const signature = createHmac('sha256', CSRF_SECRET)
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

  const expectedSignature = createHmac('sha256', CSRF_SECRET)
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
