# Task 7 — Security Hardening: Rate Limiting & CSRF

## Agent: security-agent

## Summary
Hardened the Marketo marketplace security by enhancing rate limiting with new presets and progressive delays, adding CSRF protection to 14 unprotected routes, creating a security headers proxy, and extending account lockout duration.

## Key Changes

### 1. Enhanced Rate Limiter (`src/lib/rate-limit.ts`)
- Added `loginRateLimit` preset: 5 attempts / 15 minutes (stricter than general auth)
- Added `registerRateLimit` preset: 3 registrations / hour
- Added `getRequestFingerprint()` — combines IP + User-Agent for more accurate tracking
- Added `getFingerprintedRateLimitKey()` — generates prefixed fingerprint keys
- Added `recordFailedLoginAttempt()` — progressive delay after 3 failures (1s, 2s, 4s... capped at 60s)
- Added `clearFailedLoginAttempts()` — clears on successful login
- Added `getFailedLoginAttemptCount()` — query current failure count

### 2. Login Route Enhancements (`src/app/api/auth/login/route.ts`)
- Switched from `authRateLimit` (10/15min) to `loginRateLimit` (5/15min)
- Uses `getFingerprintedRateLimitKey()` for IP+UA-based rate limiting
- Implements progressive delay before processing login attempts
- Clears failed attempt tracking on successful login
- Extended lockout from 15 to 30 minutes after 5 failed attempts

### 3. Register Route Enhancements (`src/app/api/auth/register/route.ts`)
- Switched from `authRateLimit` (10/15min) to `registerRateLimit` (3/hour)
- Uses `getFingerprintedRateLimitKey()` for fingerprinted rate limiting

### 4. CSRF Protection Added to 14 Routes
All previously unprotected state-changing endpoints now wrapped with `withCsrf`:
- `orders/[id]` — PUT, PATCH
- `payments/verify` — POST
- `users/[id]` — PATCH
- `notifications` — POST, PUT, DELETE
- `notifications/preferences` — PUT
- `addresses` — POST
- `addresses/[id]` — PUT, DELETE
- `social/stories` — POST
- `social/follow` — POST
- `returns/[id]` — PUT
- `returns/[id]/process-refund` — POST
- `disputes/[id]` — PUT
- `disputes/[id]/messages` — POST
- `disputes/[id]/resolve` — POST
- `disputes/[id]/evidence` — POST
- `disputes/[id]/escalate` — POST
- `messages` — POST

### 5. Security Headers Proxy (`src/proxy.ts`)
Next.js 16 uses "proxy" convention instead of "middleware". Created with:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` with self, inline scripts/styles, Supabase images
- Applies to all routes except static assets
- Verified working: all headers present in HTTP responses

### Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to this task)
