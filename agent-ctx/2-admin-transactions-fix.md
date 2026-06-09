# Task 2: Fix admin-transactions.tsx auth handling

## Changes Made

### 1. `src/lib/api.ts` — Added missing admin API methods

Added 4 new methods to the `adminApi` object:

- **`getTransactions()`** — GET `/admin/transactions` — fetches admin transaction data
- **`processRefund(paymentId, { userId, reason })`** — PUT `/payments/{id}` with `action: 'refund'`
- **`releaseEscrow(paymentId, { userId })`** — PUT `/payments/{id}` with `action: 'release'`
- **`processWithdrawal(withdrawalId, { action, adminId?, adminNote? })`** — PUT `/withdrawals/{id}`

These methods use the existing `request()` function which automatically handles:
- Auth token injection from Zustand store
- CSRF token headers for mutating requests
- Token refresh on 401 responses
- Proper error handling with `ApiError`

Also added `AdminTransactionsData` to the import from `@/types` (was already in the import but used `import()` inline — cleaned up to use the top-level import).

### 2. `src/components/marketplace/admin/admin-transactions.tsx` — Replaced raw fetch with api client

**Import changes:**
- Added `import { api, ApiError } from '@/lib/api'`

**`fetchData` callback:**
- Replaced raw `fetch(/api/admin/transactions?userId=...)` with `api.admin.getTransactions()`
- Fixed dependency array: `[currentUser?.id]` → `[currentUser?.id, authToken]`
- Added proper `ApiError` handling in catch block

**`handleWithdrawalAction`:**
- Replaced raw `fetch(/api/withdrawals/{id})` with `api.admin.processWithdrawal()`
- Added `ApiError` handling in catch block

**`handleRefundPayment`:**
- Replaced raw `fetch(/api/payments/{id})` with `api.admin.processRefund()`
- Passes `reason: refundReason` to the API method
- Added `ApiError` handling in catch block

**`handleForceReleaseEscrow`:**
- Replaced raw `fetch(/api/payments/{id})` with `api.admin.releaseEscrow()`
- Added `ApiError` handling in catch block

## Issues Fixed

1. ✅ Missing `authToken` in `fetchData` dependency array — causes stale data when token changes
2. ✅ Raw `fetch()` bypassing auth/CSRF/token-refresh — all 4 API calls now go through the `request()` function
3. ✅ No auth headers on mutation endpoints (withdrawal, refund, release) — `request()` auto-injects `Authorization` header
4. ✅ No CSRF protection on mutating requests — `request()` auto-injects `x-csrf-token` header
5. ✅ No token refresh on 401 — `request()` handles automatic token refresh
6. ✅ Generic error messages — `ApiError` provides specific server error messages

## Lint Status
- 0 errors, 3 pre-existing warnings (unrelated to this change)
