# Task ID: 6 — Fix Admin Components Raw fetch() Auth Tokens

## Agent: Admin Auth Fix

## Task
Fix all remaining admin components that use raw `fetch()` without proper auth tokens. These components bypass the `api` client and don't send Authorization headers, causing "Authentication required" errors.

## Work Log

### 1. admin-audit-log.tsx
- Replaced raw `fetch()` to `/api/admin/audit-log` with `api.auditLog.getLogs()`
- Replaced CSV export raw `fetch()` with `api.admin.dataExport('audit-log', 'csv')`
- Removed `useMarketplaceStore` import and `authToken` destructuring (no longer needed for manual auth headers)
- Added `import { api, ApiError } from '@/lib/api'`
- Added ApiError-specific error handling in catch blocks

### 2. admin-verifications.tsx
- Replaced raw `fetch()` to `/api/verification/admin/list` with `api.admin.getVerifications()`
- Replaced raw `fetch()` to `/api/verification/review` with `api.request('/verification/review', { method: 'POST', ... })`
- Added `import { api, ApiError } from '@/lib/api'`
- Added ApiError-specific error handling

### 3. admin-returns.tsx
- Replaced raw `fetch()` to `/api/returns` with `api.admin.getReturns()`
- Replaced raw `fetch()` to `/api/returns/${id}` with `api.request('/returns/${id}', { method: 'PUT', ... })`
- Added `import { api, ApiError } from '@/lib/api'`
- Added ApiError-specific error handling

### 4. dispute-center-page.tsx
- Replaced raw `fetch()` to `/api/disputes?userId=` with `api.request('/disputes?...')`
- Replaced fallback raw `fetch()` to `/api/admin/disputes?userId=` with `api.admin.getDisputes()`
- Added `import { api, ApiError } from '@/lib/api'`
- Added ApiError-specific error handling

### 5. dispute-detail-page.tsx
- Replaced ALL 11 raw `fetch()` calls with `api.request()`:
  - GET `/api/disputes/${disputeId}`
  - GET `/api/admin/disputes?userId=` → `api.admin.getDisputes()`
  - POST `/api/disputes/${disputeId}/messages`
  - PUT `/api/disputes/${disputeId}` (seller response)
  - POST `/api/disputes/${disputeId}/escalate`
  - POST `/api/disputes/${disputeId}/resolve`
  - PUT `/api/disputes/${disputeId}` (close dispute)
  - PUT `/api/disputes/${disputeId}` (assign admin)
  - PUT `/api/disputes/${disputeId}` (change priority)
  - POST `/api/disputes/${disputeId}/evidence`
- Added `import { api, ApiError } from '@/lib/api'`
- Added ApiError-specific error handling in all catch blocks

### 6. api.ts — Exposed `request` function
- Added `request` to the exported `api` object so components can use `api.request()` for endpoints without a specific wrapper method
- This ensures all requests go through the auth/CSRF/token-refresh pipeline

## Stage Summary
- **Root cause**: Components used raw `fetch()` bypassing auth headers, CSRF tokens, and automatic token refresh on 401
- **Key fix**: Replaced all raw `fetch()` with `api` client methods (`api.auditLog.getLogs()`, `api.admin.getVerifications()`, `api.admin.getReturns()`, `api.admin.getDisputes()`, `api.request()`)
- **Secondary fix**: Exposed `request` function on `api` export for endpoints without dedicated wrapper methods
- **Detail**: Added `ApiError` handling in all catch blocks for specific error messages
- **Lint result**: 0 errors, 3 pre-existing warnings (unrelated)
