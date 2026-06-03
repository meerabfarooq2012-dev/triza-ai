# Task 3 - Verification API Builder

## Task
Create API routes for Seller Verification & Trust Badges feature

## Summary
Created 7 API route files under `src/app/api/verification/` for the Seller Verification & Trust Badges feature. The Prisma schema already had the required models (SellerVerification, TrustBadge, SellerBadge) from a prior agent, so no schema changes were needed. All routes follow the `{ success: true/false, data/error }` response format with proper error handling.

## Files Created
1. `src/app/api/verification/submit/route.ts` — POST: Submit verification document
2. `src/app/api/verification/status/route.ts` — GET: Get verification status
3. `src/app/api/verification/review/route.ts` — POST: Admin review (approve/reject)
4. `src/app/api/verification/badges/route.ts` — GET: Get trust badges
5. `src/app/api/verification/trust-score/route.ts` — GET: Calculate trust score
6. `src/app/api/verification/award-badge/route.ts` — POST: Award badge to seller
7. `src/app/api/verification/seed-badges/route.ts` — POST: Seed default badges

## Key Implementation Details
- Trust score calculation: verified(+20), sales≥10(+15), sales≥50(+10), rating≥4.0(+10), rating≥4.5(+15), reviews≥10(+10), reviews≥50(+10), active30d(+5), returnPolicy(+5), disputes(-10 each)
- Trust level tiers: platinum(90+), gold(75-89), silver(50-74), bronze(25-49), none(0-24)
- Admin review approval cascades: verification update → shop verified → user verified → trust score recalculation → auto-award "verified_seller" badge
- 7 default badges seeded with criteria JSON and tier classification
- All routes use `import { db } from '@/lib/db'`
- ESLint passes with zero errors
