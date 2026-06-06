// =============================================================================
// Marketo Input Sanitization Utilities
// Provides sanitization and validation helpers for user input
// =============================================================================

import DOMPurify from 'isomorphic-dompurify';

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

// DOMPurify will strip all on* event-handler attributes when FORBID_ATTR
// includes the wildcard pattern. We also list the most common ones explicitly
// so the intent is clear even if the wildcard behaviour changes.
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
  // Strip the style attribute from all tags to prevent CSS injection
  FORBID_ATTR_STYLES: undefined, // handled via hook below
} as const;

// Add a hook to strip the `style` attribute from every element — this is more
// reliable than listing it in FORBID_ATTR because DOMPurify's FORBID_ATTR
// handling can vary across versions for the `style` attribute specifically.
DOMPurify.addHook('uponSanitizeElement', (_node, data) => {
  // DOMPurify passes the element as `data.node` in some hooks; the node
  // itself is the first argument for element-level hooks in isomorphic-dompurify.
  // We handle both to be safe.
  const el = (_node as Element | undefined) ?? (data as Record<string, unknown>).node as Element | undefined;
  if (el && typeof el.removeAttribute === 'function') {
    el.removeAttribute('style');
  }
});

// Sanitize HTML content using DOMPurify (allows basic formatting only)
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  return DOMPurify.sanitize(input, DOMPURIFY_CONFIG).trim()
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
  return !isNaN(num) && num > 0 && isFinite(num)
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
