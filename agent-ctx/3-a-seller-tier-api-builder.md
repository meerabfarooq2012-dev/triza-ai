# Task 3-a: Seller Tier API Builder

## Task
Build 2 API routes for the Seller Tier system

## Work Log

### 1. Created `src/app/api/seller-tier/[shopId]/route.ts` — GET seller tier info
- Accepts `shopId` from URL params
- Verifies shop exists (404 if not found)
- Looks up existing `SellerTier` record for the shop
- If no `SellerTier` exists, calculates tier on-the-fly using `calculateSellerTier()` helper
- `calculateSellerTier()` helper function:
  1. Gets shop data (totalSales, averageRating, totalReviews, verificationStatus)
  2. Checks for fast_shipper badge from both `SellerBadge` records and `shop.badges` JSON
  3. Calculates average shipping days from `Shipment` records (shippedAt → deliveredAt diff)
  4. Determines tier: Bronze (0-10 sales), Silver (11+ sales & rating ≥ 4.0), Gold (51+ sales & rating ≥ 4.5 & verified), Platinum (200+ sales & rating ≥ 4.8 & verified & fast_shipper)
  5. Calculates progress to next tier as percentage (weighted average of each requirement's progress)
  6. Returns `{ tier, nextTier, progressPercent, metrics }`
- `buildNextTierRequirements()` helper builds current vs required comparison for each metric
- Response shape: `{ success, data: { currentTier, metrics, nextTier, progressPercent } }`
- TIER_DETAILS config mirrors `TIER_CONFIG` from `src/types/index.ts`

### 2. Created `src/app/api/seller-tier/calculate/route.ts` — POST recalculate tiers
- Accepts optional `shopId` in request body
  - If provided: recalculate only that shop
  - If not: recalculate ALL active shops
- For each shop:
  1. Gets shop metrics (totalSales, averageRating, totalReviews, verificationStatus)
  2. Checks for fast_shipper badge (both SellerBadge records and shop.badges JSON)
  3. Calculates avg shipping days from Shipment records
  4. Determines tier using `determineTier()` (same rules as GET route)
  5. Gets previous tier from existing SellerTier record
  6. Calculates nextTier and progressPercent
  7. Upserts SellerTier record with all metrics
  8. Auto-awards badges:
     - `top_rated`: rating ≥ 4.5 AND reviews ≥ 20
     - `fast_shipper`: avg ship days ≤ 2
     - `power_seller`: sales ≥ 200
     - `new_seller`: shop created within 30 days
  9. Updates `shop.badges` JSON with all current badges
  10. Updates `shop.trustLevel` to match tier
  11. Updates `user.trustLevel` to match tier
- Returns summary: `{ success, data: { calculated, tierChanges: [{ shopId, shopName, previousTier, newTier, badgesAwarded }] } }`

### Key Design Decisions
- Both routes use `import { db } from '@/lib/db'` as required
- `Array.isArray()` guards on all data that could be non-array (sellerBadges, parsed badges JSON)
- Backward compatibility: checks both `SellerBadge` records AND `shop.badges` JSON for fast_shipper detection
- Badge creation uses `.catch()` to handle unique constraint errors gracefully
- `calculateSellerTier()` in GET route is a standalone async function that queries DB fresh
- `determineTier()` and `calculateProgress()` in POST route are pure functions for testability
- All errors handled with try/catch, proper status codes (400, 404, 500)
- `params` uses `Promise<>` pattern as required by Next.js 16 App Router
- Lint passes with zero errors
