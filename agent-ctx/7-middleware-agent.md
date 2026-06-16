# Task 7: Add Next.js Middleware for Edge-Level Route Protection

**Agent:** Middleware Agent
**Status:** Completed

## Work Summary

Created `/home/z/my-project/src/middleware.ts` with comprehensive edge-level route protection logic.

## What Was Done

1. **Created `/home/z/my-project/src/middleware.ts`** — a new Edge-compatible middleware file that provides JWT-based route protection for all API routes.

2. **Route Classification:**
   - **Public routes** (no auth required): auth endpoints (`/api/auth/login`, `/api/auth/register`, etc.), `/api/health`, `/api/search` (and sub-routes like `/api/search/suggestions`), `/api/currency/rates`, `/api/csrf-token`
   - **Public GET-only routes**: `/api/categories`, `/api/payment-methods`, `/api/shops`, `/api/products`, `/api/gigs` — and all their sub-routes are public for GET requests only; non-GET methods require auth
   - **Admin routes**: `/api/admin/*` — require valid JWT with `role: 'admin'` or `role: 'both'`
   - **Protected routes**: All other `/api/*` routes require any valid JWT

3. **JWT Verification:**
   - Uses `jose` library (Edge-compatible, already installed v6.2.3)
   - Verifies HS256 tokens (matching `jsonwebtoken` default from `auth-middleware.ts`)
   - Token extracted from `Authorization: Bearer <token>` header OR `auth-token` cookie
   - Rejects tokens with `twoFactorPending: true`
   - Graceful fallback: if `JWT_SECRET` is not available at Edge runtime, defers auth to the Node.js route handler

4. **Response Codes:**
   - `401` with `{ error: 'Authentication required' }` — missing/invalid token
   - `403` with `{ error: 'Admin access required' }` — valid token but non-admin role on admin route

5. **User Context Headers:** On successful auth, attaches `x-mw-user-id`, `x-mw-user-email`, `x-mw-user-role` headers for downstream route handlers.

6. **Config Matcher:** Only applies to `/api/:path*` routes — does NOT interfere with static assets, pages, or Next.js internals.

## Design Decisions

- **Prefix-based matching** for public routes: Both exact paths and their sub-routes are matched (e.g., `/api/search` and `/api/search/suggestions` are both public)
- **Deferred auth pattern**: When `JWT_SECRET` is unavailable at Edge (e.g., Vercel Edge Runtime config), the middleware doesn't block requests — it lets the Node.js route handler perform auth. This prevents false negatives from missing env vars.
- **Admin whitelist**: Routes like `/api/admin/sync-schema` and `/api/setup/*` that use key-based auth are whitelisted to bypass JWT checks.
- **Coexistence with proxy.ts**: The middleware only matches `/api/:path*`, while the existing `proxy.ts` has a broader matcher. Both can coexist since they serve different purposes.

## Files Changed

- **Created:** `src/middleware.ts` (new file, ~250 lines)

## Verification

- ESLint: Passes with no errors (only pre-existing warning in `page.tsx`)
- TypeScript: No errors in middleware code (only pre-existing `minimatch` type definition warning)
