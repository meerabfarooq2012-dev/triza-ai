# Task 2 — Fix Session Validation in Auth Middleware

**Agent**: full-stack-developer
**Date**: 2025-03-05

## Summary

Fixed the critical bug where `authenticateRequest` only verified JWT signatures without checking if sessions were revoked in the database. This meant revoked sessions' JWTs continued working until natural expiration (7 days), defeating the purpose of session revocation.

## Changes Made

### 1. `src/lib/auth-middleware.ts`
- Added import of `validateSession` from `@/lib/session`
- Created new async function `authenticateRequestWithSession` that:
  - Extracts and verifies JWT token (reusing existing `extractToken` + `verifyToken`)
  - Validates the session is still active via `validateSession(token)` (checks DB for revoked sessions)
  - Returns `AuthPayload` only if both checks pass; `null` otherwise
- Kept original `authenticateRequest` function unchanged for backward compatibility

### 2. Critical API Routes Updated (7 routes)

| Route | Change |
|-------|--------|
| `src/app/api/auth/change-password/route.ts` | `authenticateRequest` → `authenticateRequestWithSession` (with `await`) |
| `src/app/api/users/delete/route.ts` | `authenticateRequest` → `authenticateRequestWithSession` (with `await`) |
| `src/app/api/users/[id]/route.ts` | `authenticateRequest` → `authenticateRequestWithSession` for PATCH method (with `await`) |
| `src/app/api/payments/initiate/route.ts` | Added `authenticateRequestWithSession` import + auth check + buyer ID verification |
| `src/app/api/orders/route.ts` | Added `authenticateRequestWithSession` import + auth check for POST + buyer ID verification |
| `src/app/api/auth/sessions/route.ts` | `authenticateRequest` → `authenticateRequestWithSession` for GET and DELETE (with `await`) |
| `src/app/api/auth/sessions/[id]/route.ts` | `authenticateRequest` → `authenticateRequestWithSession` for DELETE (with `await`) |

### 3. Register Route — Session Creation
- `src/app/api/auth/register/route.ts` — Added `createSession` call after JWT token generation
  - Imported `createSession` from `@/lib/session`
  - Extracts user-agent and IP from request headers (matching login route pattern)
  - Uses `.catch()` to not block registration if session creation fails

## Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to changes)
- All modified files pass ESLint cleanly
