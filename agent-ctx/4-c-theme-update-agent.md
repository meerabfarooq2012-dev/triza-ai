# Task 4-c: Obsidian & Gold Theme — Seller/Admin/Shop Components

## Status: COMPLETED

## Summary
Updated 6 marketplace component files (seller, admin, shop) to replace all violet/purple/pink/rose colors with amber/gold equivalents for the "Obsidian & Gold" luxury theme. Two additional files (shop-view.tsx, product-detail.tsx) required no changes.

## Files Modified

1. **seller/seller-analytics.tsx** — 4 changes
   - STATUS_COLORS shipped: `#8b5cf6` → `#d97706`
   - TYPE_COLORS freelance: `#8b5cf6` → `#d97706`
   - Average Rating stat card: `bg-violet-50` → `bg-amber-50`, `text-violet-600` → `text-amber-600`, `from-violet-500 to-purple-600` → `from-amber-500 to-amber-600`
   - MessageSquare icon: `text-violet-600` → `text-amber-600`

2. **seller/seller-overview.tsx** — 3 changes
   - Revenue stat card: `bg-violet-50` → `bg-amber-50`, `text-violet-600` → `text-amber-600`, `from-violet-500 to-purple-600` → `from-amber-500 to-amber-600`
   - BarChart3 icon: `text-violet-600` → `text-amber-600`
   - Revenue bar chart: `from-violet-500 to-purple-400` → `from-amber-600 to-amber-400`

3. **seller/seller-coupons.tsx** — 3 changes
   - getTypeBadgeClass 'fixed': `bg-violet-50 text-violet-700 border-violet-200` → amber equivalents
   - Total Savings stat: `bg-violet-50` → `bg-amber-50`, `text-violet-600` → `text-amber-600`
   - Coupon type selector 'fixed': `border-violet-400 bg-violet-50 text-violet-700` → amber equivalents

4. **admin/admin-dashboard.tsx** — 1 change
   - Active Withdrawals: `bg-violet-50 text-violet-600` → `bg-amber-50 text-amber-600`

5. **admin/admin-transactions.tsx** — 5 changes
   - ESCROW_STATUS_CONFIG refunded: `bg-rose-100 text-rose-800` → `bg-amber-100 text-amber-800`
   - Pending Withdrawals stat: violet → amber
   - Refund button: `text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200` → amber equivalents
   - Refund dialog title: `text-rose-600` → `text-amber-600`
   - Refund dialog info box: `bg-rose-50 border-rose-200`, `text-rose-800`, `text-rose-600` → amber equivalents

6. **admin/admin-categories.tsx** — 1 change
   - Digital CategoryTypeBadge: `bg-purple-50 text-purple-700 border-purple-200` → `bg-amber-50 text-amber-700 border-amber-200`

## Files Unchanged
- **shop/shop-view.tsx** — Uses dynamic shopColors, no hardcoded violet/purple/pink/rose Tailwind classes
- **shop/product-detail.tsx** — No violet/purple/pink/rose Tailwind classes present

## Verification
- Grep confirmed 0 remaining violet/purple/pink/rose matches in all 8 files
- Lint passes with 0 errors (2 pre-existing warnings)
- All emerald-* colors preserved as required
