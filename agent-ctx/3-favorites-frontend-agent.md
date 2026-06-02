# Task 3: Fix and enhance favorites frontend components

## Work Log

### Bug Fixes

**Bug 1: Product card favorite not persisted**
- File: `/src/components/marketplace/shared/product-card.tsx`
- Problem: `handleFavorite` only flipped local state with a `// TODO: API call to toggle favorite` comment
- Fix: Imported `api` from `@/lib/api`, made `handleFavorite` async. When `currentUser` exists, calls `api.favorites.toggleFavorite(product.id, currentUser.id)` and updates local state from API response. Falls back to local state toggle when not logged in.

**Bug 2: Product detail favorite broken**
- File: `/src/components/marketplace/shop/product-detail.tsx`
- Problem: Was calling `api.favorites.toggleFavorite(productId)` without `userId`
- Status: Already fixed by previous agent — line 175 already correctly passes both args: `api.favorites.toggleFavorite(productId, currentUser.id)`. Response key `res.data.isFavorited` is also correct (backend returns `isFavorited`).

**Bug 3: Buyer favorites wrong param key**
- File: `/src/components/marketplace/buyer/buyer-favorites.tsx`
- Problem: Lines 146 and 185 used `{ id: product.id }` instead of `{ productId: product.id }`
- Fix: Completely rewrote the component (see Enhancement 1 below), all `setCurrentView('product-detail', ...)` now use `{ productId: product.id }`

### API Client Fix
- File: `/src/lib/api.ts`
- Changed `toggleFavorite: (productId: string)` → `toggleFavorite: (productId: string, userId: string)`
- Changed endpoint from `/favorites/toggle` to `/favorites` (correct POST endpoint)
- Now sends both `productId` and `userId` in request body
- Updated `getFavorites` to accept optional `userId` param and append as query string

### Enhancements

**Enhancement 1: Better Buyer Favorites page**
- File: `/src/components/marketplace/buyer/buyer-favorites.tsx` — completely rewritten
- Features:
  - Header with heart icon (rose-500 to pink-600 gradient), title "My Wishlist", and count badge (violet-600 to rose-500 gradient)
  - "Add All to Cart" button with gradient styling
  - Sort options via Select dropdown: Recently Added (default), Price: Low to High, Price: High to Low, Name A-Z
  - Filter by product type as pill buttons: All, Digital, Physical, Freelance — active state uses violet/rose gradient
  - Better card design with:
    - Type badge with icon and color coding (violet=digital, orange=physical, emerald=freelance)
    - Heart icon (filled red) for remove with hover tooltip "Remove from Wishlist"
    - Mini star rating display with numeric value
    - Stock status (In Stock / Out of Stock) with color coding
    - "Added on" date display
    - Out-of-stock overlay on product image
    - Price with violet/rose gradient text
    - Add to cart button with hover gradient effect
  - AnimatePresence for smooth removal animations (scale down + fade out)
  - Empty state with "Your wishlist is empty" and browse products button with gradient
  - Filtered empty state with "No [type] products" and "Show All" button
  - Loading skeleton state
  - Uses `api.favorites.getFavorites()` and `api.favorites.toggleFavorite()` for all API calls
  - Syncs `favoriteIds` with Zustand store

**Enhancement 2: Add favoriteIds to Zustand store**
- File: `/src/store/use-marketplace-store.ts`
- Added state: `favoriteIds: string[]` (initialized as empty array)
- Added actions: `setFavoriteIds(ids: string[])` and `toggleFavoriteId(productId: string)`
- `favoriteIds` is NOT persisted in partialize config (derived from API)
- `favoriteIds` is cleared on logout

**Enhancement 3: Buyer overview favorites count**
- File: `/src/components/marketplace/buyer/buyer-overview.tsx`
- Verified: Already correctly fetches favorites from `/api/favorites?userId=...` and displays count in the "Favorites" stat card with Heart icon and rose/pink gradient. No changes needed.

### Verification
- Lint passes cleanly (0 errors, 0 warnings)
- Dev server restarted and returns HTTP 200

## Stage Summary
- All 3 bugs fixed: product card now calls API, product detail already had userId, favorites page uses correct productId param key
- API client updated to send userId with toggleFavorite and use correct endpoint
- Buyer favorites page completely redesigned with sort, filter, animations, and better UX
- Zustand store enhanced with favoriteIds tracking (not persisted)
- All lint checks pass
