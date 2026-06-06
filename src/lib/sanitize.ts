// =============================================================================
// Marketo Input Sanitization Utilities
// Provides sanitization and validation helpers for user input
// =============================================================================

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

// Sanitize HTML content (allow basic formatting only)
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
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
