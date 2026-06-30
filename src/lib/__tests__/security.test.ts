// =============================================================================
// Tests for src/lib/security.ts
// =============================================================================
// Covers:
//   • isValidId            — alphanumeric + hyphen + underscore only
//   • isValidSqlIdentifier — prevents SQL injection via dynamic table/column names
//   • isValidSqlType       — prevents injection via column type parameter
//   • validateSecret       — length, common words, entropy
//   • createHmacSignature + verifyHmacSignature — round-trip + tamper detection
//   • redactSensitiveFields — tokens/passwords/keys are masked
//   • maskConnectionString — DB URLs have their password hidden
// =============================================================================

import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  isValidId,
  isValidSqlIdentifier,
  isValidSqlType,
  validateSecret,
  createHmacSignature,
  verifyHmacSignature,
  redactSensitiveFields,
  maskConnectionString,
  sanitizeHtml,
  isPrivateIp,
} from '@/lib/security'

// ─── isValidId ─────────────────────────────────────────────────────────────

describe('isValidId', () => {
  it('accepts plain alphanumeric ids', () => {
    expect(isValidId('abc123')).toBe(true)
    expect(isValidId('ABCXYZ')).toBe(true)
    expect(isValidId('000')).toBe(true)
  })

  it('accepts hyphens and underscores (cuid/uuid-style)', () => {
    expect(isValidId('user_123')).toBe(true)
    expect(isValidId('cuid-with-hyphens')).toBe(true)
    expect(isValidId('a_b-c_d-e')).toBe(true)
  })

  it('rejects SQL-injection payloads', () => {
    expect(isValidId("'; DROP TABLE users; --")).toBe(false)
    expect(isValidId('1 OR 1=1')).toBe(false)
    expect(isValidId('admin/*')).toBe(false)
    expect(isValidId('foo;bar')).toBe(false)
  })

  it('rejects empty strings and whitespace', () => {
    expect(isValidId('')).toBe(false)
    expect(isValidId(' ')).toBe(false)
    expect(isValidId('with space')).toBe(false)
  })

  it('rejects special characters', () => {
    expect(isValidId('user@host')).toBe(false)
    expect(isValidId('weird!id')).toBe(false)
    expect(isValidId('a.b.c')).toBe(false)
    expect(isValidId('id/with/slashes')).toBe(false)
  })
})

// ─── isValidSqlIdentifier ──────────────────────────────────────────────────

describe('isValidSqlIdentifier', () => {
  it('accepts valid SQL table/column names', () => {
    expect(isValidSqlIdentifier('users')).toBe(true)
    expect(isValidSqlIdentifier('order_items')).toBe(true)
    expect(isValidSqlIdentifier('_hidden')).toBe(true)
    expect(isValidSqlIdentifier('Column1')).toBe(true)
    expect(isValidSqlIdentifier('a')).toBe(true)
  })

  it('rejects identifiers starting with a digit', () => {
    expect(isValidSqlIdentifier('1users')).toBe(false)
    expect(isValidSqlIdentifier('2_col')).toBe(false)
    expect(isValidSqlIdentifier('9')).toBe(false)
  })

  it('rejects SQL injection attempts', () => {
    expect(isValidSqlIdentifier('users; DROP TABLE users')).toBe(false)
    expect(isValidSqlIdentifier('users--')).toBe(false)
    expect(isValidSqlIdentifier('users WHERE 1=1')).toBe(false)
    expect(isValidSqlIdentifier('users(1)')).toBe(false)
    expect(isValidSqlIdentifier('foo.bar')).toBe(false)
  })

  it('rejects empty strings and whitespace', () => {
    expect(isValidSqlIdentifier('')).toBe(false)
    expect(isValidSqlIdentifier(' ')).toBe(false)
    expect(isValidSqlIdentifier('with space')).toBe(false)
  })

  it('rejects special characters', () => {
    expect(isValidSqlIdentifier('@user')).toBe(false)
    expect(isValidSqlIdentifier('user#')).toBe(false)
    expect(isValidSqlIdentifier('user-name')).toBe(false)
  })
})

// ─── isValidSqlType ────────────────────────────────────────────────────────

