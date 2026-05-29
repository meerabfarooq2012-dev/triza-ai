---
Task ID: 1
Agent: Main Agent
Task: Fix blank page issue on Marketo website preview

Work Log:
- Investigated the root cause of the blank page issue
- Found that `isLoadingAuth` was set to `true` in the Zustand store initial state
- This caused a "Loading Marketo..." spinner to show indefinitely because the persist rehydration callback was mutating state directly instead of using setState
- Changed `isLoadingAuth` default from `true` to `false` in the Zustand store
- Fixed `onRehydrateStorage` callback to use `setTimeout` + `useMarketplaceStore.setState()` instead of direct state mutation
- Refactored page.tsx to use dynamic imports via `useLazyComponent` hook to reduce initial compilation memory
- Only essential components (Header, Footer, CartDrawer, LandingPage, AuthModal) are imported directly
- Heavy components (BuyerDashboard, SellerDashboard, ShopView, etc.) are loaded on demand
- Verified the page compiles and serves correctly with 122KB+ of HTML content
- Landing page renders with all sections: Marketo branding, hero, about, commission, features, categories, gigs, CTA
- Seller dashboard has proper loading states, error handling, shop setup flow, and tab navigation

Stage Summary:
- Root cause: `isLoadingAuth: true` in Zustand store caused permanent loading spinner
- Fix 1: Set `isLoadingAuth: false` by default in store
- Fix 2: Fixed persist rehydration to use proper setState pattern
- Fix 3: Refactored page.tsx to use lazy component loading
- Page now renders immediately without blocking loading state
- All linter checks pass
