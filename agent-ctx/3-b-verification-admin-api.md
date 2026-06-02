# Task 3-b: Verification Admin API Routes

## Task
Build 2 API routes for the Verification admin system.

## Files Created

### 1. `src/app/api/verification/admin/list/route.ts`
- **GET** `/api/verification/admin/list` — Admin list verifications
- Auth: reads `userId` from query params, looks up user in DB, verifies `isAdmin === true`
- Query params: `userId` (required), `status` (pending/under_review/approved/rejected/all, default: all), `page` (default: 1), `limit` (default: 20, max: 100)
- Queries SellerVerification records with user and shop relations included
- Applies status filter if provided
- Returns paginated results with stats (4 separate count queries by status: pending, under_review, approved, rejected)
- Masks documentNumber (shows first 3 + **** + last 2 chars)
- Response: `{ success: true, data: { verifications: [...], pagination: { page, limit, total, totalPages }, stats: { pending, underReview, approved, rejected } } }`

### 2. `src/app/api/verification/[shopId]/route.ts`
- **GET** `/api/verification/[shopId]` — Public shop verification info
- Gets shopId from URL params via `await params` pattern
- Fetches shop with sellerTier and sellerBadges relations
- Looks up TrustBadge definitions for earned badges
- Returns PUBLIC info only: NO document URLs, NO rejection reasons, NO document numbers
- Includes earned badges with details (slug, name, icon, color, tier, awardedAt)
- Includes seller tier info if available (tier, totalSales, averageRating, totalReviews, isVerified)
- Uses `Array.isArray()` guard on earnedBadgeSlugs
- Uses `filter(Boolean)` to remove null badge entries

## Key Implementation Details
- Both routes use `import { db } from '@/lib/db'`
- Both routes follow `{ success: true, data }` / `{ success: false, error }` response format
- Both routes handle errors gracefully with try/catch and proper status codes
- Both routes export named `GET` functions
- Dynamic route params use `{ params }: { params: Promise<{ shopId: string }> }` pattern with `await params`
- Stats calculated via separate count queries per status (not grouped, which SQLite doesn't support well with Prisma)
- ESLint passes with zero errors
