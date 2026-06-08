# Task 3: Fix admin-dashboard.tsx auth bug

## Summary
Fixed the critical bug where `fetchPaymentStats` read auth token from localStorage and made a raw fetch without any Authorization header to `/api/admin/stats`, causing "Authentication required" errors.

## Changes Made

### 1. `src/types/index.ts` - Updated `AdminStats` interface
- Replaced the old `AdminStats` type (which used `platformStats`, `recentSignups`, `revenueChart`) with the actual API response shape:
  - `overview` object with `totalUsers`, `totalSellers`, `totalProducts`, `totalOrders`, `totalRevenue`, `pendingShops`, `pendingProducts`, `openDisputes`
  - `recentOrders` and `recentUsers` arrays
  - `paymentStats` object with `totalEscrowHeld`, `totalCommissionEarned`, `activeWithdrawals`, `activeWithdrawalsAmount`
  - `paymentActivity` array with `month`, `payments`, `commission`, `count`

### 2. `src/components/marketplace/admin/admin-dashboard.tsx` - Core fix
- **Removed** the entire `fetchPaymentStats` function that:
  - Read from `localStorage.getItem('marketo-storage')` instead of the Zustand store
  - Made a raw `fetch()` call without Authorization header
  - Sent `userId` as a query parameter instead of a Bearer token
- **Updated** the `.then()` handler to extract `paymentStats` and `paymentActivity` from the existing `api.admin.getStats()` response
- **Updated** state types to use `AdminStats['paymentStats']` and `AdminStats['paymentActivity']` instead of local interfaces
- **Removed** local `PaymentStats` and `PaymentActivity` interfaces (now in the `AdminStats` type)
- **Updated** `stats?.platformStats` references to `stats?.overview` to match the actual API response shape
- **Removed** unused `Clock` import from lucide-react

## Root Cause
The `fetchPaymentStats` function bypassed the authenticated `api` client entirely, reading from localStorage directly and making an unauthenticated fetch. The `/api/admin/stats` endpoint requires admin authentication via a Bearer token in the Authorization header, which the `api` client provides automatically via the Zustand store's `authToken`.

## Result
Now all data (platform stats, payment stats, payment activity) comes from a single authenticated `api.admin.getStats()` call, eliminating the auth failure and the duplicate API request.
