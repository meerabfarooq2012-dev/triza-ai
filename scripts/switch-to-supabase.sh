#!/bin/bash
# =============================================================================
# Thiora — Switch from SQLite to Supabase PostgreSQL
# =============================================================================
# Run this script before deploying to Vercel to switch the database to Supabase.
#
# Usage: bash scripts/switch-to-supabase.sh
#
# SECURITY: This script will NEVER hardcode database passwords.
# All credentials must be provided via environment variables.
# =============================================================================

set -e

echo "🔄 Switching Thiora from SQLite to Supabase PostgreSQL..."
echo ""

# Step 1: Copy production schema
echo "📝 Step 1: Switching Prisma schema to PostgreSQL..."
cp prisma/schema.production.prisma prisma/schema.prisma
echo "   ✅ Prisma schema switched to PostgreSQL"

# Step 2: Check environment variables
echo ""
echo "📝 Step 2: Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
  echo "   ⚠️  DATABASE_URL is not set!"
  echo "   Please set it in your .env file or environment:"
  echo '   DATABASE_URL="postgresql://postgres.[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"'
  echo ""
  echo "   Get this from: Supabase Dashboard → Settings → Database → Connection string (Transaction mode, port 6543)"
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  echo "   ⚠️  DIRECT_URL is not set!"
  echo "   Please set it in your .env file or environment:"
  echo '   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"'
  echo ""
  echo "   Get this from: Supabase Dashboard → Settings → Database → Connection string (Session mode, port 5432)"
  exit 1
fi

echo "   ✅ DATABASE_URL is set"
echo "   ✅ DIRECT_URL is set"

# Step 3: Push schema to Supabase
echo ""
echo "📝 Step 3: Pushing schema to Supabase..."
npx prisma db push
echo "   ✅ Schema pushed to Supabase"

# Step 4: Generate Prisma client
echo ""
echo "📝 Step 4: Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"

# Step 5: Seed the database
echo ""
echo "📝 Step 5: Seeding the database..."
npx prisma db seed
echo "   ✅ Database seeded"

echo ""
echo "🎉 Done! Your app is now connected to Supabase PostgreSQL!"
echo "   You can now deploy to Vercel."
