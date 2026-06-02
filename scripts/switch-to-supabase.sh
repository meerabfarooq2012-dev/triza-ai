#!/bin/bash
# =============================================================================
# Marketo — Switch from SQLite to Supabase PostgreSQL
# =============================================================================
# Run this script before deploying to Vercel to switch the database to Supabase.
#
# Usage: bash scripts/switch-to-supabase.sh
# =============================================================================

set -e

echo "🔄 Switching Marketo from SQLite to Supabase PostgreSQL..."
echo ""

# Step 1: Copy production schema
echo "📝 Step 1: Switching Prisma schema to PostgreSQL..."
cp prisma/schema.production.prisma prisma/schema.prisma
echo "   ✅ Prisma schema switched to PostgreSQL"

# Step 2: Update .env
echo ""
echo "📝 Step 2: Updating .env for Supabase..."
echo "   Please make sure your .env has these values:"
echo ""
echo "   DATABASE_URL=\"postgresql://postgres.veplxumszgotnkassotw:hyrXGq0aYEohK4AX@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require\""
echo "   DIRECT_URL=\"postgresql://postgres:hyrXGq0aYEohK4AX@db.veplxumszgotnkassotw.supabase.co:5432/postgres?sslmode=require\""
echo ""

# Step 3: Push schema to Supabase
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
