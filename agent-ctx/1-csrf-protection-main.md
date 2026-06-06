# Task 1 — CSRF Protection for Marketo Marketplace

## Agent: main

## Summary
Implemented comprehensive CSRF protection using the double-submit cookie pattern. All auth routes (login, register, change-password, reset-password, logout) now require a valid CSRF token for mutating requests.

## Files Created
1. `src/lib/csrf.ts` — CSRF token generation and validation with HMAC-SHA256 signing
2. `src/app/api/auth/csrf/route.ts` — GET endpoint that issues CSRF tokens as HttpOnly cookies
3. `src/lib/with-csrf.ts` — Middleware wrapper for API route handlers
4. `src/hooks/use-csrf.ts` — Client-side hook for CSRF token management

## Files Modified
1. `src/lib/api.ts` — Added CSRF token caching, auto-inclusion in mutating requests, auto-invalidation on 403
2. `src/app/api/auth/login/route.ts` — Wrapped POST with withCsrf()
3. `src/app/api/auth/register/route.ts` — Wrapped POST with withCsrf()
4. `src/app/api/auth/change-password/route.ts` — Wrapped POST with withCsrf()
5. `src/app/api/auth/reset-password/route.ts` — Wrapped POST with withCsrf()
6. `src/app/api/auth/logout/route.ts` — Wrapped POST with withCsrf()

## Key Design Decisions
- Double-submit cookie pattern: token set as HttpOnly cookie AND returned in body
- Client sends token back via `x-csrf-token` header
- Server validates: 1) token signature, 2) header matches cookie
- Timing-safe comparison for HMAC verification
- Auto-caching in API client with deduped concurrent fetches
- Auto-invalidation on CSRF 403 errors for seamless retry

## Test Results
- All 5 auth routes correctly reject requests without CSRF tokens (403)
- Valid double-submit requests pass through successfully
- Mismatched tokens (header ≠ cookie) correctly rejected
