# Task 4 — Session Revocation / Token Blacklist Implementation

## Summary
Implemented a comprehensive session management system for the Marketo marketplace, enabling server-side session revocation for JWT tokens. Previously, JWT tokens were stateless with a 7-day expiry and no way to invalidate them. Now, each login creates a session record (storing only the SHA-256 hash of the token), and sessions can be individually or bulk-revoked.

## Changes Made

### 1. Prisma Schema Updates
- Added `Session` model to all 3 schema files (`schema.prisma`, `schema.sqlite.prisma`, `schema.postgresql.prisma`)
  - Fields: `id`, `userId`, `tokenHash` (unique), `deviceInfo`, `ipAddress`, `expiresAt`, `createdAt`, `lastActiveAt`
  - `tokenHash` stores only the SHA-256 hash — NEVER the raw JWT token
  - Indexes on `userId` and `tokenHash` for fast lookups
  - Cascade delete when user is deleted
- Added `sessions Session[]` relation to the `User` model in all 3 schemas
- Ran `bun run db:push` to sync the database

### 2. Session Management Utility (`src/lib/session.ts`) — NEW
- `hashToken(token)` — SHA-256 hash of JWT token using `crypto.createHash`
- `createSession(userId, token, deviceInfo?, ipAddress?)` — Creates a session record with hashed token
- `validateSession(token)` — Checks if session exists and is not expired; throttles `lastActiveAt` updates to every 5 minutes
- `revokeSession(token)` — Deletes a specific session by token hash
- `revokeAllUserSessions(userId, exceptToken?)` — Deletes all sessions except the current one; returns revoked count
- `getUserSessions(userId)` — Returns all active (non-expired) sessions; cleans expired ones
- `revokeSessionById(sessionId, userId)` — Deletes a session by ID with ownership verification
- `cleanExpiredSessions()` — Deletes all expired sessions from the database

### 3. Session Validation Middleware (`src/lib/with-session.ts`) — NEW
- `withSession(handler)` — Wraps API route handlers with session validation
- Extracts JWT token → verifies JWT signature → validates session in DB
- Returns 401 with `"Session expired or revoked"` if invalid
- Can be used as a drop-in replacement for routes needing session enforcement

### 4. Updated Auth Login Route (`src/app/api/auth/login/route.ts`)
- After successful login and JWT generation, calls `createSession()` with the token
- Captures device info from `User-Agent` header
- Captures IP address from `x-forwarded-for` header
- Session creation failure does not block login (logged but continues)

### 5. Updated Auth Logout Route (`src/app/api/auth/logout/route.ts`)
- Extracts the JWT token from the Authorization header
- Calls `revokeSession(token)` to delete the specific session from the database
- Falls back gracefully if token extraction fails (still returns success)

### 6. Updated Store Logout (`src/store/use-marketplace-store.ts`)
- Changed logout fire-and-forget to send the `Authorization: Bearer` header with the auth token
- This allows the server to identify and revoke the specific session

### 7. Session Management API Endpoints

#### `src/app/api/auth/sessions/route.ts` — NEW
- **GET /api/auth/sessions** — List all active sessions for the current user
  - Requires JWT authentication
  - Returns session list with device info, IP, last active, creation time
  - Marks the current session with `isCurrentSession: true`
  - Rate limited using `apiRateLimit`
- **DELETE /api/auth/sessions** — Revoke all other sessions
  - Requires JWT authentication
  - Body: `{ userId }` (must match authenticated user)
  - Calls `revokeAllUserSessions(userId, currentToken)`
  - Returns `{ success: true, revokedCount: number }`

#### `src/app/api/auth/sessions/[id]/route.ts` — NEW
- **DELETE /api/auth/sessions/[id]** — Revoke a specific session
  - Requires JWT authentication
  - Deletes the session by ID only if it belongs to the requesting user
  - Returns `{ success: true }` or 404 if not found / not owned

### 8. Session Manager UI Component (`src/components/marketplace/settings/session-manager.tsx`) — NEW
- `'use client'` component with gold/amber accent theme
- Section title "Active Sessions" with Shield icon
- Lists active sessions showing:
  - Device/browser icon (Mobile, Desktop, Tablet) parsed from User-Agent
  - Device info text (e.g., "Chrome on Windows (Desktop)")
  - IP address (partially masked: 192.168.***.***)
  - Last active time (relative: "2 hours ago", "3 days ago")
  - "Current Session" badge (emerald) for the active session
  - "Revoke" button (red) for other sessions
- "Sign Out All Other Devices" button at bottom (destructive, red outline)
- Confirmation dialog before revoking all sessions with warning message
- Loading spinner during async operations
- Refresh button to reload sessions
- Max height with scroll overflow for long session lists

### 9. User Profile Integration (`src/components/marketplace/profile/user-profile.tsx`)
- Imported `SessionManager` component
- Added `<SessionManager />` after the Change Password section
- Wrapped in motion.div for consistent animation

### 10. API Client Updates (`src/lib/api.ts`)
- Added session management methods to `authApi`:
  - `getSessions()` — GET `/auth/sessions`
  - `revokeSession(sessionId)` — DELETE `/auth/sessions/${sessionId}`
  - `revokeAllOtherSessions(userId)` — DELETE `/auth/sessions` with body

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly
