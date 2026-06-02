# Task 3-a: Shipping & Delivery Management API Routes

## Agent: shipping-api-builder

## Summary
Created/rewrote 9 API route files for the Marketo marketplace shipping & delivery management system.

## Files Created/Rewritten

### Shipping Zones
1. `src/app/api/shipping/zones/route.ts` — GET (list by shopId with rates) + POST (create zone)
2. `src/app/api/shipping/zones/[id]/route.ts` — GET (single zone) + PUT (update) + DELETE (cascade)

### Shipping Rates
3. `src/app/api/shipping/rates/route.ts` — GET (list by zoneId) + POST (create rate)
4. `src/app/api/shipping/rates/[id]/route.ts` — GET (single rate) + PUT (update) + DELETE

### Shipping Calculator
5. `src/app/api/shipping/calculate/route.ts` — POST (calculate options with weight? param)

### Addresses (NEW path: /api/addresses/)
6. `src/app/api/addresses/route.ts` — GET (list by userId) + POST (create)
7. `src/app/api/addresses/[id]/route.ts` — GET + PUT + DELETE

### Shipments (NEW path: /api/shipments/)
8. `src/app/api/shipments/route.ts` — GET (list by orderId/status) + POST (create with OrderStatusLog)
9. `src/app/api/shipments/[id]/route.ts` — GET + PUT (with OrderStatusLog) + DELETE

## Key Design Decisions
- Proper RESTful separation: GET/POST on base routes, GET/PUT/DELETE on [id] routes
- Countries stored as JSON.stringify'd string, parsed back with JSON.parse on read
- Shipment status changes automatically sync Order status and create OrderStatusLog entries
- Addresses at /api/addresses/ (not /api/shipping/addresses/) per spec
- Shipments at /api/shipments/ (not /api/shipping/shipments/) per spec
- Calculate route uses `weight?` param instead of `items[]` array per spec
- Consistent error handling and response format across all routes

## Status
- All ESLint checks pass (zero errors)
- Dev server running correctly
