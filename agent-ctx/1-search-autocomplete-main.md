## Task 1 — Search Autocomplete for Marketo Marketplace

**Task ID:** 1
**Agent:** main

### Summary
Implemented instant search autocomplete suggestions for the Marketo marketplace header search bar. Created a suggestions API endpoint, a responsive autocomplete dropdown component with keyboard navigation, and integrated it into the existing header component.

### Changes Made

#### 1. Search Suggestions API (`src/app/api/search/suggestions/route.ts`) — NEW
- **GET /api/search/suggestions** — Returns instant search suggestions
- Accepts query params: `q` (search query), `limit` (default 8, max 20)
- Searches products by name (case-insensitive, contains) — limited to 5 results
- Searches shops by name (case-insensitive, contains) — limited to 3 results
- Returns combined results grouped by type: `{ products: [...], shops: [...] }`
- Product results include: id, name, price, images (parsed from JSON), type, shop name
- Shop results include: id, name, slug, logo, product count
- Handles empty query gracefully (returns empty arrays)
- Runs product and shop queries in parallel with `Promise.all`
- Orders results by total sales descending for relevance

#### 2. SearchAutocomplete Component (`src/components/marketplace/search/search-autocomplete.tsx`) — NEW
- `'use client'` component with props: query, onSelectProduct, onSelectShop, onClose, onViewAll
- **Debounced search** (300ms) using custom `useDebounce` hook
- **Dropdown sections:**
  - Products: thumbnail (40x40), name, price (amber-600), shop name, type badge
  - Shops: avatar/logo, name, product count
  - "View all results for ..." link at bottom (amber-600 accent)
- **Keyboard navigation:** Arrow up/down to navigate, Enter to select, Escape to close
- **Mouse interaction:** Click outside to close, hover to highlight items
- **Loading state:** Spinner with "Searching..." text (amber-500 spinner)
- **Empty state:** "No results found for ..." with suggestion text
- **Styling:** white bg, shadow-xl, rounded-lg, max-h-96 overflow-y-auto, border
- **Gold accent colors:** amber-50/600/950 for highlights, amber-600 for prices and links
- **Responsive type badges:** Digital (sky), Physical (emerald), Service (amber)
- Custom scrollbar styling for the overflow area

#### 3. Header Component Updates (`src/components/marketplace/layout/header.tsx`) — MODIFIED
- Imported `SearchAutocomplete` component
- Added `searchFocused` state and `mobileSearchInputRef` ref
- Added `showAutocomplete` derived state (query ≥ 2 chars AND input focused)
- Added handler functions:
  - `handleSelectProduct(id)` — navigates to product-detail, clears input
  - `handleSelectShop(slug)` — navigates to shop-view, clears input
  - `handleAutocompleteClose()` — hides autocomplete by setting searchFocused false
  - `handleViewAllResults()` — navigates to search view with query
- **Desktop search bar:** Wrapped in `relative` container, autocomplete renders below the form
- **Mobile search bar:** Added `onFocus` handler, autocomplete renders inside expanded search area with padding
- Both search inputs now have `onFocus={() => setSearchFocused(true)}` to trigger autocomplete
- On form submit (Enter), autocomplete closes before navigation
- On autocomplete selection, search input clears and focus state resets

### Lint Results
- 0 new errors, 0 new warnings in modified/created files
- Pre-existing errors (3) and warning (1) in unrelated files remain unchanged
