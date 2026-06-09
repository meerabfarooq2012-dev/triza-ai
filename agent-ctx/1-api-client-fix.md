# Task 1: Fix API Client - Add Missing Admin API Methods

## Work Done

Added 6 missing admin API methods to `src/lib/api.ts` inside the `adminApi` object, after the `dataExport` method:

1. **`getTransactions`** - GET `/admin/transactions` with params (paymentPage, paymentLimit, withdrawalPage, withdrawalLimit, status, escrowStatus, search). Returns `ApiResponse<AdminTransactionsData>`.

2. **`getVerifications`** - GET `/verification/admin/list` with params (status, page, limit, search). Returns `ApiResponse`.

3. **`getReturns`** - GET `/returns` with params (status, page, limit). Returns `ApiResponse`.

4. **`processRefund`** - PUT `/payments/{id}` with body `{ action: 'refund', userId, reason }`. Returns `ApiResponse`.

5. **`releaseEscrow`** - PUT `/payments/{id}` with body `{ action: 'release', userId }`. Returns `ApiResponse`.

6. **`processWithdrawal`** - PUT `/withdrawals/{id}` with body `{ action, adminId, adminNote }`. Returns `ApiResponse`.

Also added `AdminTransactionsData` to the import from `@/types`.

All methods use the existing `request()` function which automatically handles:
- Authorization header from Zustand store
- CSRF tokens for mutating requests
- Token refresh on 401
- Retry after token refresh

## Lint Result
0 errors, 3 pre-existing warnings (unrelated to changes).
