# Task 3 — Apply CSRF Protection to More API Routes

**Agent:** main  
**Status:** Completed  
**Date:** 2025-03-04

## Summary
Extended CSRF protection to 12 additional API routes, created a new `/api/csrf-token` endpoint with non-HttpOnly cookies (double-submit pattern), rewrote the `useCsrf` hook with `useSyncExternalStore` for hydration safety and auto-refresh, and updated the API client to read CSRF tokens from cookies with fallback fetching.

## Files Created
- `src/app/api/csrf-token/route.ts` — New CSRF token endpoint (non-HttpOnly cookie, Lax SameSite, 24h max-age)

## Files Modified
- `src/hooks/use-csrf.ts` — Rewritten with useSyncExternalStore, auto-refresh every 23h, fetches from /api/csrf-token
- `src/lib/api.ts` — Added readCsrfCookie(), withCsrfHeaders(); updated direct fetch calls (upload, avatar, deleteAccount) to include CSRF headers
- `src/app/api/orders/route.ts` — POST wrapped with withCsrf
- `src/app/api/products/route.ts` — POST wrapped with withCsrf
- `src/app/api/products/[id]/route.ts` — PUT, PATCH, DELETE wrapped with withCsrf; extracted handleUpdateProduct
- `src/app/api/shops/route.ts` — POST wrapped with withCsrf
- `src/app/api/shops/[slug]/route.ts` — PUT, PATCH, DELETE wrapped with withCsrf; extracted handleUpdateShop; added PATCH handler
- `src/app/api/withdrawals/route.ts` — POST wrapped with withCsrf
- `src/app/api/disputes/route.ts` — POST wrapped with withCsrf
- `src/app/api/returns/route.ts` — POST wrapped with withCsrf
- `src/app/api/reviews/route.ts` — POST wrapped with withCsrf
- `src/app/api/feedback/route.ts` — POST wrapped with withCsrf
- `src/app/api/upload/route.ts` — POST wrapped with withCsrf

## Skipped
- `src/app/api/wallet/route.ts` — No POST handler exists (withdrawal POST is in /api/withdrawals)

## Lint
- 0 errors, 1 pre-existing warning (unrelated)
