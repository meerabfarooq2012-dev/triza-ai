# Task 10 - Admin Settings Database Persistence

## Agent: main

## Summary
Migrated Admin Settings from in-memory/localStorage to database persistence via Prisma `PlatformSettings` model.

## Files Modified
1. `prisma/schema.prisma` — Added PlatformSettings model
2. `prisma/schema.sqlite.prisma` — Added PlatformSettings model
3. `prisma/schema.postgresql.prisma` — Added PlatformSettings model
4. `src/app/api/admin/settings/route.ts` — New: GET + PATCH endpoints
5. `src/lib/api.ts` — Added getSettings/updateSettings to adminApi
6. `src/components/marketplace/admin/admin-settings.tsx` — Rewrote to use API calls

## Key Decisions
- Single-row pattern with `id = "default"` for PlatformSettings
- Upsert on PATCH to handle first-save scenario
- Rate-limited both endpoints with apiRateLimit preset
- Toast notifications via sonner for save feedback
- Upload Limits section kept but disabled (fields not in DB model yet)

## Verification
- `bun run db:push` — successful
- `bun run lint` — 0 errors, 1 pre-existing warning
- Dev server running without errors
