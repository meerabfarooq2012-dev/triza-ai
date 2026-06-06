# Task 2 — Enhance Shipping Calculator in Checkout

## Agent: main

## Summary
Enhanced the shipping calculator to provide sensible default shipping rates when no shipping zones are configured for a shop, improved the checkout modal shipping step UI with method-specific icons and visual enhancements, and verified that order creation properly uses the shipping cost from the request.

## Files Modified
1. `src/app/api/shipping/calculate/route.ts` — Added default shipping rates fallback when no zones match
2. `src/components/marketplace/payment/checkout-modal.tsx` — Enhanced shipping step UI with icons, color-coded badges, default zone notice

## Key Decisions
- Default rates use prefix `default-` for IDs to distinguish from DB-backed rates
- Free shipping only offered when `orderTotal >= $50`
- Default zone has `name: "Default Zone"` and `countries: []` (worldwide)
- UI shows an amber notice banner when default rates are being used (so user knows seller hasn't configured custom zones)
- Method-specific icons: Truck (standard), Zap (express), Gift (free) — makes options more visually distinct
- Empty state changed from misleading "Free shipping" to amber "No shipping options available" notice

## Lint: 0 errors, 3 pre-existing warnings (unrelated)
