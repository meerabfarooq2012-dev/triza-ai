# Task 4-a: Landing Page Theme Update — Obsidian & Gold

## Summary
Updated all 12 landing page components to replace violet/purple/pink/rose/fuchsia colors with amber/gold equivalents for the "Obsidian & Gold" luxury theme.

## Files Modified (12)
1. `about-section.tsx` — Badge, heading gradient, card gradients, motive banner
2. `browse-by-type-section.tsx` — Physical Products card colors
3. `categories-section.tsx` — Category gradients, icon colors, all helper functions
4. `commission-section.tsx` — "10%" gradient, card shadows, trust badges
5. `cta-section.tsx` — Background gradient, button text color
6. `featured-products-section.tsx` — Buttons, card hovers, placeholders, price gradient
7. `features-section.tsx` — Feature card gradients, hover states
8. `flash-deals-section.tsx` — Banner gradient end color
9. `gigs-section.tsx` — 4 gig category color entries
10. `how-it-works-section.tsx` — Connecting line, number circles, step badges
11. `popular-shops-section.tsx` — Buttons, card hovers, banner, logo text
12. `testimonials-section.tsx` — Icon background, CTA button

## Key Decisions
- Used `gold-gradient` CSS class for prominent gradient backgrounds (about motive banner, CTA section)
- Used `gold-gradient-text` CSS class for text gradients (about heading, featured products price, commission "10%")
- Replaced `from-violet-600 to-rose-500` → `from-amber-600 to-amber-500` per spec rules
- Kept `emerald-*` colors untouched (success/money indicators)
- Flash deals banner kept orange/red urgency colors, only changed rose → amber at the end

## Verification
- grep for violet/purple/pink/rose/fuchsia across all 12 files: 0 matches
- Lint: 0 errors, 2 pre-existing warnings
