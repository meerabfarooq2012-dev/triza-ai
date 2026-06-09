# Task 3: Email Notifications for Order Status Changes

## Summary
Integrated email notifications into the order lifecycle by centralizing email sending inside `src/lib/notifications.ts`. Each `notifyOrder*` function now handles both in-app notifications AND email sending.

## Files Modified
- `src/lib/email-templates.ts` — Added `paymentReceivedSellerEmail` template
- `src/lib/notifications.ts` — Added email integration to `notifyOrderCreated`, `notifyOrderStatusUpdate`, `notifyPaymentReceived`; added helper functions `getVerifiedUserEmail()` and `getOrderItems()`
- `src/app/api/orders/route.ts` — Removed duplicate email sending code, now relies on `notifyOrderCreated`
- `src/app/api/orders/[id]/route.ts` — Removed duplicate email sending code, now relies on `notifyOrderStatusUpdate`

## Key Design Decisions
- Email sending centralized in notifications.ts (not in route handlers)
- `emailVerified` check enforced — only sends to verified email addresses
- All email sending is fire-and-forget via `sendEmailAsync`
- DB queries in notification functions keep signatures simple

## Lint Status
- All modified files pass ESLint cleanly
- Pre-existing errors in unrelated files remain
