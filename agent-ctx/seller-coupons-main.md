# Task: Seller Coupon Management UI Component

## Task ID: seller-coupons-main

## Summary
Built a complete Seller Coupon Management UI component for the Marketo marketplace, including database schema, API routes, and the frontend component.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Added `Coupon` model with fields: id, shopId, code, description, type, value, minOrderAmount, maxDiscount, usageLimit, usedCount, perUserLimit, startDate, endDate, appliesToType, productId, isActive, createdAt, updatedAt
- Added `CouponUsage` model with fields: id, couponId, userId, orderId, discountAmount, createdAt
- Added `coupons` relation to `Shop` model
- Pushed schema changes with `bun run db:push`

### 2. API Routes
- **GET `/api/coupons?shopId=xxx`** - Fetches all coupons for a shop with stats (total, active, totalRedemptions, totalSavings)
- **POST `/api/coupons`** - Creates a new coupon with validation and duplicate code check
- **PATCH `/api/coupons/[id]`** - Updates a coupon with partial data support
- **DELETE `/api/coupons/[id]`** - Deletes a coupon

### 3. Frontend Component (`src/components/marketplace/seller/seller-coupons.tsx`)
Complete coupon management page with:
- **Header Section**: Title with Ticket icon, Create Coupon button, Refresh button
- **Stats Cards**: Total coupons, Active, Redemptions, Total Savings (with framer-motion animations)
- **Coupon List**: Cards for each coupon showing:
  - Code (monospace, dark bg, copy button)
  - Type badge (emerald for percentage, violet for fixed, sky for free_shipping)
  - Status badge (Active/Inactive/Expired/Used Up/Scheduled)
  - Value display (20% OFF, $5.00 OFF, FREE SHIPPING)
  - Usage progress bar with count
  - Min order amount, dates, applies to type
  - Action buttons: Edit, Toggle Active, Delete
  - Empty state when no coupons
  - Loading skeletons
- **Create/Edit Dialog**: Full form with:
  - Code input with Generate Code button
  - Description (optional)
  - Type selector with radio-style cards (percentage/fixed/free_shipping)
  - Conditional value input (% or $)
  - Max discount (percentage only)
  - Min order amount
  - Usage limit & per user limit
  - Start/end date pickers
  - Applies to type selector
  - Active toggle switch
- **Delete Confirmation**: AlertDialog with warning

### 4. Integration
- Added `SellerCoupons` tab to `SellerDashboard` component
- Tab labeled "🎟️ Coupons" between Payment Info and Messages

## Files Created/Modified
- `prisma/schema.prisma` - Added Coupon & CouponUsage models
- `src/app/api/coupons/route.ts` - GET and POST handlers
- `src/app/api/coupons/[id]/route.ts` - PATCH and DELETE handlers
- `src/components/marketplace/seller/seller-coupons.tsx` - New component
- `src/components/marketplace/seller/seller-dashboard.tsx` - Added coupons tab

## Tech Stack Used
- Next.js 16 App Router with TypeScript
- Prisma ORM with SQLite
- shadcn/ui components (Card, Button, Badge, Input, Dialog, Select, Switch, Progress, AlertDialog, Skeleton, Separator, Label, Textarea)
- Framer Motion for animations
- Zustand store for user state
- Sonner for toast notifications
- Lucide React icons