describe('isValidSqlType', () => {
  it('accepts plain SQL types', () => {
    expect(isValidSqlType('TEXT')).toBe(true)
    expect(isValidSqlType('INTEGER')).toBe(true)
    expect(isValidSqlType('BOOLEAN')).toBe(true)
    expect(isValidSqlType('UUID')).toBe(true)
    expect(isValidSqlType('TIMESTAMP')).toBe(true)
    expect(isValidSqlType('DATE')).toBe(true)
  })

  it('accepts parameterised types', () => {
    expect(isValidSqlType('VARCHAR(255)')).toBe(true)
    expect(isValidSqlType('CHAR(10)')).toBe(true)
    expect(isValidSqlType('DECIMAL(10,2)')).toBe(true)
    expect(isValidSqlType('NUMERIC(18,4)')).toBe(true)
  })

  it('accepts types with DEFAULT and modifiers', () => {
    expect(isValidSqlType("TEXT DEFAULT 'active'")).toBe(true)
    expect(isValidSqlType('INTEGER DEFAULT 0')).toBe(true)
    expect(isValidSqlType('BOOLEAN DEFAULT true')).toBe(true)
    expect(isValidSqlType('TIMESTAMP DEFAULT CURRENT_TIMESTAMP')).toBe(true)
    expect(isValidSqlType('TEXT NOT NULL')).toBe(true)
    expect(isValidSqlType('INTEGER PRIMARY KEY')).toBe(true)
    expect(isValidSqlType('INTEGER REFERENCES users(id)')).toBe(true)
  })

  it('rejects injection attempts disguised as type strings', () => {
    expect(isValidSqlType("TEXT; DROP TABLE users; --")).toBe(false)
    expect(isValidSqlType("TEXT' OR '1'='1")).toBe(false)
    expect(isValidSqlType('TEXT -- comment')).toBe(false)
    expect(isValidSqlType("TEXT; CREATE TABLE evil(id INT)")).toBe(false)
  })

  it('rejects garbage input', () => {
    expect(isValidSqlType('')).toBe(false)
    expect(isValidSqlType('not a type')).toBe(false)
    expect(isValidSqlType('VARCHAR()')).toBe(false)
    expect(isValidSqlType('VARCHAR(abc)')).toBe(false)
    expect(isValidSqlType('DROP')).toBe(false)
  })
})

// ─── validateSecret ────────────────────────────────────────────────────────

describe('validateSecret', () => {
  // Carefully chosen: 50+ chars, high entropy, no placeholder words.
  const strongSecret = 'xK9$vQ2pL7mR4wT8nB3hY6cF1jD5aZ0eU9iG2oN4s'

  it('passes for a strong secret', () => {
    const result = validateSecret(strongSecret, 'API_TOKEN')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('flags empty / missing secrets', () => {
    const result = validateSecret('', 'JWT_SECRET')
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.issues.some((i) => i.includes('not set'))).toBe(true)
  })

  it('flags secrets shorter than 32 chars', () => {
    const result = validateSecret('shortsecret', 'JWT_SECRET')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('too short'))).toBe(true)
  })

  it('flags secrets containing the word "secret"', () => {
    const result = validateSecret('this-is-my-secret-and-it-is-long-enough-xyz', 'JWT_SECRET')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('common placeholder words'))).toBe(true)
  })

  it('flags secrets containing the word "password"', () => {
    const result = validateSecret('my-password-is-long-and-has-enough-entropy', 'API_KEY')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('common placeholder words'))).toBe(true)
  })

  it('flags secrets containing "changeme"', () => {
    const result = validateSecret('please-changeme-to-something-strong-1234', 'API_KEY')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('common placeholder words'))).toBe(true)
  })

  it('flags secrets with very low entropy (few unique chars)', () => {
    const result = validateSecret('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'API_KEY')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('entropy'))).toBe(true)
  })

  it('reports multiple issues at once', () => {
    // too short, contains "secret", low entropy
    const result = validateSecret('secret', 'JWT_SECRET')
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThanOrEqual(2)
  })

  it('is case-insensitive when detecting placeholder words', () => {
    const result = validateSecret('MY-SECRET-KEY-WITH-ENOUGH-LENGTH-1234', 'API_KEY')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('common placeholder words'))).toBe(true)
  })
})

// ─── HMAC round-trip + tamper detection ────────────────────────────────────

describe('HMAC signature round-trip', () => {
  const secret = 'super-secret-hmac-key-for-tests-only'
  const payload = JSON.stringify({ event: 'payment.completed', orderId: 'order-123' })

  it('verifies a signature produced by createHmacSignature', () => {
    const signature = createHmacSignature(payload, secret)
    expect(signature).toBeTruthy()
    expect(typeof signature).toBe('string')
    expect(verifyHmacSignature(payload, signature, secret)).toBe(true)
  })

  it('rejects a signature for a different payload', () => {
    const signature = createHmacSignature(payload, secret)
    const tampered = JSON.stringify({ event: 'payment.completed', orderId: 'order-999' })
    expect(verifyHmacSignature(tampered, signature, secret)).toBe(false)
  })

  it('rejects a signature produced with a different secret', () => {
    const signature = createHmacSignature(payload, secret)
    expect(verifyHmacSignature(payload, signature, 'wrong-secret')).toBe(false)
  })

  it('rejects a hand-forged signature', () => {
    expect(verifyHmacSignature(payload, 'deadbeef' + '0'.repeat(56), secret)).toBe(false)
  })

  it('returns a hex digest of consistent length', () => {
    const signature = createHmacSignature('hello', secret)
    // SHA-256 HMAC hex = 64 chars
    expect(signature).toHaveLength(64)
    expect(signature).toMatch(/^[0-9a-f]+$/)
  })

  it('rejects signatures of different length without throwing', () => {
    const real = createHmacSignature(payload, secret)
    const shortSig = real.slice(0, 32)
    expect(verifyHmacSignature(payload, shortSig, secret)).toBe(false)
  })
})

