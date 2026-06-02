# Task: Return & Refund System — Database Schema + API Routes

## Summary
Successfully implemented the complete Return & Refund system for the Marketo marketplace, including:
- 3 new Prisma models added to all 3 schema files
- 4 API route files created
- Database schema pushed successfully
- ESLint passes with no errors

## Schema Changes (All 3 files: schema.prisma, schema.sqlite.prisma, schema.postgresql.prisma)

### New Models
1. **ReturnRequest** — Core model for return/exchange/refund requests with fields for status tracking, refund amounts, methods, seller responses, admin notes, and timestamps for each state transition
2. **ReturnTimeline** — Audit trail for return request status changes
3. **ReturnPolicy** — Per-shop return policy configuration (period days, accepted methods, restocking fees, etc.)

### Updated Models
- **User** — Added `returnRequests ReturnRequest[]`
- **Shop** — Added `returnRequests ReturnRequest[]` and `returnPolicy ReturnPolicy?`
- **Order** — Added `returnRequest ReturnRequest?` (one-to-one via `@unique` on orderId)

## API Routes Created

### 1. `/api/returns/route.ts`
- **GET**: List return requests with filtering (userId, shopId, status, orderId), pagination, and full include of order items, user, shop, timeline
- **POST**: Create return request with validation (order exists, belongs to user, correct status, within return period, no existing active return)

### 2. `/api/returns/[id]/route.ts`
- **GET**: Single return request with full details (order items, payment, buyer/seller info, timeline)
- **PUT**: Update return request with action-based logic (approve, reject, cancel, processing) with proper status transitions and notifications

### 3. `/api/returns/[id]/process-refund/route.ts`
- **POST**: Process actual refund in a database transaction — credits buyer wallet, debits seller wallet (pending first, then available balance), updates payment escrow status, updates order status, creates transactions, sends notifications

### 4. `/api/returns/policy/route.ts`
- **GET**: Get return policy for a shop (returns defaults if no custom policy)
- **POST**: Upsert return policy with validation

## Verification Results
- `bun run db:push` — ✅ Schema synced successfully
- `bun run lint` — ✅ No errors
- API endpoint testing:
  - GET /api/returns — ✅ Returns paginated list
  - GET /api/returns/[id] — ✅ Returns 404 for non-existent
  - GET /api/returns/policy — ✅ Returns default/custom policy
  - POST /api/returns/policy — ✅ Creates/updates policy
  - POST /api/returns — ✅ Validation errors work correctly
  - POST /api/returns/[id]/process-refund — ✅ Returns proper error for non-existent
