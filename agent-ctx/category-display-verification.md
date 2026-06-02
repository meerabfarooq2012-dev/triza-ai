# Category/Subcategory Display Verification

## Task
Verify that category and subcategory are properly displayed in the Seller Dashboard when viewing product/gig details/descriptions.

## Findings

### ✅ Product Detail View (`product-detail.tsx`)
- Category with `parentName › name` displayed in header badge (with Tag icon, emerald styling)
- Category info also shown at top of Description tab
- API (`GET /api/products/[id]`) includes `category` with `parentId` and enriches with `parentName`

### ✅ Gig Detail View (`gig-detail.tsx`)
- Category with `parentName › name` displayed in header badge (with Tag icon, emerald styling)
- Category info also shown at top of "About This Gig" section
- API (`GET /api/gigs/[id]`) includes `category` with `parentId` and enriches with `parentName`

### ✅ Seller Products Table (`seller-products.tsx`)
- Has `getCategoryName()` helper showing `parentName › name` for subcategories
- Desktop table has dedicated "Category" column
- Mobile cards show category badge

### ✅ Seller Gigs Table (`seller-gigs.tsx`)
- Has `getCategoryName()` helper showing `parentName › name` for subcategories
- Desktop table has dedicated "Category" column
- Mobile cards show category badge

### ✅ Product Creation Form (`seller-products.tsx`)
- Two-step category/subcategory selection
- Category dropdown with icons and children count
- Subcategory dropdown appears when parent has children

### ✅ Gig Creation Form (`seller-gigs.tsx`)
- Two-step category/subcategory selection with Command combobox for subcategories
- Category breadcrumb indicator below selectors
- Well-structured UX

## Issues Found & Fixed

### 1. Seller Overview Top Products/Gigs Missing Category (FIXED)
- **Before**: The "Top Products" and "Top Gigs" cards in `seller-overview.tsx` showed name, sales/orders, and price but NOT category
- **After**: Added category badges (with Tag icon, emerald styling, `parentName › name` format) to both Top Products and Top Gigs lists

### 2. API Create/Update Responses Missing parentId in Category (FIXED)
- **Before**: `POST /api/products`, `PATCH /api/products/[id]`, `POST /api/gigs`, `PATCH /api/gigs/[id]` included `category: { select: { id, name, slug } }` without `parentId`, so `parentName` was never available
- **After**: Added `parentId` to category select AND added `parentName` enrichment (parent category lookup) to all four endpoints

## Files Changed
1. `src/components/marketplace/seller/seller-overview.tsx` - Added category badges to Top Products and Top Gigs
2. `src/app/api/products/route.ts` - Added `parentId` to category select + `parentName` enrichment in POST
3. `src/app/api/products/[id]/route.ts` - Added `parentId` to category select + `parentName` enrichment in PUT
4. `src/app/api/gigs/route.ts` - Added `parentId` to category select + `parentName` enrichment in POST
5. `src/app/api/gigs/[id]/route.ts` - Added `parentId` to category select + `parentName` enrichment in PATCH

## Lint Status
✅ `bun run lint` passes with no errors
