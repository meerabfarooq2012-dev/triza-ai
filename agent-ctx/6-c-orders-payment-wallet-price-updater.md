# Task 6-c: Orders/Payment/Wallet Price Updater

## Summary
Replaced all hardcoded price displays (`$${price.toFixed(2)}`, `Rs.` patterns, custom `formatCurrency()`) across 21 files with the shared `<Price>` component and `formatPriceUtil` utility from `@/components/marketplace/shared/price`.

## Files Updated (21 files, ~90+ price instances replaced)

### Orders
1. **order-tracking-page.tsx** — 7 price instances (item unit price, line total, subtotal, platform fee, tax, shipping, total)

### Buyer
2. **buyer-orders.tsx** — 4 price instances (item unit price ×2, line total ×2, order total)
3. **buyer-overview.tsx** — 1 price instance (total spent stat card)

### Seller
4. **seller-orders.tsx** — 4 price instances (item unit price ×2, line total ×2, order total)
5. **seller-products.tsx** — 3 price instances (table price with compare, grid price)
6. **seller-overview.tsx** — 2 price instances (revenue stat, product price)
7. **seller-analytics.tsx** — 13 instances — **removed custom `formatCurrency()` function** and replaced all uses with `formatPriceUtil` (tooltip components, heatmap, stats cards, revenue by type, top products, top customers)
8. **seller-flash-sales.tsx** — 4 price instances (sale price + original price, product select, original price label)
9. **seller-coupons.tsx** — 3 price instances (fixed coupon value, min order, max discount)
10. **seller-gigs.tsx** — 2 price instances (table price, grid price)
11. **bulk-product-upload.tsx** — 1 price instance (preview table price)
12. **variant-manager.tsx** — 1 price instance (toast message for price adjustment)

### Payment
13. **checkout-modal.tsx** — ~21 price instances (item prices, subtotals, coupon values/discounts, platform fee, seller payout, tax, shipping, total, "Pay $X" buttons, amount displays for all payment methods, fee breakdown, payment confirmation)
14. **seller-wallet.tsx** — 11 price instances (chart tooltip, 4 stat cards, transaction amount/balance, withdrawal amount, withdrawal table amount/fee/net)
15. **order-payment-status.tsx** — 5 price instances (total paid, platform fee, seller payout, confirm dialog amounts)

### Returns
16. **returns-page.tsx** — 1 price instance (refund amount)
17. **return-detail-page.tsx** — 7 price instances (item unit price, line total, order total ×3, refund amount ×2)

### Disputes
18. **dispute-detail-page.tsx** — 5 price instances (item unit price, line total, order total, refund form order total)
19. **file-dispute-dialog.tsx** — 1 price instance (order select dropdown)

### Shipping
20. **shipping-method-selector.tsx** — 4 price instances (**replaced `Rs.` hardcoded patterns** with `<Price>` — free above, strikethrough price, normal price, selected method price)
21. **shipping-settings.tsx** — 5 price instances (form preview, rate list prices, detail view prices, free above amounts)

## Approach
- **JSX rendering**: Used `<Price>` component with appropriate `size` prop (`xs` for tiny text, `sm` for normal, `lg` for totals, `2xl` for hero amounts)
- **String/template literal contexts** (toast messages, chart labels, title attributes): Used `formatPriceUtil()` from `@/components/marketplace/shared/price`
- **Stat cards**: Changed `value` field from string to `<Price>` ReactNode where prices are displayed
- **Compare prices**: Used `<Price amount={...} compare={...} />` for strikethrough display
- **`Rs.` currency patterns**: Replaced with `<Price>` which auto-converts based on user's currency preference

## Key Decisions
- Removed the custom `formatCurrency()` in seller-analytics.tsx entirely — replaced with shared `formatPriceUtil`
- For "Pay $X" buttons in checkout modal, restructured to use React Fragment: `<>Pay <Price ... /></>`
- All amounts passed to `<Price>` remain in base currency (USD) — the component handles conversion
- The `formatPriceUtil` defaults to USD but accepts a currency parameter for future use

## Lint
0 errors, 1 pre-existing warning (unrelated)
