## Task 3 — Critical Security Fixes (Agent: main)

### Summary
Fixed 9 critical security gaps across the Marketo marketplace application covering hardcoded credentials, information leakage, authentication bypass, and production secret enforcement.

### Changes Made

#### Fix 1: Remove hardcoded setup keys — move to env vars
- **`src/app/api/setup/admin/route.ts`**: Replaced hardcoded `marketo-setup-2024` with `process.env.ADMIN_SETUP_KEY`. Returns 503 if env var not set.
- **`src/app/api/admin/sync-schema/route.ts`**: Replaced hardcoded `marketo-sync-schema-2024` with `process.env.ADMIN_SETUP_KEY` in both POST and GET handlers. Returns 503 if env var not set.
- **`src/app/api/db-diagnostic/route.ts`**: Replaced hardcoded `marketo-setup-2024` with admin JWT auth (see Fix 3).

#### Fix 2: Remove admin password from API response
- **`src/app/api/setup/admin/route.ts`**: Removed `credentials: { email, password }` from both the "admin exists" and "admin created" response branches. Response is now `{ success: true, message: "Admin account created/updated successfully" }`.

#### Fix 3: Mask DB diagnostic info
- **`src/app/api/db-diagnostic/route.ts`**: Complete rewrite:
  - Requires admin JWT authentication (via `authenticateRequest`) with admin/both role check — returns 401/403 if unauthorized
  - Masks connection string passwords: `DATABASE_URL_prefix` now shows only first 15 chars
  - Masks `parsedUrl.username` as `'***'` instead of showing actual username
  - Masks hostname to first 15 chars max
  - Removes full connection strings from `rawConnectionTests` results
  - Adds WARNING comments on all `ssl: { rejectUnauthorized: false }` usage noting it's insecure for production
  - Removes references to specific Supabase dashboard URLs in recommendations

#### Fix 4: Fix payment callback GET handler
- **`src/app/api/payments/callback/route.ts`**: Replaced the entire GET handler (which processed payments based on unverified query params) with a 405 Method Not Allowed response. The GET handler previously allowed attackers to call `/api/payments/callback?status=success&orderId=...` to mark payments as successful without cryptographic verification. Only POST callbacks with proper signature verification are now accepted. Also fixed a broken `withCsrf` wrapper on the POST handler (external payment gateways don't send CSRF tokens).

#### Fix 5: JWT production secret enforcement
- **`src/lib/auth-middleware.ts`**: Removed the default/fallback JWT secret `'marketo-dev-secret-change-in-production'`. Now throws a fatal error at module load time if `JWT_SECRET` is not set in production. Only allows the dev fallback in non-production environments. Uses a separate `EFFECTIVE_JWT_SECRET` constant to avoid mutation issues.

#### Fix 6: CSRF secret should not fall back to JWT secret
- **`src/lib/csrf.ts`**: Removed the fallback chain `process.env.CSRF_SECRET || process.env.JWT_SECRET || 'dev-default'`. Now `CSRF_SECRET` must be set independently in production (throws fatal error if not set). Only allows dev fallback in non-production environments. Uses separate `EFFECTIVE_CSRF_SECRET` constant.

#### Fix 7: Remove debug info from login error response
- **`src/app/api/auth/login/route.ts`**: Removed the `debug: errMsg.substring(0, 200)` field from the 500 error response. Also removed the now-unused `errMsg` variable. Response is now simply `{ success: false, error: 'Failed to login' }`.

#### Fix 8: Fix error.tsx and global-error.tsx leaking stack traces
- **`src/app/error.tsx`**: Added `isProduction` check. Error message and digest are only shown in non-production. In production, users see only the generic "An unexpected error occurred" message.
- **`src/app/global-error.tsx`**: Added `isProduction` check. Error message, digest, and stack trace are only shown in non-production. In production, users see only "An unexpected error occurred. Please try again."

#### Fix 9: Remove GET handler from admin setup
- **`src/app/api/setup/admin/route.ts`**: Completely removed the GET handler. Setup is now only available via POST with the setup key in the request body.

### Lint Results
- 0 new errors introduced by this task
- Pre-existing errors in `add-csrf.js` and `verification/review/route.ts` are unrelated
- 3 pre-existing warnings remain unchanged
