# Task 5 — Zod Input Validation for All API Routes (Agent: validation)

## Summary

Added comprehensive Zod input validation to ALL critical API routes across the Marketo marketplace. Created a centralized validation module (`src/lib/validation.ts`) with 25+ Zod schemas and a generic `validateInput()` helper function, then integrated validation into 19 route files covering 25+ API endpoints.

## Changes Made

### 1. Centralized Validation Module (`src/lib/validation.ts`) — NEW

- **`validateInput<T>(schema, input)`** — Generic validation helper that returns `{ success: true, data: T }` or `{ success: false, error: string }`
- Flattens ZodError issues into a human-readable string (path + message)

**25+ Zod Schemas defined:**

| Schema | Route | Validates |
|--------|-------|-----------|
| `productCreateSchema` | POST /api/products | Product creation input |
| `orderCreateSchema` | POST /api/orders | Order creation with items array |
| `orderItemInputSchema` | (nested in orderCreateSchema) | Individual cart items |
| `reviewCreateSchema` | POST /api/reviews | Review creation |
| `reviewHelpfulSchema` | POST /api/reviews (helpful action) | Helpful vote |
| `messageSendSchema` | POST /api/messages | Message content |
| `disputeCreateSchema` | POST /api/disputes | Dispute creation |
| `returnCreateSchema` | POST /api/returns | Return request creation |
| `addressCreateSchema` | POST /api/shipping/addresses | Delivery address creation |
| `addressUpdateSchema` | PUT /api/shipping/addresses | Delivery address update |
| `addressDeleteSchema` | DELETE /api/shipping/addresses | Delivery address deletion |
| `socialFollowSchema` | POST /api/social/follow | Shop follow toggle |
| `socialShareSchema` | POST /api/social/share | Product share tracking |
| `storyCreateSchema` | POST /api/social/stories | Story creation |
| `couponCreateSchema` | POST /api/coupons | Coupon creation |
| `couponValidateSchema` | POST /api/coupons/validate | Coupon validation |
| `notificationCreateSchema` | POST /api/notifications | Notification creation |
| `notificationUpdateSchema` | PUT /api/notifications | Notification update |
| `notificationDeleteSchema` | DELETE /api/notifications | Notification deletion |
| `wishlistCreateSchema` | POST /api/wishlists | Wishlist creation |
| `wishlistItemAddSchema` | POST /api/wishlists/[id]/items | Add item to wishlist |
| `wishlistItemRemoveSchema` | DELETE /api/wishlists/[id]/items | Remove item from wishlist |
| `flashSaleCreateSchema` | POST /api/flash-sales | Flash sale creation |
| `gigCreateSchema` | POST /api/gigs | Gig creation |
| `shopCreateSchema` | POST /api/shops | Shop creation |
| `verificationSubmitSchema` | POST /api/verification/submit | Verification document submission |
| `withdrawalCreateSchema` | POST /api/withdrawals | Withdrawal request |
| `paymentInfoCreateSchema` | POST /api/payment-info | Payment info creation |
| `cartItemAddSchema` | POST /api/cart/items | Add item to cart |
| `aiDescriptionSchema` | POST /api/ai/generate-description | AI description generation |

### 2. Route Files Updated (19 files)

Each route was updated to:
1. Import `validateInput` and the relevant schema from `@/lib/validation`
2. Replace manual `if (!field)` checks with `validateInput(schema, body)`
3. Return 400 with the Zod error message if validation fails
4. Use `validation.data` instead of raw `body` for all subsequent logic

**Files modified:**
- `src/app/api/products/route.ts` — Replaced manual shopId/name/description/price checks
- `src/app/api/orders/route.ts` — Replaced manual buyerId/items checks; validated items array
- `src/app/api/reviews/route.ts` — Replaced manual userId/rating/comment checks + helpful action validation
- `src/app/api/messages/route.ts` — Replaced manual senderId/receiverId/content checks
- `src/app/api/disputes/route.ts` — Replaced manual orderId/reason/description checks + priority enum validation
- `src/app/api/returns/route.ts` — Replaced manual orderId/reason/description + reason/type enum validation
- `src/app/api/shipping/addresses/route.ts` — Replaced 6 separate field checks in POST, 2 in PUT, 2 in DELETE
- `src/app/api/social/follow/route.ts` — Replaced manual shopId check
- `src/app/api/social/share/route.ts` — Replaced manual productId check
- `src/app/api/social/stories/route.ts` — Replaced manual shopId check
- `src/app/api/coupons/route.ts` — Replaced manual shopId/code/type/value checks
- `src/app/api/coupons/validate/route.ts` — Replaced manual code/shopId/cartTotal/items checks + per-item validation
- `src/app/api/notifications/route.ts` — Added validation to POST, PUT, DELETE handlers
- `src/app/api/wishlists/route.ts` — Replaced manual userId/name checks
- `src/app/api/wishlists/[id]/items/route.ts` — Added validation to POST and DELETE
- `src/app/api/flash-sales/route.ts` — Replaced manual shopId/productId/title/salePrice/startDate/endDate checks
- `src/app/api/gigs/route.ts` — Replaced manual shopId/title/description/packages checks
- `src/app/api/shops/route.ts` — Replaced manual userId/name checks
- `src/app/api/verification/submit/route.ts` — Replaced manual userId/shopId/documentType + documentType enum check
- `src/app/api/withdrawals/route.ts` — Replaced manual userId/amount/method/accountDetails + method enum + amount checks
- `src/app/api/payment-info/route.ts` — Replaced manual userId/type/method/label/accountDetails + type/method enum checks
- `src/app/api/cart/items/route.ts` — Replaced manual productId + quantity range checks
- `src/app/api/ai/generate-description/route.ts` — Replaced manual type/name + type enum + name string checks

### 3. Validation Patterns

- **Fail-fast on bad input**: Validation runs immediately after `request.json()`, before any auth checks or DB queries
- **Type-safe data**: After validation passes, `validation.data` is fully typed, replacing raw `body`
- **Enum validation**: All enum fields (product type, dispute type, return reason, priority, payment method, etc.) are validated with `z.enum()`
- **String length limits**: All string fields have `max()` constraints to prevent oversized payloads
- **Array constraints**: Arrays have `min()`/`max()` bounds and item-level validation
- **Number bounds**: Prices are positive with max caps, quantities are positive integers with limits
- **Consistent error format**: All validation errors return `{ success: false, error: "<field>: <message>; ..." }` with 400 status

### Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to this task)
- All modified files pass ESLint cleanly
