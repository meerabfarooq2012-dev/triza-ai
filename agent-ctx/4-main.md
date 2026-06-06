# Task 4 — Dynamic SEO Meta Tags

**Agent:** main
**Status:** completed

## Summary

Created a client-side `DynamicSEO` component that dynamically updates `document.title`, meta description, Open Graph tags, Twitter Card tags, and canonical URL when navigating between views in the SPA. Since Marketo uses Zustand-based client-side routing, Next.js `generateMetadata` cannot be used traditionally — instead the component manipulates the DOM `<head>` directly.

## Files Changed

1. **`src/components/marketplace/shared/dynamic-seo.tsx`** — NEW (client component)
   - Subscribes to `currentView` and `viewParams` from Zustand store
   - Fetches product/shop/gig data from existing API routes
   - Updates document.title, meta description, OG tags, Twitter cards, canonical URL
   - Debounces rapid view changes (150ms)
   - Cleans up tags on unmount
   - Shows loading title while data fetches

2. **`src/app/page.tsx`** — MODIFIED
   - Added dynamic import for `DynamicSEO` with `withChunkRetry`
   - Added `<DynamicSEO />` in MarketplaceApp JSX

## Lint
- 0 errors, 4 pre-existing warnings (unrelated)
