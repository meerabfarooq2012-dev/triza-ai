# Task 4 — JWT Authentication for WebSocket Services + CORS Restriction

**Agent:** security-agent
**Date:** 2025-03-04

## Summary

Added JWT authentication to both WebSocket mini-services (chat and notification), restricted CORS origins, added userId verification on all socket events, and added Bearer token authentication to the HTTP /push endpoint. Updated all 4 frontend Socket.io connection points to pass the JWT auth token.

## Changes Made

### 1. Chat Service (`mini-services/chat-service/index.ts`) — MAJOR REWRITE

- **CORS Restriction**: Replaced `origin: "*"` with `ALLOWED_ORIGINS` array:
  - `process.env.FRONTEND_URL || 'http://localhost:3000'`
  - `'https://marketo-vercel-app.vercel.app'`
- **JWT Authentication Middleware**: Added `io.use()` middleware that:
  - Extracts token from `socket.handshake.auth.token` or `socket.handshake.query.token`
  - Verifies the token using the same JWT secret as the main Next.js app (`marketo-dev-secret-change-in-production`)
  - Stores decoded user payload in `socket.data.user`
  - Rejects connections without valid JWT with "Authentication required" or "Invalid token" errors
- **User ID Verification**: Added verification on all socket events:
  - `register-user`: Verifies `socket.data.user?.userId !== userId` → emits error + returns
  - `join-conversation`: Verifies `socket.data.user?.userId !== userId` → emits error + returns
  - `send-message`: Verifies `socket.data.user?.userId !== message.senderId` → emits error + returns
  - `typing`: Verifies `socket.data.user?.userId !== userId` → silently returns
  - `stop-typing`: Verifies `socket.data.user?.userId !== userId` → silently returns
  - `mark-read`: Verifies `socket.data.user?.userId !== userId` → silently returns
- **Installed**: `jsonwebtoken@9.0.3` dependency

### 2. Notification Service (`mini-services/notification-service/index.ts`) — MAJOR REWRITE

- **CORS Restriction**: Same `ALLOWED_ORIGINS` array as chat service
- **JWT Authentication Middleware**: Same `io.use()` middleware as chat service
- **User ID Verification**: Added verification on socket events:
  - `register-user`: Verifies `socket.data.user?.userId !== userId` → emits error + returns
  - `notification-read`: Verifies `socket.data.user?.userId !== userId` → silently returns
  - `all-notifications-read`: Verifies `socket.data.user?.userId !== userId` → silently returns
  - `unread-count-update`: Verifies `socket.data.user?.userId !== userId` → silently returns
  - `notification-deleted`: Verifies `socket.data.user?.userId !== userId` → silently returns
- **HTTP /push Endpoint Authentication**:
  - Extracts `Authorization: Bearer <token>` header
  - Returns 401 with `{"error": "Authentication required"}` if no auth header
  - Returns 401 with `{"error": "Invalid token"}` if JWT verification fails
  - Only processes push request after successful JWT verification
- **Installed**: `jsonwebtoken@9.0.3` dependency

### 3. Frontend: Chat Socket Hook (`src/hooks/use-chat-socket.ts`)

- Updated `getChatSocket()` function signature to accept `authToken?: string | null`
- Added `auth: { token: authToken || undefined }` to the `io()` connection options
- Added `connect_error` event handler to log authentication failures
- Updated `useChatSocket()` hook to destructure `authToken` from store
- Added token refresh logic: updates `socket.auth.token` on each reconnection attempt

### 4. Frontend: Notification Socket Hook (`src/hooks/use-realtime-notifications.tsx`)

- Updated `getNotificationSocket()` function signature to accept `authToken?: string | null`
- Added `auth: { token: authToken || undefined }` to the `io()` connection options
- Added `connect_error` event handler to log authentication failures
- Updated `useRealtimeNotifications()` hook to destructure `authToken` from store
- Added token refresh logic: updates `socket.auth.token` on each reconnection attempt

### 5. Frontend: Seller Messages (`src/components/marketplace/seller/seller-messages.tsx`)

- Added `authToken` extraction from `useMarketplaceStore()`
- Added `auth: { token: authToken || undefined }` to the `io()` connection options

### 6. Frontend: Buyer Messages (`src/components/marketplace/buyer/buyer-messages.tsx`)

- Added `authToken` extraction from `useMarketplaceStore()`
- Added `auth: { token: authToken || undefined }` to the `io()` connection options

### 7. Backend: Notification Push (`src/lib/notifications.ts`)

- Updated `pushNotificationSocket()` to include `Authorization: Bearer <token>` header
- Signs a short-lived (1-minute) service token using the same JWT secret
- Token payload: `{ userId: 'service', email: 'system', role: 'service' }`
- Uses dynamic `import('jsonwebtoken')` since the main app already has jsonwebtoken installed

## Test Results

- **Unauthenticated /push**: Returns `401 {"success":false,"error":"Authentication required"}` ✅
- **Authenticated /push with valid JWT**: Returns `200 {"success":true}` ✅
- **Invalid JWT**: Returns `401 {"success":false,"error":"Invalid token"}` ✅
- **Health endpoint**: Returns `200 {"status":"ok","connections":0}` ✅

## Lint Results

- 0 errors, 3 pre-existing warnings (unrelated to this task)
- All new and modified files pass ESLint cleanly
