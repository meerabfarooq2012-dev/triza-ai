# Task 8 — Zod Input Validation for Critical API Routes

## Agent: main
## Date: 2025-03-04

## Summary
Added centralized Zod input validation to all critical API routes. Created a shared validation schemas file and integrated Zod validation into 6 security-critical routes, replacing error-prone manual field checks with type-safe schema validation.

## Files Created
- `src/lib/validation.ts` — Central validation schemas and `validateInput<T>()` helper

## Files Modified
- `src/app/api/auth/login/route.ts` — Added `loginSchema` validation
- `src/app/api/auth/register/route.ts` — Added `registerSchema` validation
- `src/app/api/auth/forgot-password/route.ts` — Added `forgotPasswordSchema` validation
- `src/app/api/auth/reset-password/route.ts` — Added `resetPasswordSchema` validation
- `src/app/api/auth/change-password/route.ts` — Added `changePasswordSchema` validation
- `src/app/api/orders/route.ts` — Added `orderCreateSchema` validation to POST handler

## Key Decisions
- Used `z.ZodType<T>` instead of `z.ZodSchema<T>` for Zod v4 compatibility
- Password minimums increased from 6 to 8 chars where Zod replaced manual checks
- Kept existing domain-specific checks (isValidEmail, isStrongPassword, termsAccepted) as defense in depth
- Token validation enforces min 32 chars (matching `randomBytes(32).toString('hex')` output)
- All schemas use `.max()` constraints to prevent oversized payload attacks

## Lint: 0 errors, 3 pre-existing warnings (unrelated)
