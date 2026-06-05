# Task 1 — Auth Features Implementation

## Summary
Implemented comprehensive auth features for the Marketo marketplace including Prisma schema updates, rate limiting, JWT auth middleware, and multiple auth API routes.

## Changes Made

### 1. Prisma Schema Updates
- Added 6 new fields to User model in all 3 schema files:
  - `resetToken`, `resetTokenExpiry`, `emailVerifyToken`, `emailVerified`, `loginAttempts`, `lockoutUntil`, `lastLoginAt`
- Ran `bun run db:push` to sync

### 2. Rate Limiting Utility (`src/lib/rate-limit.ts`)
- In-memory rate limiter, configurable window/max, auto-cleanup, convenience presets

### 3. JWT Auth Middleware (`src/lib/auth-middleware.ts`)
- signToken, verifyToken, extractToken, authenticateRequest, generateResetToken, generateResetExpiry

### 4-9. Auth API Routes
- Updated login (rate limit, lockout, JWT)
- Updated register (rate limit, emailVerifyToken, JWT)
- New forgot-password, reset-password, change-password, verify-email

### 10. Email Templates
- Added passwordResetEmail and emailVerificationEmail

### Lint: 0 errors
