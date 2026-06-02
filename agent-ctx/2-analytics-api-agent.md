# Task 2 — Seller Analytics API Agent

## Task
Create a dedicated backend API for seller analytics at `/api/analytics/seller/route.ts`

## What was done
- Created `/home/z/my-project/src/app/api/analytics/seller/route.ts`
- GET handler accepts `userId` query parameter
- Validates user exists and has a shop (returns 404 if not)
- Returns comprehensive analytics in `{ success: true, data: { ... } }` format

## Data returned
1. **summary** — totalRevenue, totalOrders, totalProducts, totalReviews, averageRating, pendingOrders, completedOrders, cancelledOrders, thisMonthRevenue, lastMonthRevenue, monthlyRevenueChange, thisWeekOrders, lastWeekOrders, weeklyOrderChange
2. **revenueOverTime** — 12-month array `{ month: "Jan 2025", revenue, orders }` with zero-fill for missing months
3. **dailyRevenue** — 30-day array `{ date: "2025-01-15", revenue, orders }` with zero-fill for missing days
4. **orderStatusBreakdown** — `{ pending, processing, shipped, delivered, cancelled, refunded }`
5. **topProducts** — Top 5 by sales `{ id, name, price, totalSales, totalRevenue, averageRating, images }` with JSON.parsed images
6. **topCustomers** — Top 5 by spending `{ id, name, avatar, totalSpent, orderCount }`
7. **revenueByProductType** — `{ digital, physical, freelance }`
8. **recentReviews** — Last 5 reviews `{ id, rating, comment, userName, productName, createdAt }`

## Query strategy
- 16 parallel queries via `Promise.all` for efficiency
- Prisma `aggregate` and `groupBy` for simple aggregations
- Raw SQL (`$queryRaw`) with SQLite `strftime` for date-grouped and joined queries
- Revenue excludes cancelled/refunded orders
- All raw SQL numeric results converted with `Number()`

## Verification
- `bun run lint` — zero errors
- Dev server running correctly
