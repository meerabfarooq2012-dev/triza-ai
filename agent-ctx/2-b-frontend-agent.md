# Task 2-b - Frontend Agent: Update landing page categories section with expandable subcategories

## Summary
Updated the `CategoriesSection` component to fetch categories from the API with static fallback, and added expandable subcategories with preview pills, count badges, and animations.

## Changes Made

### File Modified
- `/home/z/my-project/src/components/marketplace/landing/categories-section.tsx` — Complete rewrite

### Key Features Implemented

1. **API Fetching**: Component fetches from `/api/categories?type=physical|digital|gigs` on tab change with `useEffect` + `useCallback`, falls back to static constants if API fails.

2. **Data Merging**: `mergeApiWithFallback()` function merges API response (which includes `children` subcategories) with static category definitions. If API has no children, fills in from `GIG_SUBCATEGORIES`, `DIGITAL_SUBCATEGORIES`, or `PHYSICAL_SUBCATEGORIES`.

3. **Expandable Subcategories**: Each category card with subcategories shows a chevron icon. Clicking it toggles the expanded state. Uses `AnimatePresence` + `motion.div` for smooth height/opacity animation.

4. **Subcategory Count Badge**: "+N" badge in top-right corner of each card showing how many subcategories exist.

5. **Preview Pills**: When collapsed, cards show first 3 subcategory names as small clickable pills, plus a "+N more" indicator.

6. **Expanded View**: Full grid of all subcategory pills with max-height scroll (max-h-48) and custom scrollbar.

7. **Subcategory Click Handling**: Clicking any subcategory pill calls `setSearchCategory(subSlug)` and navigates to `gigs-browse` (for gig subcategories) or `search` (for product subcategories). Uses `e.stopPropagation()` to prevent the parent card click from firing.

8. **Tab-Specific Theming**: 
   - Physical: violet colors
   - Digital: cyan colors  
   - Gigs: emerald colors
   - Applied to hover borders, expanded borders, badges, pills, and chevron icons

9. **Visual Polish**: Expanded cards get a highlighted border and remain elevated; chevron rotates 180° on expand; smooth transitions throughout.

### Preserved
- Tab switcher (Physical/Digital/Gigs) unchanged
- Responsive grid (2/3/4/5 cols) unchanged
- "View All Categories" button for gigs tab unchanged
- Existing gradient card style and icon/color maps unchanged
- `handleCategoryClick` pattern preserved

## Lint Result
All lint checks pass cleanly (0 errors, 0 warnings).

## Dev Server
Running normally on port 3000.
