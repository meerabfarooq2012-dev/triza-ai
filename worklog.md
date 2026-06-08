---
Task ID: 1
Agent: Main Agent
Task: Fix authentication errors on admin pages (transactions, settings, dashboard)

Work Log:
- Identified root cause: Multiple admin components using raw `fetch()` without auth tokens, bypassing the `api` client that handles auth, CSRF, and token refresh automatically
- Identified secondary cause: Zustand store corruption from localStorage causing "ew is not a function" errors
- Identified tertiary cause: AdminSettings showing auth error before Zustand rehydration completes

- Fixed api.ts: Added 6 missing admin API methods (getTransactions, getVerifications, getReturns, processRefund, releaseEscrow, processWithdrawal) and removed duplicate definitions
- Fixed admin-transactions.tsx: Replaced all raw `fetch()` calls with `api` client methods, fixed `useCallback` dependency array to include `authToken`
- Fixed admin-dashboard.tsx: Removed buggy `fetchPaymentStats` that read from localStorage and made raw fetch without auth, now uses data from single `api.admin.getStats()` call
- Fixed admin-settings.tsx: Added `isLoadingAuth` check to prevent showing auth error before Zustand rehydration completes
- Fixed use-marketplace-store.ts: Changed `merge` function to whitelist approach (only merge known data keys from localStorage, never action functions), improved `onRehydrateStorage` to check all 26 action keys
- Fixed admin-audit-log.tsx: Replaced raw fetch with `api.auditLog.getLogs()`
- Fixed admin-verifications.tsx: Replaced raw fetch with `api.admin.getVerifications()`
- Fixed admin-returns.tsx: Replaced raw fetch with `api.admin.getReturns()`
- Fixed dispute-center-page.tsx: Replaced raw fetch with `api.admin.getDisputes()`
- Fixed dispute-detail-page.tsx: Replaced 11 raw fetch calls with `api.request()` and `api.admin.getDisputes()`
- Exposed `request` function on the exported `api` object for endpoints without dedicated wrapper methods

Stage Summary:
- All admin components now use the `api` client which automatically handles: Authorization headers, CSRF tokens, token refresh on 401, retry after token refresh
- Zustand store now uses whitelist approach for localStorage merge, preventing "X is not a function" errors
- AdminSettings no longer shows auth error during Zustand rehydration
- Lint: 0 errors, 3 pre-existing warnings
- Dev server compiles successfully (HTTP 200 on /)
- Admin API endpoints return proper JSON auth errors (tested: /api/admin/transactions, /api/admin/stats, /api/admin/settings)
