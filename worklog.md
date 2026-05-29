---
Task ID: 1
Agent: main
Task: Fix seller dashboard showing nothing - remove broken redirect, add shop creation flow

Work Log:
- Identified root cause: SellerDashboard showed "Set Up Your Shop" screen when no shop existed, but the button to go to settings didn't work (tabs weren't rendered), and a RedirectToDashboard component redirected users to the landing page after 3 seconds
- Removed the broken "Set Up Your Shop" blocking screen that prevented the dashboard from rendering
- Removed the RedirectToDashboard component that silently redirected to landing page
- Added a non-blocking amber banner at the top of the dashboard when no shop exists, with a "Create My Shop" button
- Added handleCreateShop function that calls POST /api/shops to create a shop, then refreshes user data
- Dashboard tabs (Overview, Products, Gigs, Orders, etc.) now always render even without a shop

Stage Summary:
- Seller dashboard now always shows the full tabbed interface
- No-shop case handled with an inline banner + create button instead of blocking screen
- Fixed the primary reason users saw "nothing" on the seller dashboard

---
Task ID: 2
Agent: main
Task: Fix page.tsx buyer->seller redirect and improve SellerShopSettings

Work Log:
- Removed silent redirect in page.tsx that sent buyer-role users to buyer-dashboard when they tried to access seller-dashboard
- Updated SellerShopSettings to fetch shop data from /api/auth/me when currentUser.shop is missing
- Updated SellerOverview to also fetch shop data from API as a fallback when store data is missing
- Both components now properly handle the case where shop data isn't in the Zustand store

Stage Summary:
- page.tsx no longer silently redirects away from seller dashboard
- SellerShopSettings and SellerOverview can recover shop data from API
- All seller dashboard components work even with stale/missing store data
