// =============================================================================
// Thiora Security Utilities — Input validation, sanitization, and protection
// Provides reusable security functions for all API routes
// =============================================================================

import { createHmac } from 'crypto'

// =============================================================================
// Input Validation — Prevent injection attacks
// =============================================================================

/**
 * Validate that a string identifier is safe for database queries.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Prevents SQL injection even in raw query contexts.
 */
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id)
}

/**
 * Validate that a table name is safe for use in raw SQL queries.
 * Only allows alphanumeric characters and underscores.
 * This is used by sync-schema which needs dynamic table/column names.
 */
export function isValidSqlIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

/**
 * Validate SQL column type string to prevent injection via type parameter.
 * Only allows common SQL types and their modifiers.
 */
export function isValidSqlType(type: string): boolean {
  // Allow: TEXT, INTEGER, BOOLEAN, DOUBLE PRECISION, TIMESTAMP, VARCHAR(n), DEFAULT 'value', etc.
  const safeTypePattern = /^(TEXT|INTEGER|INT|BIGINT|BOOLEAN|BOOL|DOUBLE\s+PRECISION|DOUBLE|FLOAT|REAL|TIMESTAMP|TIMESTAMPTZ|DATE|TIME|VARCHAR\(\d+\)|CHAR\(\d+\)|DECIMAL\(\d+,\d+\)|NUMERIC\(\d+,\d+\)|UUID|JSON|JSONB|BYTEA|BLOB|SERIAL|BIGSERIAL)(\s+DEFAULT\s+('[^']*'|\d+(\.\d+)?|true|false|NULL|CURRENT_TIMESTAMP|NOW\(\)))?(\s+(NOT\s+NULL|NULL|PRIMARY\s+KEY|UNIQUE|REFERENCES\s+\w+\(\w+\)))?$/i
  return safeTypePattern.test(type.trim())
}

/**
 * Sanitize a string for safe use in HTML output (prevents XSS).
 * Use this when rendering user input in HTML responses.
 */
export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Sanitize a string for safe use in URL parameters.
 */
export function sanitizeUrlParam(str: string): string {
  return encodeURIComponent(str)
}

// =============================================================================
// Rate Limiting Helpers — Brute Force Protection
// =============================================================================

/**
 * Check if an IP address is from a private/reserved range.
 * Useful for distinguishing between internal and external requests.
 */
export function isPrivateIp(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'unknown' ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('fc') ||
    ip.startsWith('fd')
  )
}

// =============================================================================
// Secret Validation — Ensure secrets are properly configured
// =============================================================================

/**
 * Validate that a secret meets minimum security requirements.
 * Returns { valid: boolean, issues: string[] } with specific problems.
 */
export function validateSecret(secret: string, name: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  if (!secret) {
    issues.push(`${name} is not set`)
  } else {
    if (secret.length < 32) {
      issues.push(`${name} is too short (minimum 32 characters, got ${secret.length})`)
    }
    if (secret.toLowerCase().includes('secret') || secret.toLowerCase().includes('password') || secret.toLowerCase().includes('changeme')) {
      issues.push(`${name} contains common placeholder words`)
    }
    // Check for too many repeated characters (might be auto-generated but weak)
    const uniqueChars = new Set(secret).size
    if (uniqueChars < 8) {
      issues.push(`${name} has very low entropy (only ${uniqueChars} unique characters)`)
    }
  }

  return { valid: issues.length === 0, issues }
}

/**
 * Run a startup security check and log warnings for misconfigured secrets.
 * Call this once during app initialization.
 */
export function runSecurityChecks(): void {
  const criticalSecrets = [
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
    { name: 'ADMIN_SETUP_KEY', value: process.env.ADMIN_SETUP_KEY },
  ]

  for (const { name, value } of criticalSecrets) {
    if (!value) {
      console.warn(`[SECURITY] ⚠️ ${name} is NOT set! This is a security risk.`)
    } else {
      const result = validateSecret(value, name)
      if (!result.valid) {
        console.warn(`[SECURITY] ⚠️ ${name} has issues: ${result.issues.join(', ')}`)
      }
    }
  }

  // Check for production-specific concerns
  if (process.env.NODE_ENV === 'production') {
    if (process.env.PAYMENT_GATEWAY_MODE === 'sandbox') {
      console.error('[SECURITY] 🔴 CRITICAL: PAYMENT_GATEWAY_MODE is set to "sandbox" in production! Payments will be free!')
    }
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.warn('[SECURITY] ⚠️ VAPID keys not set in production — push notifications will break on cold starts')
    }
  }
}

// =============================================================================
// HMAC Verification — Webhook & Callback Integrity
// =============================================================================

/**
 * Create an HMAC signature for data integrity verification.
 * Used for webhook callbacks, payment verification, etc.
 */
export function createHmacSignature(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

/**
 * Verify an HMAC signature using timing-safe comparison.
 * Prevents timing attacks that could reveal the signature.
 */
export function verifyHmacSignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmacSignature(data, secret)

  // Timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }
  return result === 0
}

// =============================================================================
// Data Redaction — Prevent sensitive data leakage in logs/responses
// =============================================================================

/** Fields that should be redacted in logs and API responses */
const SENSITIVE_FIELD_PATTERNS = [
  'password', 'secret', 'token', 'key', 'auth', 'credential',
  'cardnumber', 'cvv', 'pin', 'private', 'hash', 'signature',
  'cookie', 'session', 'apikey', 'accesstoken', 'refreshtoken',
]

/**
 * Redact sensitive fields from an object before logging.
 * Returns a new object with sensitive values replaced by '***REDACTED***'.
 */
export function redactSensitiveFields<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const redacted: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELD_PATTERNS.some(pattern => lowerKey.includes(pattern))

    if (isSensitive && typeof value === 'string' && value.length > 0) {
      redacted[key] = '***REDACTED***'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitiveFields(value as Record<string, unknown>)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Mask a connection string (like DATABASE_URL) to hide the password.
 * Example: postgresql://user:secret@host/db → postgresql://user:***@host/db
 */
export function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.password) {
      parsed.password = '***'
    }
    return parsed.toString()
  } catch {
    // Not a valid URL — mask the middle portion
    if (url.length > 10) {
      return url.substring(0, 5) + '***' + url.substring(url.length - 5)
    }
    return '***'
  }
}

// =============================================================================
// Environment Security — Validate production configuration
// =============================================================================

/**
 * Check if the current environment is production-like.
 */
export function isProductionLike(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL
}

/**
 * Get the security level of the current configuration.
 * Returns 'critical', 'warning', or 'ok'.
 */
export function getSecurityLevel(): 'critical' | 'warning' | 'ok' {
  // Critical issues that must be fixed
  if (!process.env.JWT_SECRET) return 'critical'
  if (isProductionLike() && process.env.PAYMENT_GATEWAY_MODE === 'sandbox') return 'critical'

  // Warnings that should be addressed
  if (isProductionLike() && (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY)) return 'warning'
  if (isProductionLike() && !process.env.ADMIN_SETUP_KEY) return 'warning'

  return 'ok'
}
