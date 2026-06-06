# Task 9 — Security Fixes (Agent: main)

## Summary
Fixed three medium-priority security issues: CSRF token endpoint inconsistency, rate limit header spoofing, and error information leakage in API routes.

## Changes Made

### Issue 1: Conflicting CSRF Token Endpoints

**Problem:** Two CSRF token endpoints had different security settings:
- `/api/auth/csrf` — HttpOnly, SameSite=Strict, 1h expiry (SECURE)
- `/api/csrf-token` — NOT HttpOnly, SameSite=Lax, 24h expiry (LESS SECURE)

The non-HttpOnly variant made the CSRF token accessible to JavaScript, partially undermining CSRF protection in case of XSS.

**Fix:**
- **`/api/csrf-token/route.ts`** — Changed cookie settings to match the secure endpoint:
  - `httpOnly: false` → `httpOnly: true`
  - `sameSite: 'lax'` → `sameSite: 'strict'`
  - `maxAge: 86400` (24h) → `maxAge: 3600` (1h, matching `/api/auth/csrf`)
  - Updated comments to reflect the double-submit cookie pattern works via response body
- **`/src/hooks/use-csrf.ts`** — Updated REFRESH_INTERVAL from 23 hours to 50 minutes to stay within the new 1-hour cookie expiry. The hook reads the token from the response body (`data.token`), not the cookie, so the HttpOnly change does not break functionality.

### Issue 2: Rate Limit Header Spoofing

**Problem:** `getRateLimitKey()` in `rate-limit.ts` trusted the FIRST value in `X-Forwarded-For` header, allowing attackers to spoof their IP by sending different values.

**Fix:**
- **`/src/lib/rate-limit.ts`** — Created new `extractClientIp()` function (exported for reuse):
  - Parses `X-Forwarded-For` and trusts the LAST IP based on `TRUSTED_PROXY_COUNT` env variable (default: 1)
  - With `TRUSTED_PROXY_COUNT=1`, the last IP (set by the trusted reverse proxy) is used as the real client IP
  - Falls back to `request.ip` (Next.js) when available
  - Falls back to `'unknown'` when no IP can be determined
- Updated `getRateLimitKey()` to use `extractClientIp()` instead of the insecure `split(',')[0]` pattern
- Updated `getRequestFingerprint()` to use the same trusted-proxy-aware IP extraction
- **`/api/auth/login/route.ts`** and **`/api/auth/register/route.ts`** — Updated direct `X-Forwarded-For` reads for session recording to also use the last IP instead of the first

### Issue 3: Error Information Leakage

**Problem:** Several API routes exposed raw error messages (stack traces, DB query details, internal paths) in 500 responses. In production, this leaks sensitive implementation details.

**Fix:**
- **Created `/src/lib/error-handler.ts`** — New utility module with:
  - `getSafeErrorMessage(error, fallbackMessage?)` — Returns generic message in production, actual error in development
  - `getSafeErrorBody(error, fallbackMessage?)` — Returns a full `{ success: false, error: string }` object

- **Updated 12 critical API routes to use `getSafeErrorMessage`:**

  1. **`/api/auth/login/route.ts`** — Login error
  2. **`/api/auth/register/route.ts`** — Registration error
  3. **`/api/auth/change-password/route.ts`** — Password change error
  4. **`/api/auth/reset-password/route.ts`** — Password reset error
  5. **`/api/auth/forgot-password/route.ts`** — Forgot password error
  6. **`/api/auth/me/route.ts`** — User fetch error
  7. **`/api/admin/settings/route.ts`** — Admin settings GET & PATCH errors
  8. **`/api/admin/sync-schema/route.ts`** — Schema sync error (previously exposed `error.message` directly in 3 places)
  9. **`/api/db-diagnostic/route.ts`** — DB diagnostic error (previously exposed `err.message` directly)
  10. **`/api/orders/route.ts`** — Order list & create errors
  11. **`/api/payments/initiate/route.ts`** — Payment initiation error
  12. **`/api/payments/verify/route.ts`** — Payment verification error
  13. **`/api/payments/route.ts`** — Payment list & create errors

### Environment Variables
- Added `JWT_SECRET` and `CSRF_SECRET` to `.env` (required for CSRF token generation)
- Added `TRUSTED_PROXY_COUNT` (optional, default: 1) — determines how many proxies to trust for IP extraction

### Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to this task)
