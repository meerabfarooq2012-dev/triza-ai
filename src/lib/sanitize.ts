// =============================================================================
// TRIZA Input Sanitization Utilities
// Provides sanitization and validation helpers for user input
//
// IMPORTANT: This module must NOT have any module-level code that can crash.
// It is imported by the login route, and any module-level crash will cause
// Vercel to return an HTML 500 error page instead of JSON.
//
// isomorphic-dompurify is NOT eagerly loaded — it requires jsdom which can
// crash on Vercel serverless. We use a basic regex-based fallback instead.
// If DOMPurify is needed for rich HTML, use loadDOMPurify() + purifyHtml().
// =============================================================================

// ---------------------------------------------------------------------------
// DOMPurify — Lazy async loading only (never at module init time)
// ---------------------------------------------------------------------------

let DOMPurifyInstance: { sanitize: (input: string, config: Record<string, unknown>) => string } | null = null
let domPurifyLoaded = false

/**
 * Async load DOMPurify. Returns true if loaded successfully.
 * Call this before using purifyHtml(). Safe to call multiple times.
 */
export async function loadDOMPurify(): Promise<boolean> {
  if (DOMPurifyInstance) return true
  if (domPurifyLoaded) return false // Already tried and failed
  domPurifyLoaded = true

  try {
    const mod = await import('isomorphic-dompurify')
    const dp = mod.default || mod
    if (dp && typeof dp.sanitize === 'function') {
      DOMPurifyInstance = dp
      return true
    }
    return false
  } catch {
    // DOMPurify not available (expected on Vercel serverless)
    return false
  }
}

// ---------------------------------------------------------------------------
// DOMPurify configuration
// ---------------------------------------------------------------------------
const DOMPURIFY_CONFIG = {
  ALLOW_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'span', 'div',
    'img', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOW_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'base', 'link', 'meta'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup', 'onkeypress', 'onchange', 'onsubmit', 'onreset', 'onabort', 'onresize'],
  ALLOW_DATA_ATTR: false,
}

// ---------------------------------------------------------------------------
// Basic HTML sanitization fallback — always available, no external deps
// ---------------------------------------------------------------------------

function basicSanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*\S+/gi, '')
    // Remove dangerous tags
    .replace(/<(iframe|object|embed|form|input|textarea|button|base|link|meta|style)\b[^>]*>/gi, '')
    .replace(/<\/(iframe|object|embed|form|input|textarea|button|base|link|meta|style)>/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '')
    .trim()
}

/**
 * Sanitize HTML content — uses DOMPurify if loaded, otherwise basic regex fallback.
 * This is synchronous and always safe to call.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''

  if (DOMPurifyInstance) {
    try {
      return DOMPurifyInstance.sanitize(input, DOMPURIFY_CONFIG).trim()
    } catch {
      // DOMPurify failed — fall through to basic fallback
    }
  }

  return basicSanitizeHtml(input)
}

/**
 * Async HTML sanitization — loads DOMPurify first, then sanitizes.
 * Use this for rich HTML content where DOMPurify provides better protection.
 * Falls back to basic sanitization if DOMPurify is unavailable.
 */
export async function purifyHtml(input: string): Promise<string> {
  await loadDOMPurify()
  return sanitizeHtml(input)
}

// Sanitize string input to prevent XSS
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('At least 1 lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('At least 1 number')
  return { valid: errors.length === 0, errors }
}

// Normalize email (lowercase, trim)
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Validate positive number
export function isPositiveNumber(value: unknown): boolean {
  const num = parseFloat(String(value))
  return !isNaN(num) && num > 0 && isFinite(value as number)
}

// ---------------------------------------------------------------------------
// URL Sanitization — ensure only safe protocols are allowed
// ---------------------------------------------------------------------------

/** Allowed URL protocols (lowercased, with trailing colon) */
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/** Dangerous protocols that must be blocked */
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:']

/**
 * Sanitize a URL by ensuring it uses only safe protocols.
 *
 * - Allows: `http://`, `https://`, `mailto:` and relative URLs (no protocol)
 * - Blocks: `javascript:`, `data:`, `vbscript:` and any other dangerous schemes
 * - Strips leading/trailing whitespace and normalises the scheme to lowercase
 *
 * @param url - The URL string to validate
 * @returns The cleaned URL if safe, or an empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''

  const trimmed = url.trim()
  if (trimmed === '') return ''

  // Check for dangerous protocols (case-insensitive, tolerate whitespace in scheme)
  const normalised = trimmed.replace(/^[\s\x00-\x1f]+/, '') // strip leading control chars
  const lower = normalised.toLowerCase()

  for (const proto of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(proto)) return ''
  }

  // If the URL has a scheme, verify it's in the safe list
  const schemeMatch = lower.match(/^([a-z][a-z0-9+.-]*):/)
  if (schemeMatch) {
    const scheme = schemeMatch[1] + ':'
    if (!SAFE_PROTOCOLS.has(scheme)) return ''
  }

  // Return the original trimmed URL (preserves case in path/query)
  return trimmed
}
