# Task 3: Dual-Database Configuration for Marketplace Project

## Summary
Created a smart dual-database configuration that allows the Next.js marketplace project to automatically use SQLite in the sandbox/development environment and Supabase PostgreSQL in production (Vercel). The sandbox doesn't support IPv6, so it can't connect to Supabase directly — this setup solves that problem.

## Files Created

### 1. `prisma/schema.sqlite.prisma`
- SQLite-specific Prisma schema
- Provider: `sqlite`, URL: `env("DATABASE_URL")`
- No `directUrl` (SQLite doesn't need it)
- All 22 models identical to the PostgreSQL version (User, Shop, Category, Product, Order, OrderItem, Review, Favorite, Notification, Conversation, Message, Dispute, SocialLink, Gig, PlatformStats, Wallet, Payment, Transaction, Withdrawal, PaymentInfo, FeedbackThread, FeedbackMessage)

### 2. `prisma/schema.postgresql.prisma`
- PostgreSQL-specific Prisma schema for Supabase production
- Provider: `postgresql`, URL: `env("DATABASE_URL")`, directUrl: `env("DIRECT_URL")`
- All models identical to the SQLite version — only datasource config differs

### 3. `scripts/switch-db.ts`
- Smart switch script that:
  - Reads `DATABASE_URL` from env or `.env` file
  - Detects database type: `file:` → SQLite, `postgresql:` → PostgreSQL
  - Copies the appropriate schema to `prisma/schema.prisma`
  - Skips copy if schema already matches (idempotent)
  - Runs `prisma generate` after switching
  - Provides clear console output for debugging

## Files Modified

### 4. `prisma/schema.prisma`
- Changed from PostgreSQL datasource to SQLite datasource
- `provider: "sqlite"`, `url: env("DATABASE_URL")` (no directUrl)
- Active schema now matches `schema.sqlite.prisma` for current sandbox use

### 5. `.env`
- `DATABASE_URL="file:./db/custom.db"` (SQLite, active)
- Commented out Supabase PostgreSQL URLs with clear labels
- Production URLs preserved for Vercel deployment reference

### 6. `package.json`
- Added `"db:switch": "bun run scripts/switch-db.ts"` — manual switch command
- Added `"postinstall": "bun run scripts/switch-db.ts"` — auto-switch on install
- Added `"vercel-build": "bun run scripts/switch-db.ts && next build"` — Vercel build command

## Execution Results

- ✅ `prisma generate` — Generated Prisma Client v6.19.2 for SQLite successfully
- ✅ `prisma db push` — Database already in sync with SQLite schema
- ✅ `bun run scripts/switch-db.ts` — Correctly detected SQLite, schema matched, no changes needed
- ✅ `bun run db:seed` — Created admin user + 77 categories with 388 subcategories
- ✅ Dev server running correctly with SQLite — all database queries using `main.*` tables

## How It Works

1. **Development/Sandbox**: `DATABASE_URL="file:./db/custom.db"` → switch-db picks SQLite schema
2. **Production/Vercel**: Set env vars to PostgreSQL URLs → switch-db picks PostgreSQL schema
3. **Auto-switch**: `postinstall` hook runs switch-db automatically on `bun install`
4. **Vercel build**: `vercel-build` script runs switch-db before `next build`
5. **Manual switch**: `bun run db:switch` to switch anytime

## Architecture Decision

The dual-schema approach was chosen over alternatives because:
- Prisma doesn't support conditional datasource blocks
- The model definitions are identical across both databases (Prisma abstracts type differences)
- Only the datasource config (provider, url, directUrl) differs
- This approach is clean, maintainable, and works with CI/CD pipelines