// ─── redactSensitiveFields ─────────────────────────────────────────────────

describe('redactSensitiveFields', () => {
  it('redacts obvious password / token / secret fields', () => {
    const input = {
      id: 1,
      name: 'Thiora',
      password: 'hunter2',
      apiToken: 'tok_abc',
      apiKey: 'key_xyz',
      secret: 'shh',
    }
    const out = redactSensitiveFields(input)
    expect(out.id).toBe(1)
    expect(out.name).toBe('Thiora')
    expect(out.password).toBe('***REDACTED***')
    expect(out.apiToken).toBe('***REDACTED***')
    expect(out.apiKey).toBe('***REDACTED***')
    expect(out.secret).toBe('***REDACTED***')
  })

  it('does NOT redact non-sensitive fields', () => {
    const out = redactSensitiveFields({ id: '1', email: 'a@b.com', name: 'x' })
    expect(out.id).toBe('1')
    expect(out.email).toBe('a@b.com')
    expect(out.name).toBe('x')
  })

  it('recurses into nested objects', () => {
    const out = redactSensitiveFields({
      user: { id: 'u1', password: 'pw', profile: { sessionToken: 'st' } },
    })
    expect((out.user as Record<string, unknown>).id).toBe('u1')
    expect((out.user as Record<string, unknown>).password).toBe('***REDACTED***')
    expect(
      ((out.user as Record<string, unknown>).profile as Record<string, unknown>).sessionToken
    ).toBe('***REDACTED***')
  })

  it('handles arrays by treating them as opaque values', () => {
    const out = redactSensitiveFields({ ids: [1, 2, 3] })
    expect(out.ids).toEqual([1, 2, 3])
  })

  it('does not redact empty-string sensitive values (no leak either way)', () => {
    const out = redactSensitiveFields({ password: '' })
    expect(out.password).toBe('')
  })

  it('preserves the type contract', () => {
    const input = { id: '1', email: 'a@b.com', password: 'pw' }
    const out = redactSensitiveFields(input)
    expectTypeOf(out).toMatchTypeOf<Record<string, unknown>>()
    expect(Object.keys(out).sort()).toEqual(['email', 'id', 'password'])
  })

  it('is case-insensitive when matching sensitive keys', () => {
    const out = redactSensitiveFields({ Password: 'p', APIKEY: 'k' })
    expect(out.Password).toBe('***REDACTED***')
    expect(out.APIKEY).toBe('***REDACTED***')
  })
})

// ─── maskConnectionString ──────────────────────────────────────────────────

describe('maskConnectionString', () => {
  it('masks the password in a postgres connection string', () => {
    const masked = maskConnectionString(
      'postgresql://thiora:supersecret@db.example.com:5432/thiora'
    )
    expect(masked).not.toContain('supersecret')
    expect(masked).toContain('***')
    // Username + masked password + host should all be present
    expect(masked).toContain('thiora:***@')
    expect(masked).toContain('db.example.com')
  })

  it('masks the password in a mysql connection string', () => {
    const masked = maskConnectionString('mysql://root:hunter2@localhost:3306/db')
    expect(masked).not.toContain('hunter2')
    expect(masked).toContain('***')
  })

  it('handles URLs without a password gracefully', () => {
    const masked = maskConnectionString('https://api.thiora.com/v1/webhook')
    // No password to mask; URL should still be valid
    expect(masked).toContain('api.thiora.com')
    expect(masked).not.toContain('***')
  })

  it('handles invalid input by masking the middle', () => {
    const masked = maskConnectionString('not-a-url-but-some-long-string-value')
    expect(masked).toContain('***')
    // Should still show first 5 chars
    expect(masked.startsWith('not-a')).toBe(true)
  })

  it('handles very short invalid input', () => {
    const masked = maskConnectionString('short')
    expect(masked).toBe('***')
  })

  it('handles empty input', () => {
    expect(maskConnectionString('')).toBe('***')
  })
})

// ─── bonus: sanitizeHtml + isPrivateIp (quick smoke tests) ─────────────────

describe('sanitizeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
  })
  it('escapes ampersands', () => {
    expect(sanitizeHtml('a & b')).toBe('a &amp; b')
  })
  it('escapes single quotes', () => {
    expect(sanitizeHtml("it's")).toBe('it&#x27;s')
  })
})

describe('isPrivateIp', () => {
  it('recognises loopback addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
    expect(isPrivateIp('::1')).toBe(true)
  })
  it('recognises private ranges', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
    expect(isPrivateIp('192.168.1.1')).toBe(true)
    expect(isPrivateIp('172.16.0.1')).toBe(true)
  })
  it('recognises the "unknown" sentinel', () => {
    expect(isPrivateIp('unknown')).toBe(true)
  })
  it('returns false for public IPs', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
    expect(isPrivateIp('203.0.113.42')).toBe(false)
  })
})
