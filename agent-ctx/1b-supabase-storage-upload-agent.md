# Task 1b — Supabase Storage Upload Integration

## Agent: main

## Summary
Wired Supabase Storage into all places where images/files need to be uploaded. Created unified upload API route, reusable upload hook, and updated product creation, shop branding, review photos, and return evidence to use actual file uploads.

## Files Created
- `src/app/api/upload/route.ts` — Generic upload API route (POST /api/upload)
- `src/hooks/use-upload.ts` — Reusable upload hook with progress tracking

## Files Modified
- `src/components/marketplace/seller/seller-products.tsx` — Added URL input alongside file upload, progress bar, per-file toasts
- `src/components/marketplace/seller/seller-shop-settings.tsx` — Fixed folder name from 'logos'/'banners' to 'shops'
- `src/components/marketplace/shared/review-section.tsx` — Added file upload buttons to WriteReviewForm and EditReviewForm
- `src/components/marketplace/returns/request-return-dialog.tsx` — Replaced placeholder URLs with actual file uploads
- `worklog.md` — Appended work record

## Key Decisions
- Used `supabase-storage.ts` existing functions for the upload route
- Added folder validation to prevent arbitrary paths
- 2MB limit for avatars, 5MB for everything else
- Rate limited at 30/min per IP
- Kept URL input alongside file upload in all components (don't remove URL input)
- All components use `/api/upload` endpoint which falls back gracefully
- Return evidence now uses actual file uploads instead of placeholder URLs

## Lint
- 0 errors, 1 pre-existing warning
