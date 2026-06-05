## Task 5 — Product Comparison Feature (Agent: main)

### Summary
Implemented a comprehensive product comparison feature for the Marketo marketplace, allowing users to compare up to 4 products side by side. Includes a comparison API endpoint, Zustand store, compare button on product cards, floating compare bar, and a full comparison view.

### Changes Made

#### 1. Type Updates (`src/types/index.ts`)
- Added `'compare'` to the `ViewMode` union type

#### 2. Comparison Store (`src/store/use-comparison-store.ts`) — NEW
- Simple Zustand store (NO persist — comparison is temporary)
- State: `compareIds: string[]` (max 4)
- Actions:
  - `addToCompare(id)` — adds if not already in (toggles if already present), shows toast if max reached
  - `removeFromCompare(id)` — removes from list
  - `clearComparison()` — clears all
  - `isInCompare(id): boolean` — check if product is in comparison
- Uses `toast` from sonner for feedback messages

#### 3. Comparison API Endpoint (`src/app/api/products/compare/route.ts`) — NEW
- **GET /api/products/compare?ids=id1,id2,id3,id4**
- Accepts comma-separated product IDs (max 4, min 2)
- Fetches products with shop, category, and variant data
- Includes computed `variantPriceMin`, `variantPriceMax`, `variantsCount`
- Validates: all IDs must be found, max 4 products
- Returns: `{ success: true, data: CompareProduct[] }`

#### 4. API Client Update (`src/lib/api.ts`)
- Added `compareProducts(ids: string[])` to `productsApi`
- Calls `GET /products/compare?ids=...`

#### 5. Product Card Update (`src/components/marketplace/shared/product-card.tsx`)
- Imported `useComparisonStore` and `GitCompare` icon from lucide-react
- Added compare button below the favorite button (vertical stack)
- Compare button toggles product in/out of comparison
- Visual indicator: amber highlight when product is in comparison list
- Uses `isInCompare()` for real-time state

#### 6. Compare Bar (`src/components/marketplace/shared/compare-bar.tsx`) — NEW
- `'use client'` component with AnimatePresence
- Shows at bottom of screen when 2+ products in comparison
- Fixed position bar with product thumbnails and names
- "Compare Now" button (gold gradient)
- "Clear All" button
- Individual remove (X) buttons per product (on hover)
- Animates in/out with framer-motion (slide up from bottom)
- Responsive: full width on mobile, centered max-width on desktop
- Product thumbnails: 40x40 rounded squares
- Style: white bg, shadow-2xl, border-t, rounded-t-xl
- Counter: "X of 4 products selected"
- z-50 (above content, below modals)
- Fetches minimal product data for thumbnails from compare API

#### 7. Comparison View (`src/components/marketplace/search/comparison-view.tsx`) — NEW
- `'use client'` component showing side-by-side comparison table
- Comparison attributes:
  - Product image (with Best Price badge)
  - Price / Compare price / Variant price range
  - Type (Digital/Physical/Freelance with badges)
  - Shop name (clickable, navigates to shop view)
  - Rating (stars with review count)
  - Stock availability (contextual per product type)
  - Variants available (Yes/No with count)
  - Category
  - Description excerpt
  - Date listed
  - Action buttons (Add to Cart, Remove from comparison)
- Each product gets a column in a responsive grid
- Attribute rows alternate background
- Best value highlight: lowest effective price gets "Best Price" badge
- "Add to Cart" gold gradient button per product
- "Remove from comparison" button per product
- Print-friendly styling tip
- Sticky header with back button and clear all
- Loading, error, and empty states
- Redirects to search if less than 2 products

#### 8. Page Wiring (`src/app/page.tsx`)
- Added dynamic import for `ComparisonView` with `withChunkRetry`
- Added dynamic import for `CompareBar` with `withChunkRetry`
- Added `case 'compare':` in `renderView()` switch → renders `<ComparisonView />`
- Added `<CompareBar />` in the layout (after CartDrawer, before FeedbackWidget)

### Lint Results
- 0 new errors from this task
- 5 pre-existing errors in `recently-viewed-section.tsx` and `use-recently-viewed.ts` (unrelated)
- 1 pre-existing warning in `seller-reviews.tsx` (unrelated)

### Files Created
1. `/home/z/my-project/src/store/use-comparison-store.ts`
2. `/home/z/my-project/src/app/api/products/compare/route.ts`
3. `/home/z/my-project/src/components/marketplace/shared/compare-bar.tsx`
4. `/home/z/my-project/src/components/marketplace/search/comparison-view.tsx`

### Files Modified
1. `/home/z/my-project/src/types/index.ts` — Added `'compare'` to ViewMode
2. `/home/z/my-project/src/components/marketplace/shared/product-card.tsx` — Added compare button
3. `/home/z/my-project/src/app/page.tsx` — Added compare view case + CompareBar
4. `/home/z/my-project/src/lib/api.ts` — Added compareProducts method
