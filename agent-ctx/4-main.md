## Task 4 — Enhanced Seller Analytics with Bar Chart and More Metrics

**Agent:** main
**Date:** 2025-03-04

### Summary
Added a Daily Orders Bar Chart, 2 new summary stat cards (Conversion Rate + Avg Order Value), and updated the skeleton loader — all to the seller analytics page. The API already returned all needed data so no backend changes were required.

### Changes Made

#### 1. File Modified: `src/components/marketplace/seller/seller-analytics.tsx`

**New Components:**
- **`OrdersTooltip`** — Custom tooltip for the bar chart showing date and order count with emerald color
- **`RechartsBarChart`** — Dynamic import of recharts `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer` — follows the exact same pattern as `RechartsAreaChart`
  - Uses `url(#ordersBarGradient)` (emerald-to-teal gradient) for bar fill
  - `radius={[4, 4, 0, 0]}` for rounded top corners
  - `maxBarSize={40}` for consistent bar width
  - `allowDecimals={false}` on YAxis for whole number order counts
  - Loading spinner height: 300px

**New Stat Cards (2):**
- **Conversion Rate**: `(completedOrders / totalOrders * 100).toFixed(1)%` — with `TrendingUp` icon, teal colors (`bg-teal-50`, `text-teal-600`, gradient `from-teal-500 to-emerald-600`)
- **Avg Order Value**: `formatCurrency(totalRevenue / totalOrders)` — with `DollarSign` icon, amber colors
- Both handle division by zero (show "N/A")

**Layout Changes:**
- Stats card grid changed from `lg:grid-cols-4` to `lg:grid-cols-3 xl:grid-cols-6` (6 cards total)
- Skeleton loader grid updated to match (`lg:grid-cols-3 xl:grid-cols-6`, 6 skeleton cards)
- Added skeleton for the bar chart section

**New Chart Section:**
- "Daily Orders" bar chart card placed between "Revenue Over Time" (section 2) and "Order Status Breakdown" (now section 4)
- Same time period toggle (7D/30D/12M) — synced via the shared `timePeriod` state
- Uses `hasOrdersData` check (`chartData.some((d) => d.orders > 0)`) for empty state
- Wrapped in `ChartErrorBoundary` with fallbackTitle "Orders chart could not load"
- Responsive container height: 300px
- Empty state uses `ShoppingCart` icon with "No order data yet" message

**Section numbering updated:** 
- Section 3 → Daily Orders Bar Chart (new)
- Section 4 → Order Status + Revenue by Type (was 3)
- Section 5 → Top Products (was 4)
- Section 6 → Top Customers + Recent Reviews (was 5)

#### 2. API — No Changes Needed
The existing `/api/analytics/seller/route.ts` already returns:
- `dailyRevenue` array with `{ date, revenue, orders }` fields
- `revenueOverTime` array with `{ month, revenue, orders }` fields
- `summary.completedOrders` and `summary.totalOrders` for conversion rate calculation

### Lint Results
- `seller-analytics.tsx` passes ESLint cleanly (0 errors, 0 warnings)
- Pre-existing lint issues in other files (`seller-reviews.tsx`, `use-recently-viewed.ts`) are unrelated
