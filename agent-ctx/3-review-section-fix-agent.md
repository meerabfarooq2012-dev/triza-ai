# Task 3 — Review Section Fix & Enhancement Agent

## Task: Fix and enhance review-section.tsx component

## Changes Made

### 1. Fixed WriteReviewForm — Pass images to API (CRITICAL BUG)
- Added `images: imageUrls.length > 0 ? imageUrls : undefined` to the `api.reviews.createReview()` call
- Removed unnecessary type assertion `as { rating: number; comment: string; ... }`

### 2. Fixed RatingSummary — Use API's ratingSummary instead of client-side calculation
- Added `apiRatingSummary` state to store the API's rating summary data
- In `fetchReviews`, extract and store `ratingSummary` from all API response branches
- Replaced `ratingDistribution` useMemo with `apiRatingSummary?.distribution` fallback
- Replaced `averageRating` useMemo with `apiRatingSummary?.average` fallback
- Added `totalReviews` derived from `apiRatingSummary?.count ?? reviewTotal`
- Pass `totalReviews` (from API summary) to the `RatingSummary` component

### 3. Fixed API client (`src/lib/api.ts`)
- Changed `updateReview` to accept `userId` and `images` in the data parameter
- Added `getGigReviews` method for fetching reviews by gig ID

### 4. Added Edit button to ReviewCard
- Added `onEdit` prop to ReviewCard component
- Added Edit button with `Pencil` icon next to Delete button for review authors
- Added `Pencil` to lucide-react imports

### 5. Added Edit Review Form (EditReviewForm component)
- Pre-fills rating, title, comment, and existing images from the review being edited
- Calls `api.reviews.updateReview(review.id, { rating, title, comment, images, userId })` on submit
- On success, updates the review in the reviews array, clears `editingReview`, shows toast
- Has Cancel button to dismiss the form
- Styled with emerald left border to distinguish from new review form

### 6. Fixed ReviewSection fetchReviews for gigId
- Added gigId branch using `api.reviews.getGigReviews(gigId, {...})`
- Moved gigId branch after productId but before shopSlug (matching the API priority)
- Added `gigId` to useCallback dependency array

### 7. Fixed fetchReviews response handling
- Properly typed `resData` to match actual API response shape (`reviews` instead of `items`, `pagination.total` instead of direct `total`)
- Removed the separate early-return code path for shopId (now uses unified resData handling)
- Extracts `ratingSummary` from all API response branches

## Files Modified
- `src/lib/api.ts` — updateReview signature, getGigReviews method
- `src/components/marketplace/shared/review-section.tsx` — All 6 changes above

## Lint & TypeScript
- Zero new lint errors in modified files
- Zero TypeScript errors in modified files
- Pre-existing errors in other files (gig-detail.tsx, product-detail.tsx) are unrelated
