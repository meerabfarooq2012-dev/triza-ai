# Task 6: Dark Mode Polish

## Summary
Audited and fixed dark mode issues across the entire Marketo marketplace codebase. The project uses `next-themes` with `attribute="class"` and Tailwind CSS dark: prefixed classes.

## Key Findings
1. **text-gray-900** was the most pervasive issue - used in 45+ files without `dark:text-gray-100`, making text nearly invisible on dark backgrounds
2. **bg-white** used in 30+ files without `dark:bg-gray-900` or `dark:bg-gray-800`
3. **border-gray-200** / **border-gray-100** used in 20+ files without `dark:border-gray-700`
4. **bg-gray-50** used in 25+ files without `dark:bg-gray-800/50`
5. **Amber/gold badges** (product type badges, variant badges) lacked dark variants
6. **Gold-gradient buttons** used `text-white` which is hard to read on amber in dark mode (should be `dark:text-gray-900`)

## Files Modified (50+ files)
- messages-page.tsx (30+ fixes - worst offender)
- seller-analytics.tsx, seller-overview.tsx, seller-orders.tsx, seller-products.tsx, seller-gigs.tsx, seller-coupons.tsx, seller-messages.tsx, seller-shop-settings.tsx, seller-reviews.tsx, seller-qa.tsx, seller-flash-sales.tsx, bulk-product-upload.tsx, variant-manager.tsx
- buyer-overview.tsx, buyer-orders.tsx, buyer-payments.tsx, buyer-favorites.tsx, buyer-wishlists.tsx, buyer-messages.tsx, wishlist-page.tsx
- product-card.tsx, cart-drawer.tsx, review-section.tsx, product-qa.tsx, variant-selector.tsx, wishlist-button.tsx, compare-bar.tsx, share-shop-url.tsx, public-wishlist.tsx, feedback-widget.tsx
- header.tsx, hero-section.tsx, cta-section.tsx, browse-by-type-section.tsx
- auth-modal.tsx, two-factor-setup.tsx, change-password-form.tsx, reset-password-dialog.tsx
- search-page.tsx, search-autocomplete.tsx, comparison-view.tsx
- gig-detail.tsx, gigs-browse.tsx, shop-view.tsx, product-detail.tsx
- verification-page.tsx, seller-trust-badge.tsx
- dispute-center-page.tsx, dispute-detail-page.tsx, file-dispute-dialog.tsx
- notifications-page.tsx, order-tracking-page.tsx, returns-page.tsx, return-detail-page.tsx
- checkout-modal.tsx, payment-info-form.tsx, payment-settings-page.tsx, seller-wallet.tsx, order-payment-status.tsx
- admin-reports.tsx, admin-verifications.tsx, admin-categories.tsx, admin-transactions.tsx, admin-returns.tsx
- shipment-tracker.tsx, address-book.tsx, shipping-method-selector.tsx
- user-profile.tsx, create-story-dialog.tsx, story-viewer.tsx, follow-button.tsx, activity-feed-page.tsx

## Lint Results
- 0 errors, 3 pre-existing warnings (unchanged)
