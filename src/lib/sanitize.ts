// =============================================================================
// Marketo Input Sanitization Utilities
// Provides sanitization and validation helpers for user input
// =============================================================================

// ---------------------------------------------------------------------------
// DOMPurify — Lazy-loaded with error handling for Vercel serverless
// isomorphic-dompurify can crash at import time on Vercel serverless if the
// DOM environment is not available. We use dynamic import with a fallback.
// ---------------------------------------------------------------------------

let DOMPurify: typeof import('isomorphic-dompurify').default | null = null
let domPurifyLoadAttempted = false
let domPurifyLoadError: string | null = null

async function loadDOMPurify() {
  if (DOMPurify) return DOMPurify
  if (domPurifyLoadAttempted) return null // Don't retry if it already failed
  domPurifyLoadAttempted = true

  try {
    const mod = await import('isomorphic-dompurify')
    DOMPurify = mod.default || mod
    return DOMPurify
  } catch (error) {
    domPurifyLoadError = error instanceof Error ? error.message : String(error)
    console.error('[sanitize] Failed to load isomorphic-dompurify:', domPurifyLoadError)
    return null
  }
}

// Try to eagerly load DOMPurify (works in Node.js with JSDOM)
// If it fails, sanitizeHtml will use a basic fallback
try {
  // Use require for synchronous loading at module init time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('isomorphic-dompurify')
  DOMPurify = mod.default || mod
} catch {
  // DOMPurify not available — sanitizeHtml will use fallback
  domPurifyLoadAttempted = true
}

// ---------------------------------------------------------------------------
// DOMPurify configuration — applied once and reused by sanitizeHtml
// ---------------------------------------------------------------------------
const ALLOWED_TAGS = [
  'b', 'i', 'em', 'strong', 'a', 'p', 'br',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre', 'span', 'div',
  'img', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
] as const;

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
] as const;

const FORBIDDEN_TAGS = [
  'style', 'script', 'iframe', 'object', 'embed',
  'form', 'input', 'textarea', 'button',
  'base', 'link', 'meta',
] as const;

const FORBIDDEN_ATTR = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
  'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup', 'onkeypress',
  'onchange', 'onsubmit', 'onreset', 'onabort', 'onresize',
] as const;

// Configure DOMPurify with restrictive defaults (applied on every call)
const DOMPURIFY_CONFIG = {
  ALLOW_TAGS: [...ALLOWED_TAGS],
  ALLOW_ATTR: [...ALLOWED_ATTR],
  FORBID_TAGS: [...FORBIDDEN_TAGS],
  FORBID_ATTR: [...FORBIDDEN_ATTR],
  ALLOW_DATA_ATTR: false,
} as const;

// ---------------------------------------------------------------------------
// Basic HTML sanitization fallback — used when DOMPurify is not available
// (e.g., on Vercel serverless if isomorphic-dompurify fails to load)
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

// Sanitize HTML content using DOMPurify (allows basic formatting only)
// Falls back to basic regex-based sanitization if DOMPurify is not available
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''

  if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
    try {
      return DOMPurify.sanitize(input, DOMPURIFY_CONFIG).trim()
    } catch {
      // DOMPurify failed — use fallback
    }
  }

  return basicSanitizeHtml(input)
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
