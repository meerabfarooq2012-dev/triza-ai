## Task 1 — Account Deletion & Data Export API Endpoints (Agent: main)

### Summary
Updated the existing `/api/users/delete` and `/api/users/export` endpoints to match the specified requirements: added CSRF protection, session revocation via `revokeAllUserSessions`, corrected rate limits, anonymized email domain, masked payment details in exports, and removed message content from exports for privacy.

### Changes Made

#### 1. Account Deletion API (`src/app/api/users/delete/route.ts`) — UPDATED

**Changes from previous version:**

- **CSRF Protection**: Wrapped the POST handler with `withCsrf` from `@/lib/with-csrf` (previously had no CSRF check)
- **Session Revocation**: Replaced `db.session.deleteMany({ where: { userId } })` with `revokeAllUserSessions(userId)` from `@/lib/session` — properly invalidates all JWT sessions via the session management system
- **Rate Limit**: Changed from 5 per 15 minutes to 3 per 15 minutes using `authRateLimit` preset with overridden `maxRequests: 3`
- **Anonymized Email Domain**: Changed from `deleted_{id}@marketo.invalid` to `deleted_{id}@marketo.deleted`
- **Buyer Reference Anonymization in Orders**: Added step 5 — anonymizes `shippingName` to "Deleted User" and clears `shippingPhone` on completed/delivered/refunded orders to protect personal data while keeping order records for legal/tax compliance
- **Removed debug info from error response**: Changed error response from including `debug: errMsg.substring(0, 200)` to just the generic error message for security
- **Added imports**: `revokeAllUserSessions` from `@/lib/session`, `withCsrf` from `@/lib/with-csrf`, `authRateLimit` from `@/lib/rate-limit`

#### 2. Data Export API (`src/app/api/users/export/route.ts`) — UPDATED

**Changes from previous version:**

- **Payment Method Masking**: Added `maskAccountDetails()` function that intelligently masks sensitive payment details based on the payment method type:
  - Card: masks card holder, shows only last 4 digits of card number, masks expiry
  - Easypaisa/JazzCash: masks account name, shows last 4 digits of mobile number
  - Payoneer: masks email and account name
  - Wise: masks email, shows last 4 of IBAN, masks account name
  - Bank Transfer: masks account name/number, keeps bank name, masks routing/SWIFT
  - Unknown methods: returns `{ masked: true }`
- **Messages — Metadata Only**: Changed message queries to use `select` to only return metadata (id, conversationId, receiverId/senderId, messageType, isRead, createdAt) — removed `content` field for privacy
- **Removed unnecessary data**: Removed products list, reviews received, withdrawals, favorites, and shop follows from export (simplified to match spec)
- **Renamed fields**: `reviewsGiven` → `reviewsWritten`, `paymentInfo` → `paymentMethods`, `shopData` variable for clarity
- **Used Promise.all**: Sent and received messages now fetched in parallel with `Promise.all`
- **Removed debug info from error response**: Security improvement
- **Removed unused imports**: `getRateLimitKey` no longer imported (not needed since key uses userId directly)

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All modified files pass ESLint cleanly
