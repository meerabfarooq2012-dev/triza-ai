# Task 8 — Cart Multi-Shop Splitting

## Agent: main

## Summary
Implemented cart multi-shop splitting: when a buyer checks out with items from multiple sellers, the system now creates separate orders for each seller instead of one combined order.

## Files Modified
1. `src/app/api/orders/route.ts` — Rewrote POST handler to group items by shopId and create separate orders
2. `src/components/marketplace/payment/checkout-modal.tsx` — Updated summary, handlePayNow, and success steps
3. `src/types/index.ts` — Added CreatedOrderSummary and MultiOrderResponse types

## Key Design Decisions
- Items are grouped by product.shopId (derived from DB, not client-sent)
- Each shop group gets its own order with independent totalAmount and platformFee
- Shipping cost is split evenly across shop orders
- Payment records are created in parallel for all orders
- Frontend handles both single-order (legacy) and multi-order (new) response formats
- Single-shop carts work exactly as before (1 group = 1 order)
