-- =============================================
-- Marketo - Supabase Seed Data
-- Run this AFTER running supabase-migration.sql
-- =============================================

-- Admin User (email: admin@marketo.com, password: admin123)
INSERT INTO "User" ("id", "email", "password", "name", "role", "isAdmin", "isActive", "isVerified", "createdAt", "updatedAt")
VALUES (
  'cmpshpzxg0000khnlezqnttkw',
  'admin@marketo.com',
  '$2b$10$.vTTRxUMF6KL7wkZRdqsWuFhcKZK97qpDR74BqYjhQHbCmFewMQqi',
  'Admin User',
  'both',
  true,
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Platform Stats
INSERT INTO "PlatformStats" ("id", "totalUsers", "totalSellers", "totalProducts", "totalOrders", "totalRevenue", "updatedAt")
VALUES ('platform-stats-001', 1, 0, 0, 0, 0, NOW()) ON CONFLICT DO NOTHING;

-- =============================================
-- NOTE: After deploying to Vercel, run the full
-- seed script to add 77 categories + 388
-- subcategories:
--   DATABASE_URL=<supabase-url> DIRECT_URL=<direct-url> bun run db:seed
-- =============================================
