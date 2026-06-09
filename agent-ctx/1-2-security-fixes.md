# Task 1-2: Critical Security Fixes

## Summary

Implemented two critical security fixes for the Thiora marketplace:

### Task 1: Remove Hardcoded Setup Key & Admin Password

**Files modified:**

1. **`src/app/api/setup/admin/route.ts`**
   - Replaced hardcoded `'thiora-setup-2024'` with `process.env.ADMIN_SETUP_KEY` (GET and POST handlers)
   - Added fallback: if `ADMIN_SETUP_KEY` env var is not set, logs a warning and returns 503 with error message
   - Replaced hardcoded `'admin@thiora.com'` with `process.env.ADMIN_EMAIL || 'admin@thiora.com'`
   - Replaced hardcoded `'Admin123!'` with `process.env.ADMIN_PASSWORD || generateSecurePassword()` — generates a random 32-char secure password if env var not set, and returns it in the response with a warning
   - Added `import { randomBytes } from 'crypto'` for secure password generation
   - Updated JSDoc comments to reference `<ADMIN_SETUP_KEY>` instead of literal key

2. **`src/app/api/db-diagnostic/route.ts`**
   - Replaced `'thiora-setup-2024'` check with `process.env.ADMIN_SETUP_KEY` check
   - If env var not set or doesn't match, falls back to JWT admin auth
   - Replaced hardcoded `'admin@thiora.com'` with `process.env.ADMIN_EMAIL || 'admin@thiora.com'`
   - Updated JSDoc comments

3. **`src/app/api/health/route.ts`**
   - Replaced `'admin@thiora.com'` with `process.env.ADMIN_EMAIL || 'admin@thiora.com'`
   - Updated recommendation message to reference `<ADMIN_SETUP_KEY>` instead of literal key

4. **`.env.example`**
   - Added `ADMIN_SETUP_KEY=change-this-to-a-random-secret`
   - Added `ADMIN_EMAIL=admin@thiora.com`
   - Added `ADMIN_PASSWORD=` (empty, triggers random generation)

### Task 2: Hash Reset Tokens in DB

**Files modified:**

1. **`src/app/api/auth/forgot-password/route.ts`**
   - Added `import { createHash } from 'crypto'`
   - Added `hashToken()` helper function using SHA-256
   - Changed `resetToken` storage to `hashToken(resetToken)` — stores SHA-256 hash in DB
   - Raw token still sent via email (unchanged behavior for user-facing flow)

2. **`src/app/api/auth/reset-password/route.ts`**
   - Added `import { createHash } from 'crypto'`
   - Added `hashToken()` helper function using SHA-256
   - Changed user lookup from `resetToken: token` to `resetToken: hashToken(token)` — hashes incoming token before comparing

## Verification

- `bun run lint` passes with 0 errors (3 pre-existing warnings unrelated to changes)
- Dev server compiles and runs successfully
