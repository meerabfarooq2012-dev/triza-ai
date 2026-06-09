# Task 3-6: Critical Security Fixes

## Summary

Implemented four security fixes across the Thiora marketplace codebase.

---

## Task 3: Fix IDOR on GET Orders & Payments Routes

### Files Modified:
- `src/app/api/orders/route.ts`
- `src/app/api/payments/route.ts`
- `src/app/api/payments/[id]/route.ts`
- `src/app/api/payments/status/route.ts`

### Changes:
1. **Orders GET** (`/api/orders`): Added `authenticateRequestWithSession` call. After auth, checks that `auth.userId` matches the requested `userId` query param, or allows if `auth.role === 'admin'`. Returns 401 if unauthenticated, 403 if unauthorized.

2. **Payments GET** (`/api/payments`): Same IDOR fix — added authentication and userId/role check against query param `userId`.

3. **Payment by ID GET** (`/api/payments/[id]`): Added authentication. After fetching payment, verifies that the authenticated user is either the `buyerId`, `sellerId`, or has admin role. Returns 403 otherwise.

4. **Payment Status GET** (`/api/payments/status`): Added authentication. After fetching payment by `paymentId`, verifies the user is buyer, seller, or admin before returning status data.

---

## Task 4: Reduce JWT Access Token Expiry

### File Modified:
- `src/lib/auth-middleware.ts`

### Changes:
1. Changed `JWT_EXPIRES_IN` constant from `'7d'` to `'1h'` (1 hour).
2. Changed cookie `maxAge` for `auth-token` from `7 * 24 * 60 * 60` (7 days = 604800s) to `60 * 60` (1 hour = 3600s).
3. Refresh token expiry remains at 30 days — no change needed.

---

## Task 5: Remove SVG from Allowed Upload Types

### File Modified:
- `src/lib/supabase-storage.ts`

### Changes:
1. Removed `image/svg+xml` from the `ALLOWED_MIME_TYPES` array. SVG files can contain embedded JavaScript which creates stored XSS vulnerabilities.

### Not Modified:
- `src/hooks/use-upload.ts` — Already did not include SVG in its client-side `ALLOWED_TYPES` set (only had jpeg, png, webp, gif). No change needed.

---

## Task 6: Invalidate Sessions on Password Change

### Files Modified:
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/change-password/route.ts`

### Changes:
1. **Reset Password**: After successfully updating the password, added `await revokeAllUserSessions(user.id)` to invalidate all active sessions. This forces the user to re-authenticate on all devices after a password reset.

2. **Change Password**: After successfully updating the password:
   - Added `await revokeAllUserSessions(userId)` to revoke all sessions.
   - Created a new session for the newly generated access token using `createSession(userId, token, deviceInfo, ipAddress)`.
   - This ensures all other devices are logged out while the current session seamlessly transitions to a new token.

---

## Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to our changes)
- Dev server running successfully
