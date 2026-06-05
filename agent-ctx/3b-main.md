# Task 3b — Chat Service Auto-Start, Return Seller Response, Stories Integration

**Task ID:** 3b  
**Agent:** main

## Summary

Implemented three features: (1) Verified chat and notification services are running and frontend connects properly via XTransformPort, (2) Fixed the return detail page API payload mismatch and enhanced seller response UI, (3) Created a StoryBar component and integrated it into the landing page.

## Changes Made

### HIGH 3: Chat Service Auto-Start

#### 1. Verified Chat Service Configuration
- Chat service at `mini-services/chat-service/` runs on port **3003**
- `package.json` already has `"dev": "bun --hot index.ts"` — properly configured ✓
- Uses socket.io with CORS origin `*`

#### 2. Verified Notification Service Configuration
- Notification service at `mini-services/notification-service/` runs on port **3004**
- `package.json` already has `"dev": "bun --hot index.ts"` — properly configured ✓
- Uses socket.io with CORS origin `*`

#### 3. Started Services
- Both services were already running on ports 3003 and 3004 (PIDs 21853 and 21854)
- Verified via `ss -tlnp` that ports are listening

#### 4. Verified Frontend Connection
- `buyer-messages.tsx`: uses `io('/?XTransformPort=3003', ...)` ✓
- `messages-page.tsx`: uses `io('/?XTransformPort=3003', ...)` ✓
- `seller-messages.tsx`: uses `io('/?XTransformPort=3003', ...)` ✓
- `use-realtime-notifications.tsx`: uses `io('/?XTransformPort=3004', ...)` ✓
- All socket.io connections use proper XTransformPort format — no direct localhost URLs ✓

### MED 4: Return Seller Response — Approve/Reject UI Fix

#### 1. Fixed API Payload Mismatch (Critical Bug Fix)
**Problem:** The frontend was sending `{ status: 'approved', ... }` but the API expects `{ userId, action: 'approve', ... }`. This meant approve/reject/cancel/processing buttons were completely broken.

**Fixed in `src/components/marketplace/returns/return-detail-page.tsx`:**
- `handleApprove()`: Changed from `{ status: 'approved', refundAmount, refundMethod }` → `{ userId: currentUser.id, action: 'approve', refundAmount, refundMethod }`
- `handleReject()`: Changed from `{ status: 'rejected', sellerResponse }` → `{ userId: currentUser.id, action: 'reject', sellerResponse }`
- `handleMarkProcessing()`: Changed from `{ status: 'processing' }` → `{ userId: currentUser.id, action: 'processing' }`
- `handleCancelReturn()`: Changed from `{ status: 'cancelled' }` → `{ userId: currentUser.id, action: 'cancel' }`
- Added `currentUser` destructuring from `useMarketplaceStore()`
- Added auth checks (`if (!currentUser?.id)`) before each action
- Updated toast messages to mention buyer notification

#### 2. Enhanced Seller Response Display
- Changed seller response card from only showing for rejected returns to showing for all returns with a seller response
- Added conditional styling: red border for rejected returns, amber border for other statuses (approved with note, etc.)
- Dynamic icon and text colors based on return status

#### 3. No API Changes Needed
- The backend API at `/api/returns/[id]` already supports `action: approve|reject|cancel|processing` with `userId` ✓
- The API already creates notifications for buyers on approve/reject ✓
- The API already creates timeline entries ✓

### MED 5: Stories Integration — Story Bar

#### 1. Created StoryBar Component (`src/components/marketplace/social/story-bar.tsx`)
**New file** with full feature set:
- Horizontal scrollable row of circular story avatars grouped by shop
- Gradient ring (amber-400→amber-600) for shops with unseen stories
- Gray ring for shops where all stories have been viewed
- Click opens the `StoryViewer` component with that shop's stories
- "Add Story" button for sellers (dashed amber border, Plus icon) — opens `CreateStoryDialog`
- Story count badge when a shop has multiple stories
- Type indicators: "🏷️ Deal" for promotions, "⭐ New" for product highlights
- "More" button when there are more than 8 shop groups
- Auto-refresh stories every 60 seconds
- Loading skeleton state
- Empty state: hidden if no stories and user is not a seller
- Fetches from `/api/social/stories?userId=...` (prioritizes followed shops)
- Custom scrollbar-hide CSS for clean horizontal scroll

#### 2. Integrated StoryBar into Landing Page (`src/components/marketplace/landing/landing-page.tsx`)
- Added `import { StoryBar } from '@/components/marketplace/social/story-bar'`
- Placed `<StoryBar />` between `<HeroSection />` and `<RecentlyViewedSection />`
- This positions the story bar right below the hero/search section for maximum visibility

### Lint Results
- 0 errors, 3 pre-existing warnings (unrelated to this task)
- All new and modified files pass ESLint cleanly
