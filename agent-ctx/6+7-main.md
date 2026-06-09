# Task 6+7 — JWT Token Improvements, httpOnly Cookie Auth, and RBAC Middleware

**Agent:** main  
**Status:** Completed

## Summary

Implemented three major security improvements to the Marketo marketplace authentication system:
1. **JWT Token Improvements** — Reduced access token expiry from 7 days to 15 minutes, added refresh token support (7-day expiry)
2. **httpOnly Cookie Auth** — Added httpOnly cookie support alongside Authorization header for XSS protection
3. **RBAC Middleware** — Created role-based access control middleware for API routes

## Changes Made

### Part 1: JWT Improvements

#### 1. `src/lib/auth-middleware.ts` — MAJOR UPDATE
- **Reduced access token expiry**: Changed from `'7d'` to `'15m'`
- **Added `signRefreshToken()`**: Signs JWT with `{ ...payload, type: 'refresh' }` claim and 7-day expiry
- **Added `verifyRefreshToken()`**: Verifies refresh tokens; rejects tokens without `type: 'refresh'` claim
- **Updated `verifyToken()`**: Now rejects tokens that have `type: 'refresh'` claim (prevents using refresh tokens as access tokens)
- **Updated `extractToken()`**: Now falls back to `auth-token` httpOnly cookie if no Authorization header present
- **Added `setAuthCookies()`**: Helper to set httpOnly cookies for access token (15 min) and refresh token (7 days) on a NextResponse
- **Added `clearAuthCookies()`**: Helper to clear both auth cookies (for logout)

#### 2. `src/app/api/auth/refresh/route.ts` — NEW
- **POST /api/auth/refresh** — Refreshes access tokens
- Accepts `{ refreshToken }` in body or falls back to `refresh-token` cookie
- Validates the refresh token using `verifyRefreshToken()`
- Returns new `{ token, refreshToken }` pair (refresh token rotation)
- Sets httpOnly cookies with new tokens

#### 3. `src/app/api/auth/set-cookie/route.ts` — NEW
- **POST /api/auth/set-cookie** — Sets httpOnly auth cookies
- Accepts `{ token, refreshToken }` in body
- Called by the frontend after login/register to store tokens as httpOnly cookies

#### 4. Login Route (`src/app/api/auth/login/route.ts`) — UPDATED
- Now generates both access token and refresh token on successful login
- Returns `{ token, refreshToken }` in response body
- Sets httpOnly cookies via `setAuthCookies()`

#### 5. Register Route (`src/app/api/auth/register/route.ts`) — UPDATED
- Now generates both access token and refresh token on successful registration
- Returns `{ token, refreshToken }` in response body
- Sets httpOnly cookies via `setAuthCookies()`

#### 6. 2FA Verify Route (`src/app/api/auth/2fa/verify/route.ts`) — UPDATED
- Returns `{ token, refreshToken }` on successful 2FA verification
- Sets httpOnly cookies via `setAuthCookies()`

#### 7. Change Password Route (`src/app/api/auth/change-password/route.ts`) — UPDATED
- Returns `{ token, refreshToken }` after password change
- Sets httpOnly cookies via `setAuthCookies()`

#### 8. Google Auth Route (`src/app/api/auth/google/route.ts`) — UPDATED
- Now generates tokens for both existing and new Google users
- Returns `{ token, refreshToken }` in response
- Sets httpOnly cookies via `setAuthCookies()`

#### 9. Zustand Store (`src/store/use-marketplace-store.ts`) — UPDATED
- Added `refreshToken: string | null` to store state
- Added `setRefreshToken: (token: string | null) => void` action
- `refreshToken` is persisted in localStorage via `partialize`
- `logout()` now clears both `authToken` and `refreshToken`

#### 10. API Client (`src/lib/api.ts`) — MAJOR UPDATE
- **Auto-refresh logic**: When a request receives a 401 response, the client automatically:
  1. Calls `refreshAccessToken()` using the stored refresh token
  2. Queues concurrent requests while refreshing (prevents race conditions)
  3. Retries the original request with the new access token
  4. If refresh fails, clears both tokens and forces re-login
