#!/bin/bash
# =============================================================================
# Marketo — Switch back to SQLite for local/sandbox development
# =============================================================================
# Run this script when developing locally in the sandbox.
#
# Usage: bash scripts/switch-to-sqlite.sh
# =============================================================================

set -e

echo "🔄 Switching Marketo back to SQLite for sandbox development..."
echo ""

# Step 1: Update Prisma schema back to SQLite
echo "📝 Step 1: Switching Prisma schema to SQLite..."
cat > prisma/schema.prisma << 'SQLITE_SCHEMA'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
SQLITE_SCHEMA

# We need to keep the rest of the schema (models) - let's just change the datasource
# Actually, let's use sed to change just the provider and remove directUrl
echo "   Restoring full schema with SQLite provider..."

# Read the production schema but replace postgresql with sqlite
sed 's/provider  = "postgresql"/provider = "sqlite"/' prisma/schema.production.prisma | \
  sed '/directUrl/d' > prisma/schema.prisma

echo "   ✅ Prisma schema switched to SQLite"

# Step 2: Update .env
echo ""
echo "📝 Step 2: Updating .env for SQLite..."
# Create a temporary file with updated DATABASE_URL
sed 's|^DATABASE_URL=.*|DATABASE_URL="file:./db/custom.db"|' .env > .env.tmp
mv .env.tmp .env
echo "   ✅ .env updated for SQLite"

# Step 3: Push schema
echo ""
echo "📝 Step 3: Pushing SQLite schema..."
npx prisma db push
echo "   ✅ SQLite schema pushed"

# Step 4: Generate client
echo ""
echo "📝 Step 4: Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"

# Step 5: Seed if needed
echo ""
read -p "Seed the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx prisma db seed
  echo "   ✅ Database seeded"
fi

echo ""
echo "🎉 Done! Your app is now running with SQLite!"
