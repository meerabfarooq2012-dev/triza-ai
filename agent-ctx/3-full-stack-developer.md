# Task 3: Apply CSRF Protection to All Critical Mutating Routes

## Agent: full-stack-developer

## Summary
Applied `withCsrf` wrapper from `@/lib/with-csrf` to all 10 mutating route handlers that were missing CSRF protection. 11 routes already had protection and were skipped.

## Routes Updated (10)
1. `src/app/api/auth/forgot-password/route.ts` — POST
2. `src/app/api/auth/resend-verification/route.ts` — POST
3. `src/app/api/auth/verify-email/route.ts` — POST
4. `src/app/api/payments/initiate/route.ts` — POST
5. `src/app/api/coupons/apply/route.ts` — POST
6. `src/app/api/coupons/redeem/route.ts` — POST
7. `src/app/api/wishlist/route.ts` — POST (GET left unwrapped)
8. `src/app/api/favorites/toggle/route.ts` — POST
9. `src/app/api/cart/route.ts` — DELETE (no POST exists in this route)
10. `src/app/api/messages/conversations/create/route.ts` — POST

## Routes Already Protected (11 — no changes)
- auth/reset-password, auth/2fa/setup, auth/2fa/verify, auth/2fa/disable, auth/2fa/backup-codes
- orders, reviews, disputes, returns, feedback, upload

## Pattern Applied
Converted `export async function POST(request: NextRequest) {` to `export const POST = withCsrf(async (request: NextRequest) => {` and closing `}` to `})`.

## Verification
- ESLint: 0 errors
- Dev server: no compile errors