- **Added `auth.refreshToken()`**: Calls `/api/auth/refresh` API
- **Added `auth.setAuthCookies()`**: Calls `/api/auth/set-cookie` API
- **Updated auth API return types** to include `refreshToken`

#### 11. Auth Modal (`src/components/marketplace/auth/auth-modal.tsx`) — UPDATED
- Now stores both `authToken` and `refreshToken` from login/register/Google responses
- Calls `api.auth.setAuthCookies()` after login/register to set httpOnly cookies

#### 12. 2FA Verify Component (`src/components/marketplace/auth/two-factor-verify.tsx`) — UPDATED
- Now stores both `authToken` and `refreshToken` from 2FA verify response
- Calls `api.auth.setAuthCookies()` to set httpOnly cookies

#### 13. Change Password Form (`src/components/marketplace/auth/change-password-form.tsx`) — UPDATED
- Now updates both `authToken` and `refreshToken` after password change
- Calls `api.auth.setAuthCookies()` to set httpOnly cookies

### Part 2: httpOnly Cookie Auth

#### 14. Cookie Token Extraction (`src/lib/auth-middleware.ts` — `extractToken()`)
- Tries `Authorization: Bearer <token>` header first
- Falls back to `auth-token` httpOnly cookie if no header present
- Uses type-safe check for `cookies` property on Request

#### 15. Set-Cookie Route (`src/app/api/auth/set-cookie/route.ts`) — NEW
- Sets both `auth-token` (httpOnly, 15 min, strict sameSite) and `refresh-token` (httpOnly, 7 days, strict sameSite) cookies
- Cookie settings: `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'`, `path: '/'`

#### 16. Logout Route (`src/app/api/auth/logout/route.ts`) — UPDATED
- Now clears both `auth-token` and `refresh-token` httpOnly cookies via `clearAuthCookies()`

#### 17. Session Management (`src/lib/session.ts`) — UPDATED
- Updated session expiry constants to match new token lifetimes
- Session now uses `JWT_REFRESH_TOKEN_EXPIRY_DAYS` (7 days) for session record expiry

#### 18. With-Session Middleware (`src/lib/with-session.ts`) — UPDATED
- Uses `extractToken()` which now checks both headers and cookies
- Updated documentation to mention cookie support

### Part 3: RBAC Middleware

#### 19. `src/lib/rbac.ts` — NEW
- **`requireRole(...roles: Role[])`**: Returns a function that validates the authenticated user has one of the required roles
  - Returns `{ authorized: boolean, auth: AuthPayload | null, response?: NextResponse }`
  - Returns 401 if not authenticated
  - Returns 403 if authenticated but wrong role
  - Handles `both` role: users with `role: 'both'` pass checks for `seller` or `buyer`
- **`withRole(...roles, handler)`**: Convenience wrapper that combines RBAC check with a handler function
  - If authorized, calls the handler with the authenticated `AuthPayload`
  - If not authorized, returns the error response automatically

## Security Improvements

1. **Reduced attack window**: Access tokens now expire in 15 minutes instead of 7 days, significantly reducing the window for token theft
2. **Refresh token rotation**: Each refresh generates a new refresh token, invalidating the old one
3. **httpOnly cookie protection**: Tokens are also stored as httpOnly cookies (not accessible via JavaScript), protecting against XSS attacks
4. **Strict sameSite**: Cookies use `sameSite: 'strict'` to prevent CSRF
5. **Secure flag**: Cookies use `secure: true` in production (HTTPS only)
6. **Token type segregation**: Access tokens and refresh tokens are distinct; using a refresh token as an access token is rejected
7. **Backward compatibility**: Authorization header still works alongside cookies; existing API clients are not broken

## Lint Results
- 0 new errors introduced
- 3 pre-existing warnings (unrelated to this task)
- All new and modified files pass ESLint cleanly
