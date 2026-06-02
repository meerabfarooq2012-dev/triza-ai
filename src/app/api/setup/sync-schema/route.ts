import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Schema Sync Endpoint — Adds missing columns/tables to the production database
 *
 * GET /api/setup/sync-schema?key=marketo-setup-2024
 *
 * This runs ALTER TABLE statements to add any missing columns that the
 * Prisma schema expects but the database doesn't have yet.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'marketo-setup-2024') {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    const results: string[] = []

    // Helper to safely add a column (ignore if exists)
    const addColumnIfMissing = async (table: string, column: string, type: string) => {
      try {
        await db.$executeRawUnsafe(`
          ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${type};
        `)
        results.push(`✅ Added ${table}.${column}`)
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists')) {
          results.push(`⏭️ ${table}.${column} already exists`)
        } else {
          results.push(`❌ ${table}.${column}: ${err.message || 'unknown error'}`)
        }
      }
    }

    // Helper to safely create a table
    const createTableIfMissing = async (table: string, sql: string) => {
      try {
        await db.$executeRawUnsafe(sql)
        results.push(`✅ Created table ${table}`)
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists')) {
          results.push(`⏭️ Table ${table} already exists`)
        } else {
          results.push(`❌ Table ${table}: ${err.message || 'unknown error'}`)
        }
      }
    }

    // ─── User table missing columns ──────────────────────────────────────
    await addColumnIfMissing('User', 'trustLevel', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('User', 'verifiedAt', 'TIMESTAMP')
    await addColumnIfMissing('User', 'isVerified', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'isAdmin', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'isActive', 'BOOLEAN DEFAULT true')
    await addColumnIfMissing('User', 'bio', 'TEXT')
    await addColumnIfMissing('User', 'phone', 'TEXT')
    await addColumnIfMissing('User', 'location', 'TEXT')

    // ─── Shop table missing columns ──────────────────────────────────────
    await addColumnIfMissing('Shop', 'verificationStatus', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustLevel', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustScore', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'badges', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Shop', 'verifiedAt', 'TIMESTAMP')
    await addColumnIfMissing('Shop', 'totalSales', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'totalReviews', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'averageRating', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Shop', 'customSections', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Shop', 'primaryColor', 'TEXT DEFAULT \'#6366f1\'')
    await addColumnIfMissing('Shop', 'secondaryColor', 'TEXT DEFAULT \'#8b5cf6\'')
    await addColumnIfMissing('Shop', 'accentColor', 'TEXT DEFAULT \'#a78bfa\'')
    await addColumnIfMissing('Shop', 'layoutStyle', 'TEXT DEFAULT \'grid\'')
    await addColumnIfMissing('Shop', 'displayStyle', 'TEXT DEFAULT \'modern\'')

    // ─── Product table missing columns ────────────────────────────────────
    await addColumnIfMissing('Product', 'deliveryInfo', 'TEXT')
    await addColumnIfMissing('Product', 'deliveryCountries', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Product', 'requirements', 'TEXT')
    await addColumnIfMissing('Product', 'comparePrice', 'DOUBLE PRECISION')
    await addColumnIfMissing('Product', 'fileUrl', 'TEXT')
    await addColumnIfMissing('Product', 'fileSize', 'TEXT')
    await addColumnIfMissing('Product', 'sku', 'TEXT')
    await addColumnIfMissing('Product', 'isFeatured', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('Product', 'totalSales', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'totalReviews', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'averageRating', 'DOUBLE PRECISION DEFAULT 0')

    // ─── Order table missing columns ─────────────────────────────────────
    await addColumnIfMissing('Order', 'shippingMethod', 'TEXT')
    await addColumnIfMissing('Order', 'carrier', 'TEXT')
    await addColumnIfMissing('Order', 'estimatedDelivery', 'TIMESTAMP')
    await addColumnIfMissing('Order', 'deliveredAt', 'TIMESTAMP')
    await addColumnIfMissing('Order', 'platformFee', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Order', 'shippingCost', 'DOUBLE PRECISION DEFAULT 0')

    // ─── SellerVerification table missing columns ────────────────────────
    await addColumnIfMissing('SellerVerification', 'businessName', 'TEXT')
    await addColumnIfMissing('SellerVerification', 'businessAddress', 'TEXT')
    await addColumnIfMissing('SellerVerification', 'notes', 'TEXT')

    // ─── Create missing tables ───────────────────────────────────────────

    // SellerTier table
    await createTableIfMissing('SellerTier', `
      CREATE TABLE IF NOT EXISTS "SellerTier" (
        "id" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "tier" TEXT NOT NULL DEFAULT 'bronze',
        "totalSales" INTEGER NOT NULL DEFAULT 0,
        "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalReviews" INTEGER NOT NULL DEFAULT 0,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "avgShipDays" DOUBLE PRECISION,
        "trustScore" INTEGER NOT NULL DEFAULT 0,
        "nextTier" TEXT,
        "progressPercent" INTEGER NOT NULL DEFAULT 0,
        "calculatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL,
        CONSTRAINT "SellerTier_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SellerTier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "SellerTier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "SellerTier_shopId_key" ON "SellerTier"("shopId");
      CREATE UNIQUE INDEX IF NOT EXISTS "SellerTier_userId_key" ON "SellerTier"("userId");
      CREATE INDEX IF NOT EXISTS "SellerTier_tier_index" ON "SellerTier"("tier");
      CREATE INDEX IF NOT EXISTS "SellerTier_calculatedAt_index" ON "SellerTier"("calculatedAt");
    `)

    // NotificationPreference table
    await createTableIfMissing('NotificationPreference', `
      CREATE TABLE IF NOT EXISTS "NotificationPreference" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
        "paymentAlerts" BOOLEAN NOT NULL DEFAULT true,
        "newMessages" BOOLEAN NOT NULL DEFAULT true,
        "reviewNotifications" BOOLEAN NOT NULL DEFAULT true,
        "shopUpdates" BOOLEAN NOT NULL DEFAULT true,
        "promotions" BOOLEAN NOT NULL DEFAULT true,
        "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
        "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
        "desktopNotifications" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL,
        CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
      CREATE INDEX IF NOT EXISTS "NotificationPreference_userId_index" ON "NotificationPreference"("userId");
    `)

    // Dispute-related tables
    await createTableIfMissing('DisputeMessage', `
      CREATE TABLE IF NOT EXISTS "DisputeMessage" (
        "id" TEXT NOT NULL,
        "disputeId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isInternal" BOOLEAN NOT NULL DEFAULT false,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL,
        CONSTRAINT "DisputeMessage_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DisputeMessage_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "DisputeMessage_disputeId_index" ON "DisputeMessage"("disputeId");
      CREATE INDEX IF NOT EXISTS "DisputeMessage_senderId_index" ON "DisputeMessage"("senderId");
      CREATE INDEX IF NOT EXISTS "DisputeMessage_createdAt_index" ON "DisputeMessage"("createdAt");
    `)

    await createTableIfMissing('DisputeEvidence', `
      CREATE TABLE IF NOT EXISTS "DisputeEvidence" (
        "id" TEXT NOT NULL,
        "disputeId" TEXT NOT NULL,
        "uploadedBy" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "DisputeEvidence_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DisputeEvidence_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "DisputeEvidence_disputeId_index" ON "DisputeEvidence"("disputeId");
      CREATE INDEX IF NOT EXISTS "DisputeEvidence_uploadedBy_index" ON "DisputeEvidence"("uploadedBy");
    `)

    await createTableIfMissing('DisputeTimeline', `
      CREATE TABLE IF NOT EXISTS "DisputeTimeline" (
        "id" TEXT NOT NULL,
        "disputeId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "DisputeTimeline_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DisputeTimeline_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "DisputeTimeline_disputeId_index" ON "DisputeTimeline"("disputeId");
      CREATE INDEX IF NOT EXISTS "DisputeTimeline_createdAt_index" ON "DisputeTimeline"("createdAt");
    `)

    // Try running admin setup too
    try {
      const setupRes = await fetch(new URL('/api/setup/admin?key=marketo-setup-2024', request.url))
      const setupData = await setupRes.json()
      results.push(`Admin setup: ${setupData.success ? '✅ ' + setupData.message : '❌ ' + setupData.error}`)
    } catch {
      results.push('Admin setup: skipped (may already be set up)')
    }

    return NextResponse.json({
      success: true,
      message: 'Schema sync complete',
      results,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: 'Schema sync failed: ' + errMsg },
      { status: 500 }
    )
  }
}
