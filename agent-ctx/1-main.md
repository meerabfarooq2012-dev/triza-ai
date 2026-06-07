# Task 1 — JWT Authentication for All API Mutation Routes

## Agent: main

## Summary
Added JWT authentication via `authenticateRequest` to ALL API mutation routes (POST/PUT/PATCH/DELETE) that previously had no authentication. This is a critical security fix ensuring that only authenticated users can perform data-modifying operations, with role-based access control (admin, seller) enforced where appropriate.

## Routes Fixed
79+ mutation routes across all API modules now require JWT authentication:
- Notifications, Coupons, Social (follow/stories/activities/share)
- Verification (seed-badges/review/award-badge)
- Disputes (all 6 dispute sub-routes)
- Returns (all 4 return sub-routes)
- Flash Sales, Wishlists, Wishlist collections
- Reviews, Shipping (addresses/zones/rates/shipments)
- Shipments, Addresses, Payment Info
- Gigs, Products, Shops, Withdrawals
- Orders, Messages, Favorites, Cart
- Payments, Downloads, AI, Feedback, Tax, Categories

## Key Patterns Applied
- All mutation routes check `authenticateRequest(request)` and return 401 if no valid JWT
- Admin-only routes enforce `auth.role !== 'admin'` with 403 response
- Seller-only routes enforce seller/admin/both roles with 403 response
- Routes accepting `userId` from body now use `auth.userId` from JWT instead
- Ownership checks (e.g., `shop.userId === auth.userId`) also allow admin override

## Lint Result
0 errors, 3 pre-existing warnings
