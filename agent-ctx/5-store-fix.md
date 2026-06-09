# Task 5: Fix Zustand Store localStorage Corruption

## Summary
Fixed the `use-marketplace-store.ts` Zustand store to be more resilient against localStorage corruption causing "ew is not a function" errors.

## Root Cause
The previous `merge` function used a spread-and-delete approach: `{...currentState, ...persistedState}` then deleted non-function action keys. This was fragile because:
1. Any new/unknown key in persistedState would still overwrite currentState
2. The delete-based approach could miss keys if the action key list was incomplete
3. A timing edge case could still allow corrupted data through

## Changes Made

### 1. `merge` function (lines 507-564)
**Before**: Spread `currentState` then spread ALL of `persistedState` over it, then delete action keys that weren't functions.

**After**: Start with `currentState` (has all functions intact), then ONLY overlay explicitly whitelisted data keys from `persistedState`. This is a whitelist approach rather than blacklist — only the keys in `dataKeys` (matching `partialize` config) are ever copied from persisted state. Action functions can NEVER be overwritten by persisted data.

Key data keys whitelisted: `currentUser`, `isAuthenticated`, `authToken`, `refreshToken`, `activeRole`, `cart`, `cartTotal`, `currentView`, `viewParams`, `language`. Plus `favoriteIds` carried over separately.

Sanitization logic preserved:
- Array field validation for `cart` and `favoriteIds`
- `viewParams` plain object check
- `currentUser` validation (clear auth if invalid)
- Detail view reset on page reload

### 2. `onRehydrateStorage` callback (lines 566-615)
**Before**: Only checked `typeof state.login !== 'function'` (single key).

**After**: Checks ALL action keys. Iterates through the full action key list and finds the first corrupted key. If found, logs which specific key is corrupted, clears localStorage, and force-reloads.

## Files Modified
- `src/store/use-marketplace-store.ts` — merge function and onRehydrateStorage callback
