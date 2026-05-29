---
Task ID: 1
Agent: main
Task: Fix seller dashboard "seeing nothing" bug and similar infinite loading issues across all dashboard components

Work Log:
- Diagnosed the root cause: multiple seller/buyer dashboard components had `if (!currentUser) return` early exits in data fetching functions that returned before `setLoading(false)`, causing infinite loading skeletons
- Fixed page.tsx to handle `isLoadingAuth` state - added loading spinner while auth is being restored
- Rewrote SellerDashboard component to properly handle no-shop case, fetch fresh user data from API, and show appropriate loading/setup states
- Fixed SellerOverview, SellerProducts, SellerGigs, SellerAnalytics, SellerOrders, SellerMessages - all had the same infinite loading bug
- Fixed all buyer dashboard components: BuyerOverview, BuyerOrders, BuyerPayments, BuyerFavorites, BuyerMessages
- Fixed payment components: SellerWallet, PaymentSettingsPage
- Cleaned .next cache and restarted dev server
- Verified no TypeScript errors in modified files
- Confirmed server is running with `GET / 200`

Stage Summary:
- Fixed 15+ components with the infinite loading skeleton bug
- Added proper auth loading state to page.tsx
- Seller dashboard now shows loading spinner while fetching shop data, and a friendly setup prompt if shop is missing
- All changes compile and run successfully
