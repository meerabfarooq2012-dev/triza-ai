# Task 5: Seed Script Developer

## Task
Create a comprehensive seed script to populate the database with realistic demo data.

## What Was Done
1. Created `/home/z/my-project/prisma/seed.ts` (~780 lines)
2. Added `"db:seed": "bun run prisma/seed.ts"` to package.json
3. Fixed Prisma validation error (tags must be JSON string not array)
4. Successfully ran the seed script

## Seed Data Summary
- **Users**: 11 (1 admin, 5 sellers, 5 buyers) — all with bcryptjs hashed passwords
- **Shops**: 5 — each with unique color themes, layout styles, social links, custom sections
- **Categories**: 15 — all DEFAULT_CATEGORIES from constants
- **Products**: 20 — mix of digital (12), physical (4), freelance (4) with realistic pricing
- **Orders**: 10 — mix of statuses with items, shipping info, platform fees
- **Reviews**: 13 — 10 product + 3 shop reviews, ratings 3-5 stars
- **Notifications**: 61 — 5-6 per user, mix of types, some read/some unread
- **Messages**: 10 — 3 buyer-seller conversations
- **Favorites**: 12 — spread across buyers and products
- **PlatformStats**: 1 — aggregated stats

## Login Credentials
- Admin: admin@marketo.com / admin123
- Sellers: sarah/marcus/elena/james/priya @ their domains / password123
- Buyers: alex/mia/david/olivia/ryan @ email.com / password123

## Key Decisions
- Script is idempotent: clears all data before seeding (deleteMany at start)
- JSON fields (tags, images, customSections) properly stringified for Prisma SQLite
- Products distributed across shops with type-appropriate fields
- Order status/payment status mapping ensures consistency
- Shop ratings and product ratings updated after review creation
