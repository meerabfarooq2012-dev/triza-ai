# Task 2 — Admin API Security Fix

## Summary
Fixed critical security vulnerability in all admin API routes. Routes were using query-param or body-param `userId` for authentication instead of proper JWT verification, allowing anyone who knows an admin's userId to access admin endpoints. Also fixed insecure `startsWith('admin')` admin check pattern and broken auth in audit-log/reports routes.

## Files Modified

### 1. `/src/app/api/admin/settings/route.ts` — FIXED: Added JWT auth (was missing entirely)
- Added `import { authenticateRequest } from '@/lib/auth-middleware'`
- Added JWT auth + admin role check to both GET and PATCH handlers
- Added `userId: auth.userId` to audit log

### 2. `/src/app/api/admin/stats/route.ts` — FIXED: Replaced userId query param with JWT auth
- Removed: `userId` from `searchParams.get('userId')`, DB lookup `db.user.findUnique({ where: { id: userId } })`, `user.isAdmin` check
- Added: `authenticateRequest(request)`, `auth.role !== 'admin'` check
- Uses `auth.userId` and `auth.role` from JWT payload instead of request params

### 3. `/src/app/api/admin/users/route.ts` — FIXED: Replaced userId body/query param with JWT auth
- GET: Removed `userId` from query params, replaced DB admin check with `auth.role !== 'admin'`
- PUT: Removed `userId` from body destructuring, replaced DB admin check with `auth.role !== 'admin'`
- Changed `userId` to `auth.userId` in audit log

### 4. `/src/app/api/admin/disputes/route.ts` — FIXED: Replaced userId query/body param with JWT auth
- GET: Removed `userId` from query params, replaced DB admin check with `auth.role !== 'admin'`
- PUT: Removed `userId` from body destructuring, replaced DB admin check with `auth.role !== 'admin'`
- Changed `userId` to `auth.userId` in audit log

### 5. `/src/app/api/admin/transactions/route.ts` — FIXED: Replaced userId query param with JWT auth
- Removed: `adminUserId` from `searchParams.get('userId')`, DB lookup and `user.isAdmin` check
- Added: `authenticateRequest(request)`, `auth.role !== 'admin'` check

### 6. `/src/app/api/admin/withdrawals/route.ts` — FIXED: Replaced userId query param with JWT auth
- Removed: `userId` from `searchParams.get('userId')`, DB lookup and `user.isAdmin` check
- Also fixed: Previously allowed unauthenticated access when no `userId` param was provided
- Added: `authenticateRequest(request)`, `auth.role !== 'admin'` check

### 7. `/src/app/api/admin/abandoned-carts/route.ts` — FIXED: Removed insecure `startsWith('admin')` pattern
- Changed: `auth.role !== 'admin' && !auth.userId.startsWith('admin')` + DB fallback → `auth.role !== 'admin'`

### 8. `/src/app/api/admin/data-export/route.ts` — FIXED: Removed insecure `startsWith('admin')` pattern
- Changed: `auth.role !== 'admin' && !auth.userId.startsWith('admin')` + DB fallback → `auth.role !== 'admin'`

### 9. `/src/app/api/admin/reports/[id]/route.ts` — FIXED: Removed insecure `startsWith('admin')` pattern
- Changed: `auth.role !== 'admin' && !auth.userId.startsWith('admin')` + DB fallback → `auth.role !== 'admin'`

### 10. `/src/app/api/cart/send-reminder/route.ts` — FIXED: Removed insecure `startsWith('admin')` pattern
- Changed: `auth.role !== 'admin' && !auth.userId.startsWith('admin')` + DB fallback → `auth.role !== 'admin'`

### 11. `/src/app/api/admin/audit-log/route.ts` — FIXED: Broken auth implementation
- Changed: `await authenticateRequest(request)` (incorrect — function is synchronous) → `authenticateRequest(request)`
- Changed: `!auth || !auth.isAdmin` (broken — `isAdmin` doesn't exist on `AuthPayload`) → proper 401/403 with `auth.role !== 'admin'`

### 12. `/src/app/api/admin/reports/route.ts` — FIXED: Broken auth implementation
- Changed: `await authenticateRequest(request)` (incorrect — function is synchronous) → `authenticateRequest(request)`
- Changed: `!auth || !auth.isAdmin` (broken — `isAdmin` doesn't exist on `AuthPayload`) → proper 401/403 with `auth.role !== 'admin'`

### 13. `/src/app/api/admin/sync-schema/route.ts` — FIXED: Replaced hardcoded key with JWT auth
- Removed: Hardcoded key check `key !== 'marketo-sync-schema-2024'` from both POST and GET
- Already had: JWT auth via `authenticateRequest` + `auth.role !== 'admin'` check (was added previously)
- Removed the redundant key check since JWT admin auth is sufficient

## Routes NOT Modified (already secure)
- `/api/admin/shops/route.ts` — Already uses `authenticateRequest` + DB `adminUser.isAdmin` check
- `/api/admin/shops/[id]/approve/route.ts` — Already uses `authenticateRequest` + DB `adminUser.isAdmin` check
- `/api/admin/products/[id]/approve/route.ts` — Already uses `authenticateRequest` + DB `adminUser.isAdmin` check

## Lint Results
- 0 errors, 3 pre-existing warnings (all in unrelated files)
- All modified files pass ESLint cleanly
