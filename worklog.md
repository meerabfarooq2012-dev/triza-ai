---
Task ID: 1
Agent: Main
Task: Add category display to gig listing page

Work Log:
- Diagnosed that gig cards in GigsBrowse did not show category names/badges
- Added category badge overlay on gig card images (bottom-left, white backdrop)
- Added category icon + name tag above title in each gig card
- Replaced the old category grid with a proper sidebar layout:
  - Desktop: Sticky left sidebar with all 25 categories (scrollable)
  - Mobile: Sheet/drawer with category list (triggered by "Categories" button)
- Added active category filter chip at top with X to clear
- Added `icon` field to gig API category responses (gigs list, gig detail, create gig)
- Fixed div nesting for the new flex layout (sidebar + content)

Stage Summary:
- Gig listing now shows category on each gig card (image overlay + text tag)
- Desktop has a clean sidebar with all 25 freelance categories
- Mobile has a slide-out categories drawer
- Active filter shows as dismissible chip
- No lint errors, page compiles successfully
