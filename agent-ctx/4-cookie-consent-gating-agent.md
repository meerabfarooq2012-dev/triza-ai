# Task 4 — Gate Analytics/Tracking with Cookie Consent State

**Agent**: full-stack-developer

## Work Log

- Read existing cookie consent store (`use-cookie-consent-store.ts`), cookie consent component (`cookie-consent.tsx`), and footer component (`footer.tsx`)
- Created `src/hooks/use-analytics.ts` — Safe analytics hook that checks `consentGiven && analyticsEnabled` before tracking events and page views. Dev-mode console logging included, with TODO comments for real analytics provider integration.
- Created `src/hooks/use-marketing-consent.ts` — Hook for marketing cookie consent with derived booleans: `canShowPersonalizedAds`, `canTrackConversions`, `canUseRetargeting`, `isMarketingEnabled`. All gated on `consentGiven && marketingEnabled`.
- Updated `src/components/marketplace/layout/cookie-consent.tsx` — Added `useEffect` import and custom event listener for `marketo:open-cookie-preferences` that sets `preferencesOpen(true)`, allowing external components to reopen the preferences sheet.
- Updated `src/components/marketplace/layout/footer.tsx` — Replaced static "Cookies" anchor with a "Cookie Settings" button that dispatches the `marketo:open-cookie-preferences` custom event.

## Stage Summary

- Analytics and marketing tracking are now gated behind cookie consent state via two new hooks (`useAnalytics`, `useMarketingConsent`)
- Footer has a functional "Cookie Settings" button that reopens the cookie consent preferences dialog
- Custom event pattern (`marketo:open-cookie-preferences`) decouples footer from cookie consent component
- All files pass lint (0 new errors)
