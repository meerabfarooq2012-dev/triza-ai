# Task 2 - Review API Fix Agent

## Summary
Fixed and enhanced review API routes to add gigId support throughout.

## Changes Made

### 1. `/src/app/api/reviews/route.ts` (GET handler)
- Added `gigId` query param support
- Updated validation to accept gigId as valid filter (alongside productId and shopId)
- Added gigId to `where` clause and `summaryWhere` clause

### 2. `/src/app/api/reviews/[id]/route.ts` (PATCH + DELETE handlers)
- Added `images` to PATCH body destructuring
- Added `if (images !== undefined) updateData.images = JSON.stringify(images);`
- Extended `recalculateRating` helper with `gigId` parameter and Gig model recalculation
- Updated both PATCH and DELETE to pass `review.gigId` to recalculateRating

### 3. `/src/app/api/reviews/gig/[gigId]/route.ts` (NEW)
- Created new GET route for gig-specific reviews
- Mirrors product reviews route pattern
- Supports sort, rating filter, hasImages filter, pagination, rating summary

### 4. `/src/app/api/reviews/route.ts` (POST handler)
- Added gig verified purchase check using `orderItem → product → shop → gigs` relation

## Lint Status
- No new errors introduced
- 2 pre-existing errors in unrelated files (gig-detail.tsx, product-detail.tsx)
