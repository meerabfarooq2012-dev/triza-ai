# Task 2 - Fix favorites API routes and API client

## Work Log

- Read worklog.md to understand previous agents' work (Tasks 1-7: blank page fixes, fake data removal, chat service, messaging system, feedback widget)
- Read all existing code: `/api/favorites/route.ts`, `api.ts`, `product-detail.tsx`, `product-card.tsx`, `buyer-favorites.tsx`, Prisma schema

### Bug 1: API route mismatch
- **Problem**: Client calls `POST /favorites/toggle` but server only had `POST /api/favorites`
- **Fix**: Created `/home/z/my-project/src/app/api/favorites/toggle/route.ts` as a dedicated toggle endpoint
  - Accepts `{ userId, productId }` in body
  - Checks if favorite exists → delete if yes, create if no
  - Returns `{ isFavorited: boolean, favoriteCount: number }`
  - Also verifies product exists (returns 404 if not)

### Bug 2: API client doesn't send userId
- **Problem**: `toggleFavorite` only sent `productId`, server required `userId`
- **Fix**: Updated `favoritesApi` in `api.ts`:
  - `toggleFavorite(productId: string, userId: string)` now accepts both params
  - `getFavorites(userId: string)` now requires userId (was optional before)
  - Added new `getFavoritesCount(userId: string)` method

### Bug 3: Response key mismatch
- **Problem**: Server returned `{ favorited: boolean }` but client expected `{ isFavorited: boolean }`
- **Fix**: Updated both `/api/favorites/route.ts` POST handler and new `/api/favorites/toggle/route.ts` to return `{ isFavorited: boolean, favoriteCount: number }`

### Bug 4: getFavorites doesn't pass userId
- **Problem**: `getFavorites()` didn't require userId parameter
- **Fix**: Changed signature from `(userId?: string)` to `(userId: string)` and always appends it as query param

### Additional improvements
- **Product existence check**: Both `/api/favorites` POST and `/api/favorites/toggle` POST now verify product exists before creating a favorite (returns 404)
- **Favorite count**: Toggle responses now include `favoriteCount` for the product
- **Created `/api/favorites/count/route.ts`**: GET endpoint with `userId` query param, returns `{ count: number }`

### Frontend fixes
- **product-detail.tsx**: Updated `handleToggleFavorite` to pass `currentUser.id` as second argument to `api.favorites.toggleFavorite(productId, currentUser.id)`
- **product-card.tsx**: Updated `handleFavorite` with optimistic update pattern (instant UI feedback, reverts on API error), passes `currentUser.id`
- **buyer-favorites.tsx**: Was already using `api.favorites.getFavorites(currentUser.id)` and `api.favorites.toggleFavorite(productId, currentUser.id)` — no changes needed

### Files modified
1. `/home/z/my-project/src/app/api/favorites/route.ts` — POST handler: `favorited` → `isFavorited`, added product existence check, added favoriteCount
2. `/home/z/my-project/src/app/api/favorites/toggle/route.ts` — NEW: dedicated toggle endpoint
3. `/home/z/my-project/src/app/api/favorites/count/route.ts` — NEW: count endpoint
4. `/home/z/my-project/src/lib/api.ts` — favoritesApi: require userId, point to /favorites/toggle, add getFavoritesCount
5. `/home/z/my-project/src/components/marketplace/shop/product-detail.tsx` — pass userId to toggleFavorite
6. `/home/z/my-project/src/components/marketplace/shared/product-card.tsx` — optimistic update, pass userId

### Verification
- All lint checks pass cleanly (0 errors)
- All API endpoints follow existing response format: `{ success: boolean, data?: T, error?: string }`
- Backward compatibility: `/api/favorites` POST still works (with improved response)
