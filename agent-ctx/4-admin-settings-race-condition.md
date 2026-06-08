# Task 4: Fix admin-settings.tsx Race Condition with Zustand Rehydration

## Summary
Fixed the race condition where `admin-settings.tsx` immediately showed "Authentication Required" on initial render before Zustand's persist middleware could rehydrate `authToken` from localStorage.

## Changes

### 1. `src/store/use-marketplace-store.ts`
- Changed `isLoadingAuth` initial value from `false` to `true` — this signals to components that the store hasn't rehydrated yet
- Added `useMarketplaceStore.setState({ isLoadingAuth: false })` at the end of `onRehydrateStorage` callback (after successful rehydration and corruption checks), so components know auth state is now settled

### 2. `src/components/marketplace/admin/admin-settings.tsx`
- Added `useRef` import
- Added `isLoadingAuth` selector from store: `useMarketplaceStore((s) => s.isLoadingAuth)`
- Added `prevIsLoadingAuthRef` ref to track transitions
- In `fetchSettings`: if `isLoadingAuth` is true, return early without setting authError — don't check auth until rehydration completes
- Added `isLoadingAuth` to `useCallback` dependency array
- Added `useEffect` that watches for `isLoadingAuth` transition from `true → false` and triggers `fetchSettings`

## How It Works
1. On first render, `isLoadingAuth` is `true` (store hasn't rehydrated yet)
2. `fetchSettings` is called but returns early (no auth error shown, spinner stays)
3. When Zustand rehydrates from localStorage, `isLoadingAuth` becomes `false`
4. The transition useEffect detects this and calls `fetchSettings` again
5. Now `authToken` is populated (or truly null), and the auth check works correctly

## Lint
0 errors, 3 warnings (pre-existing, unrelated)
