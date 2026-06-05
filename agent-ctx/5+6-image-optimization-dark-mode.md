# Task 5 + 6: Image Optimization & Dark Mode Consistency

## Agent: main
## Status: Completed

## Summary
Replaced HTML `<img>` tags with Next.js `<Image>` component across 4 key marketplace components. Fixed hardcoded light-only colors in 4 components for proper dark mode support.

## Files Modified
- `src/components/marketplace/shop/shop-view.tsx` — 4 img→Image replacements
- `src/components/marketplace/seller/seller-shop-settings.tsx` — 2 img→Image + ~15 dark mode fixes
- `src/components/marketplace/returns/return-detail-page.tsx` — 1 img→Image + 6 dark mode fixes + added Image import
- `src/components/marketplace/returns/returns-page.tsx` — Cancelled status config dark mode fix
- `src/components/marketplace/shared/product-card.tsx` — Overlay button bg-white→bg-background

## Lint: 0 errors, 3 pre-existing warnings
