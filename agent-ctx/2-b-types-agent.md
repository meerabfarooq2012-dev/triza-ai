# Task 2-b: Add Seller Verification & Trust Badges TypeScript Types

## Summary
Added all TypeScript types and constants for the Seller Verification & Trust Badges feature to `src/types/index.ts`.

## Changes Made
- **SellerTierLevel** type: `'bronze' | 'silver' | 'gold' | 'platinum'`
- **SellerTierInfo** interface: Full tier info with metrics, trust score, progress
- **SellerTierDetail** interface: Detailed tier with current/next tier, requirements checklist
- **AdminVerificationItem** interface: Verification item for admin review with user/shop info
- **AdminVerificationListResponse** interface: Paginated list with stats
- **PublicVerificationInfo** interface: Public-facing verification info with badges and tier
- **TIER_CONFIG** constant: Visual config for each tier (label, color, bgColor, borderColor, icon, description, requirements)
- **DOCUMENT_TYPE_LABELS** constant: Human-readable labels for document types
- **VERIFICATION_STATUS_LABELS** constant: Status labels with color classes

## File Modified
- `src/types/index.ts` — Added ~165 lines at the end of the file

## Lint
- Zero errors
