# Task 7-9: Security Fixes — Work Record

## Task 7: Amount Verification on Payment Callbacks + Rate Limiting

### File: `src/app/api/payments/callback/route.ts`

**Changes:**
1. **Rate Limiting** — Added import of `rateLimit` and `getRateLimitKey` from `@/lib/rate-limit`. Applied rate limiting at the top of the POST handler: max 30 requests per minute per IP. Returns 429 with `Retry-After` header when exceeded.

2. **Amount Verification** — After finding the payment record in the DB (and before processing), added verification that the `amount` from the callback matches the `amount` stored in the payment record. Both amounts are rounded to 2 decimal places for comparison. If amounts don't match:
   - Logs a `SECURITY WARNING` with payment ID, order ID, both amounts, and the requester's IP
   - Returns 400 with `'Amount verification failed'`
   - This prevents amount tampering attacks where an attacker modifies callback payment amounts

---

## Task 8: Tighten CSP & CORS Configuration

### File: `src/proxy.ts`

**Changes:**
1. **img-src tightened** — Changed from `['self', 'data:', 'blob:', 'https:']` to `['self', 'data:', 'blob:', 'https://*.supabase.co']`. Removed broad `https:` wildcard; now only allows Supabase storage URL pattern plus specific domain if configured.

2. **connect-src tightened** — Changed from `['self', 'ws:', 'wss:', 'https:', 'http:']` to `['self', 'https://*.supabase.co', 'wss:', NEXT_PUBLIC_APP_URL || 'https://thiora.vercel.app']`. Removed broad `https:` and `http:` wildcards.

3. **Nonce-based CSP comment** — Added TODO comment on the prod `script-src` line noting that nonce-based CSP is the future goal.

### File: `src/lib/cors.ts`

**Changes:**
1. **Removed wildcard `.vercel.app` allowance** — The old `origin.endsWith('.vercel.app')` check was removed, which allowed any Vercel deployment to make cross-origin requests.

2. **Added specific origins** — Now explicitly allows:
   - `FRONTEND_URL` env var
   - `NEXT_PUBLIC_APP_URL` env var  
   - `https://thiora.vercel.app` (explicit)
   - `ADDITIONAL_CORS_ORIGINS` env var (comma-separated) for extensibility

3. **Added comments** explaining how to add more origins via env var.

---

## Task 9: Environment Variable Validation on Startup

### File: `src/lib/env-validation.ts` (NEW)

Created the environment validation module with:
- `EnvVarConfig` interface with `name`, `required`, `description`, and optional `validate` function
- 12 environment variables configured (6 required, 6 optional)
- `JWT_SECRET` has a custom validator requiring minimum 32 characters
- `validateEnvironment()` function that runs once (idempotent via `validated` flag)
- Reports missing required vars and invalid vars separately
- `getValidationResults()` for programmatic access

### File: `src/instrumentation.ts`

**Changes:**
- Added env validation call at the top of `register()`, gated by `NEXT_RUNTIME === 'nodejs'`
- Uses dynamic import to avoid Edge Runtime issues
- Runs before mini-service spawning

## Verification
- Lint check: 0 errors, 3 pre-existing warnings (unrelated)
- Dev server: Running successfully, no errors
