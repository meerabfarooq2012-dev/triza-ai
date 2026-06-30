import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

/**
 * POST /api/admin/sync-schema
 *
 * Syncs the Prisma schema with the database by running raw SQL
 * to create missing tables and add missing columns.
 *
 * Works with BOTH SQLite (local dev) and PostgreSQL (Vercel/Supabase).
 * Auto-detects the database type from DATABASE_URL.
 *
 * Protected by admin JWT authentication.
 */

interface SyncResult {
  name: string
  status: 'ok' | 'skipped' | 'error'
  error?: string
}

// Detect database type from DATABASE_URL
function getDatabaseType(): 'sqlite' | 'postgresql' {
  const url = process.env.DATABASE_URL || ''
  if (url.startsWith('file:')) return 'sqlite'
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
  // On Vercel, default to PostgreSQL
  if (process.env.VERCEL || process.env.VERCEL_ENV) return 'postgresql'
  return 'sqlite'
}

export async function POST(request: NextRequest) {
  try {
    // Require JWT admin authentication
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const dbType = getDatabaseType()
    const isPostgres = dbType === 'postgresql'

    console.log(`[sync-schema] Starting schema sync via raw SQL (${dbType})...`)

    const results: SyncResult[] = []

    // ─── Database-specific helpers ──────────────────────────────────────

    // Get list of tables
    const getTableList = async (): Promise<string[]> => {
      try {
        if (isPostgres) {
          const tables = await db.$queryRawUnsafe(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
          ) as any[]
          return tables.map((t: any) => t.tablename)
        } else {
          const tables = await db.$queryRawUnsafe(
            `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`
          ) as any[]
          return tables.map((t: any) => t.name)
        }
      } catch {
        return []
      }
    }

    // Check if a column exists in a table
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      try {
        if (isPostgres) {
          const cols = await db.$queryRawUnsafe(
            `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
            table, column
          ) as any[]
          return cols.length > 0
        } else {
          const cols = await db.$queryRawUnsafe(`PRAGMA table_info("${table}")`) as any[]
          return cols.some((c: any) => c.name === column)
        }
      } catch {
        return false
      }
    }

    // Helper: safely add a column (ignore if exists)
    const addColumnIfMissing = async (table: string, column: string, sqliteType: string, pgType: string) => {
      try {
        const exists = await columnExists(table, column)
        if (exists) {
          results.push({ name: `${table}.${column}`, status: 'skipped' })
          return
        }
        const type = isPostgres ? pgType : sqliteType
        if (isPostgres) {
          await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type};`)
        } else {
          await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type};`)
        }
        results.push({ name: `${table}.${column}`, status: 'ok' })
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          results.push({ name: `${table}.${column}`, status: 'skipped' })
        } else {
          results.push({ name: `${table}.${column}`, status: 'error', error: err.message?.slice(0, 200) || 'unknown error' })
        }
      }
    }

    // Helper: safely create a table
    // Uses tablesBefore (captured once at start) plus any tables created during this sync
    // to avoid extra DB queries and keep counts consistent
    const createdTables = new Set<string>()
    const createTableIfMissing = async (table: string, sqliteSql: string, pgSql: string) => {
      try {
        // Check if table already exists (using cached list + tables we created this run)
        if (tablesBefore.includes(table) || createdTables.has(table)) {
          results.push({ name: `Table: ${table}`, status: 'skipped' })
          return
        }
        const sql = isPostgres ? pgSql : sqliteSql
        await db.$executeRawUnsafe(sql)
        createdTables.add(table)
        results.push({ name: `Table: ${table}`, status: 'ok' })
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists')) {
          results.push({ name: `Table: ${table}`, status: 'skipped' })
        } else {
          results.push({ name: `Table: ${table}`, status: 'error', error: err.message?.slice(0, 200) || 'unknown error' })
        }
      }
    }

    // Helper: safely create an index
    const createIndexIfMissing = async (name: string, sqliteSql: string, pgSql: string) => {
      try {
        // Check if index already exists
        if (isPostgres) {
          const idxNameMatch = pgSql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?"?(\w+)"?/i)
          if (idxNameMatch) {
            const existing = await db.$queryRawUnsafe(
              `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1`,
              idxNameMatch[1]
            ) as any[]
            if (existing.length > 0) {
              results.push({ name: `Index: ${name}`, status: 'skipped' })
              return
            }
          }
        } else {
          const idxNameMatch = sqliteSql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([^"\s(]+)"?/i)
          if (idxNameMatch) {
            const existing = await db.$queryRawUnsafe(
              `SELECT name FROM sqlite_master WHERE type='index' AND name='${idxNameMatch[1]}'`
            ) as any[]
            if (existing.length > 0) {
              results.push({ name: `Index: ${name}`, status: 'skipped' })
              return
            }
          }
        }
        const sql = isPostgres ? pgSql : sqliteSql
        await db.$executeRawUnsafe(sql)
        results.push({ name: `Index: ${name}`, status: 'ok' })
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists')) {
          results.push({ name: `Index: ${name}`, status: 'skipped' })
        } else {
          results.push({ name: `Index: ${name}`, status: 'error', error: err.message?.slice(0, 200) || 'unknown error' })
        }
      }
    }

    // ─── Get existing tables ─────────────────────────────────────────────
    const tablesBefore = await getTableList()
    console.log('[sync-schema] Existing tables:', tablesBefore.length)

    // ═══════════════════════════════════════════════════════════════════════
    // MISSING COLUMNS
    // addColumnIfMissing(table, column, sqliteType, pgType)
    // ═══════════════════════════════════════════════════════════════════════

    // ─── User table ──────────────────────────────────────────────────────
    await addColumnIfMissing('User', 'trustLevel', 'TEXT DEFAULT \'none\'', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('User', 'verifiedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'isVerified', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'isAdmin', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'isActive', 'BOOLEAN DEFAULT 1', 'BOOLEAN DEFAULT true')
    await addColumnIfMissing('User', 'bio', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'phone', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'location', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'resetToken', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'resetTokenExpiry', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'emailVerifyToken', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'emailVerified', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'loginAttempts', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('User', 'lockoutUntil', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'lastLoginAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'deletedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'termsAcceptedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('User', 'twoFactorEnabled', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('User', 'twoFactorSecret', 'TEXT', 'TEXT')
    await addColumnIfMissing('User', 'twoFactorBackupCodes', 'TEXT DEFAULT \'[]\'', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('User', 'twoFactorVerifiedAt', 'DATETIME', 'TIMESTAMP')

    // ─── Shop table ──────────────────────────────────────────────────────
    await addColumnIfMissing('Shop', 'verificationStatus', 'TEXT DEFAULT \'none\'', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustLevel', 'TEXT DEFAULT \'none\'', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustScore', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'badges', 'TEXT DEFAULT \'[]\'', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Shop', 'verifiedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Shop', 'totalSales', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'totalReviews', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'averageRating', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Shop', 'customSections', 'TEXT DEFAULT \'[]\'', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Shop', 'primaryColor', 'TEXT DEFAULT \'#6366f1\'', 'TEXT DEFAULT \'#6366f1\'')
    await addColumnIfMissing('Shop', 'secondaryColor', 'TEXT DEFAULT \'#8b5cf6\'', 'TEXT DEFAULT \'#8b5cf6\'')
    await addColumnIfMissing('Shop', 'accentColor', 'TEXT DEFAULT \'#a78bfa\'', 'TEXT DEFAULT \'#a78bfa\'')
    await addColumnIfMissing('Shop', 'layoutStyle', 'TEXT DEFAULT \'grid\'', 'TEXT DEFAULT \'grid\'')
    await addColumnIfMissing('Shop', 'displayStyle', 'TEXT DEFAULT \'modern\'', 'TEXT DEFAULT \'modern\'')

    // ─── Product table ────────────────────────────────────────────────────
    await addColumnIfMissing('Product', 'deliveryInfo', 'TEXT', 'TEXT')
    await addColumnIfMissing('Product', 'deliveryCountries', 'TEXT DEFAULT \'[]\'', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Product', 'requirements', 'TEXT', 'TEXT')
    await addColumnIfMissing('Product', 'comparePrice', 'REAL', 'DOUBLE PRECISION')
    await addColumnIfMissing('Product', 'fileUrl', 'TEXT', 'TEXT')
    await addColumnIfMissing('Product', 'fileSize', 'TEXT', 'TEXT')
    await addColumnIfMissing('Product', 'sku', 'TEXT', 'TEXT')
    await addColumnIfMissing('Product', 'isFeatured', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('Product', 'totalSales', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'totalReviews', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'averageRating', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Product', 'hasVariants', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('Product', 'shortDesc', 'TEXT', 'TEXT')

    // ─── Order table ─────────────────────────────────────────────────────
    await addColumnIfMissing('Order', 'shippingMethod', 'TEXT', 'TEXT')
    await addColumnIfMissing('Order', 'carrier', 'TEXT', 'TEXT')
    await addColumnIfMissing('Order', 'estimatedDelivery', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Order', 'deliveredAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Order', 'platformFee', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Order', 'shippingCost', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Order', 'taxRate', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Order', 'taxAmount', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')
    await addColumnIfMissing('Order', 'shippingPhone', 'TEXT', 'TEXT')

    // ─── OrderItem ───────────────────────────────────────────────────────
    await addColumnIfMissing('OrderItem', 'variantId', 'TEXT', 'TEXT')
    await addColumnIfMissing('OrderItem', 'variantLabel', 'TEXT', 'TEXT')
    await addColumnIfMissing('OrderItem', 'variantSku', 'TEXT', 'TEXT')

    // ─── Review ──────────────────────────────────────────────────────────
    await addColumnIfMissing('Review', 'gigId', 'TEXT', 'TEXT')
    await addColumnIfMissing('Review', 'images', 'TEXT DEFAULT \'[]\'', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Review', 'helpfulCount', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Review', 'sellerReply', 'TEXT', 'TEXT')
    await addColumnIfMissing('Review', 'sellerReplyAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Review', 'isVerified', 'BOOLEAN DEFAULT 0', 'BOOLEAN DEFAULT false')
    await addColumnIfMissing('Review', 'title', 'TEXT', 'TEXT')

    // ─── Notification ────────────────────────────────────────────────────
    await addColumnIfMissing('Notification', 'category', 'TEXT DEFAULT \'system\'', 'TEXT DEFAULT \'system\'')
    await addColumnIfMissing('Notification', 'image', 'TEXT', 'TEXT')
    await addColumnIfMissing('Notification', 'priority', 'TEXT DEFAULT \'normal\'', 'TEXT DEFAULT \'normal\'')
    await addColumnIfMissing('Notification', 'metadata', 'TEXT DEFAULT \'{}\'', 'TEXT DEFAULT \'{}\'')

    // ─── Dispute ─────────────────────────────────────────────────────────
    await addColumnIfMissing('Dispute', 'category', 'TEXT DEFAULT \'product_issue\'', 'TEXT DEFAULT \'product_issue\'')
    await addColumnIfMissing('Dispute', 'priority', 'TEXT DEFAULT \'normal\'', 'TEXT DEFAULT \'normal\'')
    await addColumnIfMissing('Dispute', 'resolutionType', 'TEXT', 'TEXT')
    await addColumnIfMissing('Dispute', 'refundAmount', 'REAL', 'DOUBLE PRECISION')
    await addColumnIfMissing('Dispute', 'assignedAdminId', 'TEXT', 'TEXT')
    await addColumnIfMissing('Dispute', 'sellerResponse', 'TEXT', 'TEXT')
    await addColumnIfMissing('Dispute', 'escalatedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Dispute', 'resolvedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Dispute', 'closedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Dispute', 'shopId', 'TEXT', 'TEXT')

    // ─── Payment ─────────────────────────────────────────────────────────
    await addColumnIfMissing('Payment', 'escrowStatus', 'TEXT DEFAULT \'held\'', 'TEXT DEFAULT \'held\'')
    await addColumnIfMissing('Payment', 'releasedAt', 'DATETIME', 'TIMESTAMP')
    await addColumnIfMissing('Payment', 'failureReason', 'TEXT', 'TEXT')
    await addColumnIfMissing('Payment', 'metadata', 'TEXT DEFAULT \'{}\'', 'TEXT DEFAULT \'{}\'')
    await addColumnIfMissing('Payment', 'paymentProvider', 'TEXT', 'TEXT')
    await addColumnIfMissing('Payment', 'sellerPayout', 'REAL DEFAULT 0', 'DOUBLE PRECISION DEFAULT 0')

    // ═══════════════════════════════════════════════════════════════════════
    // MISSING TABLES
    // createTableIfMissing(table, sqliteSql, pgSql)
    // ═══════════════════════════════════════════════════════════════════════

    // ProductVariantOption
    await createTableIfMissing('ProductVariantOption',
      `CREATE TABLE IF NOT EXISTS "ProductVariantOption" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductVariantOption" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductVariantOptionValue
    await createTableIfMissing('ProductVariantOptionValue',
      `CREATE TABLE IF NOT EXISTS "ProductVariantOptionValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "optionId" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductVariantOptionValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "optionId" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductVariant
    await createTableIfMissing('ProductVariant',
      `CREATE TABLE IF NOT EXISTS "ProductVariant" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "sku" TEXT,
        "price" REAL NOT NULL DEFAULT 0,
        "priceAdjustment" REAL NOT NULL DEFAULT 0,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "images" TEXT NOT NULL DEFAULT '[]',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductVariant" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "sku" TEXT,
        "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "images" TEXT NOT NULL DEFAULT '[]',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductVariantValue
    await createTableIfMissing('ProductVariantValue',
      `CREATE TABLE IF NOT EXISTS "ProductVariantValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "variantId" TEXT NOT NULL,
        "optionId" TEXT NOT NULL,
        "valueId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductVariantValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "variantId" TEXT NOT NULL,
        "optionId" TEXT NOT NULL,
        "valueId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ReviewHelpfulVote
    await createTableIfMissing('ReviewHelpfulVote',
      `CREATE TABLE IF NOT EXISTS "ReviewHelpfulVote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reviewId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ReviewHelpfulVote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reviewId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // NotificationPreference
    await createTableIfMissing('NotificationPreference',
      `CREATE TABLE IF NOT EXISTS "NotificationPreference" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "orderUpdates" BOOLEAN NOT NULL DEFAULT 1,
        "paymentAlerts" BOOLEAN NOT NULL DEFAULT 1,
        "newMessages" BOOLEAN NOT NULL DEFAULT 1,
        "reviewNotifications" BOOLEAN NOT NULL DEFAULT 1,
        "shopUpdates" BOOLEAN NOT NULL DEFAULT 1,
        "promotions" BOOLEAN NOT NULL DEFAULT 1,
        "systemAlerts" BOOLEAN NOT NULL DEFAULT 1,
        "soundEnabled" BOOLEAN NOT NULL DEFAULT 1,
        "desktopNotifications" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "NotificationPreference" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
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
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // SellerVerification
    await createTableIfMissing('SellerVerification',
      `CREATE TABLE IF NOT EXISTS "SellerVerification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "documentType" TEXT NOT NULL,
        "documentUrl" TEXT NOT NULL,
        "documentNumber" TEXT,
        "country" TEXT,
        "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "reviewedAt" DATETIME,
        "reviewedBy" TEXT,
        "rejectionReason" TEXT,
        "businessName" TEXT,
        "businessAddress" TEXT,
        "notes" TEXT,
        "expiresAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "SellerVerification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "documentType" TEXT NOT NULL,
        "documentUrl" TEXT NOT NULL,
        "documentNumber" TEXT,
        "country" TEXT,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "reviewedAt" TIMESTAMP,
        "reviewedBy" TEXT,
        "rejectionReason" TEXT,
        "businessName" TEXT,
        "businessAddress" TEXT,
        "notes" TEXT,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // TrustBadge
    await createTableIfMissing('TrustBadge',
      `CREATE TABLE IF NOT EXISTS "TrustBadge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#10b981',
        "criteria" TEXT NOT NULL DEFAULT '{}',
        "tier" TEXT NOT NULL DEFAULT 'standard',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "TrustBadge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#10b981',
        "criteria" TEXT NOT NULL DEFAULT '{}',
        "tier" TEXT NOT NULL DEFAULT 'standard',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // SellerBadge
    await createTableIfMissing('SellerBadge',
      `CREATE TABLE IF NOT EXISTS "SellerBadge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "badgeSlug" TEXT NOT NULL,
        "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" DATETIME
      )`,
      `CREATE TABLE IF NOT EXISTS "SellerBadge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "badgeSlug" TEXT NOT NULL,
        "awardedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "expiresAt" TIMESTAMP
      )`
    )

    // SellerTier
    await createTableIfMissing('SellerTier',
      `CREATE TABLE IF NOT EXISTS "SellerTier" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL UNIQUE,
        "tier" TEXT NOT NULL DEFAULT 'bronze',
        "totalSales" INTEGER NOT NULL DEFAULT 0,
        "averageRating" REAL NOT NULL DEFAULT 0,
        "totalReviews" INTEGER NOT NULL DEFAULT 0,
        "isVerified" BOOLEAN NOT NULL DEFAULT 0,
        "avgShipDays" REAL,
        "trustScore" INTEGER NOT NULL DEFAULT 0,
        "nextTier" TEXT,
        "progressPercent" INTEGER NOT NULL DEFAULT 0,
        "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "SellerTier" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL UNIQUE,
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
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // DisputeMessage
    await createTableIfMissing('DisputeMessage',
      `CREATE TABLE IF NOT EXISTS "DisputeMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isInternal" BOOLEAN NOT NULL DEFAULT 0,
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "DisputeMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isInternal" BOOLEAN NOT NULL DEFAULT false,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // DisputeEvidence
    await createTableIfMissing('DisputeEvidence',
      `CREATE TABLE IF NOT EXISTS "DisputeEvidence" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "uploadedBy" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "DisputeEvidence" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "uploadedBy" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // DisputeTimeline
    await createTableIfMissing('DisputeTimeline',
      `CREATE TABLE IF NOT EXISTS "DisputeTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "DisputeTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Coupon
    await createTableIfMissing('Coupon',
      `CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "value" REAL NOT NULL,
        "minOrderAmount" REAL NOT NULL DEFAULT 0,
        "maxDiscount" REAL,
        "usageLimit" INTEGER,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "perUserLimit" INTEGER NOT NULL DEFAULT 1,
        "startDate" DATETIME,
        "endDate" DATETIME,
        "appliesToType" TEXT NOT NULL DEFAULT 'all',
        "productId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "maxDiscount" DOUBLE PRECISION,
        "usageLimit" INTEGER,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "perUserLimit" INTEGER NOT NULL DEFAULT 1,
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "appliesToType" TEXT NOT NULL DEFAULT 'all',
        "productId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // CouponUsage
    await createTableIfMissing('CouponUsage',
      `CREATE TABLE IF NOT EXISTS "CouponUsage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "couponId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "discountAmount" REAL NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "CouponUsage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "couponId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "discountAmount" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // FlashSale
    await createTableIfMissing('FlashSale',
      `CREATE TABLE IF NOT EXISTS "FlashSale" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "originalPrice" REAL NOT NULL,
        "salePrice" REAL NOT NULL,
        "discountPercent" INTEGER NOT NULL DEFAULT 0,
        "type" TEXT NOT NULL DEFAULT 'flash_sale',
        "startDate" DATETIME NOT NULL,
        "endDate" DATETIME NOT NULL,
        "maxQuantity" INTEGER NOT NULL DEFAULT -1,
        "soldQuantity" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "banner" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "FlashSale" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "originalPrice" DOUBLE PRECISION NOT NULL,
        "salePrice" DOUBLE PRECISION NOT NULL,
        "discountPercent" INTEGER NOT NULL DEFAULT 0,
        "type" TEXT NOT NULL DEFAULT 'flash_sale',
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "maxQuantity" INTEGER NOT NULL DEFAULT -1,
        "soldQuantity" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "banner" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductQuestion
    await createTableIfMissing('ProductQuestion',
      `CREATE TABLE IF NOT EXISTS "ProductQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductAnswer
    await createTableIfMissing('ProductAnswer',
      `CREATE TABLE IF NOT EXISTS "ProductAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT 0,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT false,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // GigQuestion
    await createTableIfMissing('GigQuestion',
      `CREATE TABLE IF NOT EXISTS "GigQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "gigId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "GigQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "gigId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // GigAnswer
    await createTableIfMissing('GigAnswer',
      `CREATE TABLE IF NOT EXISTS "GigAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT 0,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "GigAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT false,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Wishlist
    await createTableIfMissing('Wishlist',
      `CREATE TABLE IF NOT EXISTS "Wishlist" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "isPublic" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Wishlist" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // WishlistItem
    await createTableIfMissing('WishlistItem',
      `CREATE TABLE IF NOT EXISTS "WishlistItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "wishlistId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "WishlistItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "wishlistId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "addedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // DigitalDownload
    await createTableIfMissing('DigitalDownload',
      `CREATE TABLE IF NOT EXISTS "DigitalDownload" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "orderId" TEXT,
        "downloadToken" TEXT NOT NULL UNIQUE,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "fileSize" INTEGER,
        "maxDownloads" INTEGER NOT NULL DEFAULT 5,
        "downloadCount" INTEGER NOT NULL DEFAULT 0,
        "expiresAt" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastDownloadedAt" DATETIME
      )`,
      `CREATE TABLE IF NOT EXISTS "DigitalDownload" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "orderId" TEXT,
        "downloadToken" TEXT NOT NULL UNIQUE,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "fileSize" INTEGER,
        "maxDownloads" INTEGER NOT NULL DEFAULT 5,
        "downloadCount" INTEGER NOT NULL DEFAULT 0,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastDownloadedAt" TIMESTAMP
      )`
    )

    // Session
    await createTableIfMissing('Session',
      `CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL UNIQUE,
        "deviceInfo" TEXT,
        "ipAddress" TEXT,
        "expiresAt" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL UNIQUE,
        "deviceInfo" TEXT,
        "ipAddress" TEXT,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastActiveAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ProductReport
    await createTableIfMissing('ProductReport',
      `CREATE TABLE IF NOT EXISTS "ProductReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "reporterId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "adminNote" TEXT,
        "reviewedBy" TEXT,
        "reviewedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ProductReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "reporterId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "adminNote" TEXT,
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // AuditLog
    await createTableIfMissing('AuditLog',
      `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entityType" TEXT,
        "entityId" TEXT,
        "details" TEXT NOT NULL DEFAULT '{}',
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entityType" TEXT,
        "entityId" TEXT,
        "details" TEXT NOT NULL DEFAULT '{}',
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // CryptoWallet
    await createTableIfMissing('CryptoWallet',
      `CREATE TABLE IF NOT EXISTS "CryptoWallet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "currency" TEXT NOT NULL UNIQUE,
        "address" TEXT NOT NULL,
        "label" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "depositCount" INTEGER NOT NULL DEFAULT 0,
        "maxDeposits" INTEGER,
        "notes" TEXT,
        "previousAddresses" TEXT NOT NULL DEFAULT '[]',
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedBy" TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS "CryptoWallet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "currency" TEXT NOT NULL UNIQUE,
        "address" TEXT NOT NULL,
        "label" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "depositCount" INTEGER NOT NULL DEFAULT 0,
        "maxDeposits" INTEGER,
        "notes" TEXT,
        "previousAddresses" TEXT NOT NULL DEFAULT '[]',
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedBy" TEXT
      )`
    )

    // Cart
    await createTableIfMissing('Cart',
      `CREATE TABLE IF NOT EXISTS "Cart" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "items" TEXT NOT NULL DEFAULT '[]',
        "abandonedAt" DATETIME,
        "lastReminderSentAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Cart" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "items" TEXT NOT NULL DEFAULT '[]',
        "abandonedAt" TIMESTAMP,
        "lastReminderSentAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // PlatformSettings
    await createTableIfMissing('PlatformSettings',
      `CREATE TABLE IF NOT EXISTS "PlatformSettings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        "platformName" TEXT NOT NULL DEFAULT 'TRIZA',
        "tagline" TEXT,
        "description" TEXT,
        "logoUrl" TEXT,
        "primaryColor" TEXT,
        "accentColor" TEXT,
        "maintenanceMode" BOOLEAN NOT NULL DEFAULT 0,
        "allowRegistration" BOOLEAN NOT NULL DEFAULT 1,
        "allowSellerRegistration" BOOLEAN NOT NULL DEFAULT 1,
        "commissionRate" REAL NOT NULL DEFAULT 10.0,
        "minWithdrawalAmount" REAL NOT NULL DEFAULT 50.0,
        "supportEmail" TEXT,
        "supportPhone" TEXT,
        "socialLinks" TEXT,
        "taxEnabled" BOOLEAN NOT NULL DEFAULT 0,
        "taxRate" REAL NOT NULL DEFAULT 0,
        "taxInclusive" BOOLEAN NOT NULL DEFAULT 0,
        "taxLabel" TEXT NOT NULL DEFAULT 'Tax',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "PlatformSettings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        "platformName" TEXT NOT NULL DEFAULT 'TRIZA',
        "tagline" TEXT,
        "description" TEXT,
        "logoUrl" TEXT,
        "primaryColor" TEXT,
        "accentColor" TEXT,
        "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
        "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
        "allowSellerRegistration" BOOLEAN NOT NULL DEFAULT true,
        "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
        "minWithdrawalAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
        "supportEmail" TEXT,
        "supportPhone" TEXT,
        "socialLinks" TEXT,
        "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
        "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "taxInclusive" BOOLEAN NOT NULL DEFAULT false,
        "taxLabel" TEXT NOT NULL DEFAULT 'Tax',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // FeedbackThread
    await createTableIfMissing('FeedbackThread',
      `CREATE TABLE IF NOT EXISTS "FeedbackThread" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "sessionId" TEXT NOT NULL UNIQUE,
        "status" TEXT NOT NULL DEFAULT 'open',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "FeedbackThread" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "sessionId" TEXT NOT NULL UNIQUE,
        "status" TEXT NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // FeedbackMessage
    await createTableIfMissing('FeedbackMessage',
      `CREATE TABLE IF NOT EXISTS "FeedbackMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threadId" TEXT NOT NULL,
        "senderType" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "messageType" TEXT NOT NULL DEFAULT 'text',
        "category" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "FeedbackMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threadId" TEXT NOT NULL,
        "senderType" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "messageType" TEXT NOT NULL DEFAULT 'text',
        "category" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ReturnPolicy
    await createTableIfMissing('ReturnPolicy',
      `CREATE TABLE IF NOT EXISTS "ReturnPolicy" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL UNIQUE,
        "acceptsReturns" BOOLEAN NOT NULL DEFAULT 1,
        "returnPeriodDays" INTEGER NOT NULL DEFAULT 7,
        "acceptsExchanges" BOOLEAN NOT NULL DEFAULT 1,
        "refundMethods" TEXT NOT NULL DEFAULT '["original"]',
        "returnShippingPaidBy" TEXT NOT NULL DEFAULT 'buyer',
        "restockingFee" REAL NOT NULL DEFAULT 0,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ReturnPolicy" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL UNIQUE,
        "acceptsReturns" BOOLEAN NOT NULL DEFAULT true,
        "returnPeriodDays" INTEGER NOT NULL DEFAULT 7,
        "acceptsExchanges" BOOLEAN NOT NULL DEFAULT true,
        "refundMethods" TEXT NOT NULL DEFAULT '["original"]',
        "returnShippingPaidBy" TEXT NOT NULL DEFAULT 'buyer',
        "restockingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ReturnTimeline
    await createTableIfMissing('ReturnTimeline',
      `CREATE TABLE IF NOT EXISTS "ReturnTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "returnId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ReturnTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "returnId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ShippingZone
    await createTableIfMissing('ShippingZone',
      `CREATE TABLE IF NOT EXISTS "ShippingZone" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "countries" TEXT NOT NULL DEFAULT '[]',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ShippingZone" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "countries" TEXT NOT NULL DEFAULT '[]',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ShippingRate
    await createTableIfMissing('ShippingRate',
      `CREATE TABLE IF NOT EXISTS "ShippingRate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "zoneId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "method" TEXT NOT NULL DEFAULT 'standard',
        "minDays" INTEGER NOT NULL DEFAULT 3,
        "maxDays" INTEGER NOT NULL DEFAULT 7,
        "price" REAL NOT NULL DEFAULT 0,
        "freeAbove" REAL,
        "weightLimit" REAL,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ShippingRate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "zoneId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "method" TEXT NOT NULL DEFAULT 'standard',
        "minDays" INTEGER NOT NULL DEFAULT 3,
        "maxDays" INTEGER NOT NULL DEFAULT 7,
        "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "freeAbove" DOUBLE PRECISION,
        "weightLimit" DOUBLE PRECISION,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Shipment
    await createTableIfMissing('Shipment',
      `CREATE TABLE IF NOT EXISTS "Shipment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL UNIQUE,
        "carrier" TEXT,
        "trackingNumber" TEXT,
        "trackingUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "shippedAt" DATETIME,
        "estimatedDelivery" DATETIME,
        "deliveredAt" DATETIME,
        "weight" REAL,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Shipment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL UNIQUE,
        "carrier" TEXT,
        "trackingNumber" TEXT,
        "trackingUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "shippedAt" TIMESTAMP,
        "estimatedDelivery" TIMESTAMP,
        "deliveredAt" TIMESTAMP,
        "weight" DOUBLE PRECISION,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ShopFollow
    await createTableIfMissing('ShopFollow',
      `CREATE TABLE IF NOT EXISTS "ShopFollow" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ShopFollow" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Activity
    await createTableIfMissing('Activity',
      `CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT,
        "productId" TEXT,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "metadata" TEXT NOT NULL DEFAULT '{}',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT,
        "productId" TEXT,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "metadata" TEXT NOT NULL DEFAULT '{}',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ShopStory
    await createTableIfMissing('ShopStory',
      `CREATE TABLE IF NOT EXISTS "ShopStory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'image',
        "content" TEXT,
        "imageUrl" TEXT,
        "productId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "expiresAt" DATETIME NOT NULL,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ShopStory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'image',
        "content" TEXT,
        "imageUrl" TEXT,
        "productId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP NOT NULL,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // StoryView
    await createTableIfMissing('StoryView',
      `CREATE TABLE IF NOT EXISTS "StoryView" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storyId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "StoryView" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storyId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // SharedProduct
    await createTableIfMissing('SharedProduct',
      `CREATE TABLE IF NOT EXISTS "SharedProduct" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "platform" TEXT NOT NULL DEFAULT 'link',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "SharedProduct" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "platform" TEXT NOT NULL DEFAULT 'link',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // PaymentInfo
    await createTableIfMissing('PaymentInfo',
      `CREATE TABLE IF NOT EXISTS "PaymentInfo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "method" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "accountDetails" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "PaymentInfo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "method" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "accountDetails" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // DeliveryAddress
    await createTableIfMissing('DeliveryAddress',
      `CREATE TABLE IF NOT EXISTS "DeliveryAddress" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT,
        "zipCode" TEXT,
        "country" TEXT NOT NULL DEFAULT 'PK',
        "isDefault" BOOLEAN NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "DeliveryAddress" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT,
        "zipCode" TEXT,
        "country" TEXT NOT NULL DEFAULT 'PK',
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Gig
    await createTableIfMissing('Gig',
      `CREATE TABLE IF NOT EXISTS "Gig" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "categoryId" TEXT,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "images" TEXT NOT NULL DEFAULT '[]',
        "tags" TEXT NOT NULL DEFAULT '[]',
        "packages" TEXT NOT NULL DEFAULT '[]',
        "faqs" TEXT NOT NULL DEFAULT '[]',
        "requirements" TEXT,
        "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
        "isApproved" BOOLEAN NOT NULL DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalReviews" INTEGER NOT NULL DEFAULT 0,
        "averageRating" REAL NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Gig" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "categoryId" TEXT,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "images" TEXT NOT NULL DEFAULT '[]',
        "tags" TEXT NOT NULL DEFAULT '[]',
        "packages" TEXT NOT NULL DEFAULT '[]',
        "faqs" TEXT NOT NULL DEFAULT '[]',
        "requirements" TEXT,
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "isApproved" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalReviews" INTEGER NOT NULL DEFAULT 0,
        "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // PlatformStats
    await createTableIfMissing('PlatformStats',
      `CREATE TABLE IF NOT EXISTS "PlatformStats" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "totalUsers" INTEGER NOT NULL DEFAULT 0,
        "totalSellers" INTEGER NOT NULL DEFAULT 0,
        "totalProducts" INTEGER NOT NULL DEFAULT 0,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalRevenue" REAL NOT NULL DEFAULT 0,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "PlatformStats" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "totalUsers" INTEGER NOT NULL DEFAULT 0,
        "totalSellers" INTEGER NOT NULL DEFAULT 0,
        "totalProducts" INTEGER NOT NULL DEFAULT 0,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Wallet
    await createTableIfMissing('Wallet',
      `CREATE TABLE IF NOT EXISTS "Wallet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "balance" REAL NOT NULL DEFAULT 0,
        "pendingBalance" REAL NOT NULL DEFAULT 0,
        "totalEarnings" REAL NOT NULL DEFAULT 0,
        "totalWithdrawn" REAL NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Wallet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalWithdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Transaction
    await createTableIfMissing('Transaction',
      `CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "walletId" TEXT NOT NULL,
        "paymentId" TEXT,
        "type" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "balance" REAL NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "referenceType" TEXT,
        "referenceId" TEXT,
        "metadata" TEXT NOT NULL DEFAULT '{}',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "walletId" TEXT NOT NULL,
        "paymentId" TEXT,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "balance" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "referenceType" TEXT,
        "referenceId" TEXT,
        "metadata" TEXT NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // Withdrawal
    await createTableIfMissing('Withdrawal',
      `CREATE TABLE IF NOT EXISTS "Withdrawal" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "walletId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "fee" REAL NOT NULL DEFAULT 0,
        "netAmount" REAL NOT NULL,
        "method" TEXT NOT NULL,
        "accountDetails" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "adminNote" TEXT,
        "processedAt" DATETIME,
        "rejectedAt" DATETIME,
        "completedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Withdrawal" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "walletId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "netAmount" DOUBLE PRECISION NOT NULL,
        "method" TEXT NOT NULL,
        "accountDetails" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "adminNote" TEXT,
        "processedAt" TIMESTAMP,
        "rejectedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )`
    )

    // ═══════════════════════════════════════════════════════════════════════
    // INDEXES
    // ═══════════════════════════════════════════════════════════════════════

    const indexes = [
      { name: 'ProductVariantOption_productId', sqlite: 'CREATE INDEX IF NOT EXISTS "ProductVariantOption_productId_index" ON "ProductVariantOption"("productId")', pg: 'CREATE INDEX IF NOT EXISTS "ProductVariantOption_productId_index" ON "ProductVariantOption"("productId")' },
      { name: 'ProductVariantOptionValue_optionId', sqlite: 'CREATE INDEX IF NOT EXISTS "ProductVariantOptionValue_optionId_index" ON "ProductVariantOptionValue"("optionId")', pg: 'CREATE INDEX IF NOT EXISTS "ProductVariantOptionValue_optionId_index" ON "ProductVariantOptionValue"("optionId")' },
      { name: 'ProductVariant_productId', sqlite: 'CREATE INDEX IF NOT EXISTS "ProductVariant_productId_index" ON "ProductVariant"("productId")', pg: 'CREATE INDEX IF NOT EXISTS "ProductVariant_productId_index" ON "ProductVariant"("productId")' },
      { name: 'ProductVariant_sku', sqlite: 'CREATE INDEX IF NOT EXISTS "ProductVariant_sku_index" ON "ProductVariant"("sku")', pg: 'CREATE INDEX IF NOT EXISTS "ProductVariant_sku_index" ON "ProductVariant"("sku")' },
      { name: 'ProductVariantValue_variantId', sqlite: 'CREATE INDEX IF NOT EXISTS "ProductVariantValue_variantId_index" ON "ProductVariantValue"("variantId")', pg: 'CREATE INDEX IF NOT EXISTS "ProductVariantValue_variantId_index" ON "ProductVariantValue"("variantId")' },
      { name: 'ReviewHelpfulVote_reviewId', sqlite: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_reviewId_index" ON "ReviewHelpfulVote"("reviewId")', pg: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_reviewId_index" ON "ReviewHelpfulVote"("reviewId")' },
      { name: 'ReviewHelpfulVote_userId', sqlite: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_userId_index" ON "ReviewHelpfulVote"("userId")', pg: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_userId_index" ON "ReviewHelpfulVote"("userId")' },
      { name: 'DisputeMessage_disputeId', sqlite: 'CREATE INDEX IF NOT EXISTS "DisputeMessage_disputeId_index" ON "DisputeMessage"("disputeId")', pg: 'CREATE INDEX IF NOT EXISTS "DisputeMessage_disputeId_index" ON "DisputeMessage"("disputeId")' },
      { name: 'DisputeEvidence_disputeId', sqlite: 'CREATE INDEX IF NOT EXISTS "DisputeEvidence_disputeId_index" ON "DisputeEvidence"("disputeId")', pg: 'CREATE INDEX IF NOT EXISTS "DisputeEvidence_disputeId_index" ON "DisputeEvidence"("disputeId")' },
      { name: 'DisputeTimeline_disputeId', sqlite: 'CREATE INDEX IF NOT EXISTS "DisputeTimeline_disputeId_index" ON "DisputeTimeline"("disputeId")', pg: 'CREATE INDEX IF NOT EXISTS "DisputeTimeline_disputeId_index" ON "DisputeTimeline"("disputeId")' },
      { name: 'CouponUsage_couponId', sqlite: 'CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_index" ON "CouponUsage"("couponId")', pg: 'CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_index" ON "CouponUsage"("couponId")' },
      { name: 'CouponUsage_userId', sqlite: 'CREATE INDEX IF NOT EXISTS "CouponUsage_userId_index" ON "CouponUsage"("userId")', pg: 'CREATE INDEX IF NOT EXISTS "CouponUsage_userId_index" ON "CouponUsage"("userId")' },
      { name: 'CryptoWallet_currency', sqlite: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_currency_index" ON "CryptoWallet"("currency")', pg: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_currency_index" ON "CryptoWallet"("currency")' },
      { name: 'CryptoWallet_isActive', sqlite: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_isActive_index" ON "CryptoWallet"("isActive")', pg: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_isActive_index" ON "CryptoWallet"("isActive")' },
      { name: 'Cart_userId', sqlite: 'CREATE INDEX IF NOT EXISTS "Cart_userId_index" ON "Cart"("userId")', pg: 'CREATE INDEX IF NOT EXISTS "Cart_userId_index" ON "Cart"("userId")' },
      { name: 'Cart_updatedAt', sqlite: 'CREATE INDEX IF NOT EXISTS "Cart_updatedAt_index" ON "Cart"("updatedAt")', pg: 'CREATE INDEX IF NOT EXISTS "Cart_updatedAt_index" ON "Cart"("updatedAt")' },
      { name: 'Session_userId', sqlite: 'CREATE INDEX IF NOT EXISTS "Session_userId_index" ON "Session"("userId")', pg: 'CREATE INDEX IF NOT EXISTS "Session_userId_index" ON "Session"("userId")' },
      { name: 'Session_tokenHash', sqlite: 'CREATE INDEX IF NOT EXISTS "Session_tokenHash_index" ON "Session"("tokenHash")', pg: 'CREATE INDEX IF NOT EXISTS "Session_tokenHash_index" ON "Session"("tokenHash")' },
      { name: 'AuditLog_userId', sqlite: 'CREATE INDEX IF NOT EXISTS "AuditLog_userId_index" ON "AuditLog"("userId")', pg: 'CREATE INDEX IF NOT EXISTS "AuditLog_userId_index" ON "AuditLog"("userId")' },
      { name: 'AuditLog_action', sqlite: 'CREATE INDEX IF NOT EXISTS "AuditLog_action_index" ON "AuditLog"("action")', pg: 'CREATE INDEX IF NOT EXISTS "AuditLog_action_index" ON "AuditLog"("action")' },
      { name: 'AuditLog_createdAt', sqlite: 'CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_index" ON "AuditLog"("createdAt")', pg: 'CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_index" ON "AuditLog"("createdAt")' },
    ]

    for (const idx of indexes) {
      await createIndexIfMissing(idx.name, idx.sqlite, idx.pg)
    }

    // ─── Capture tables after sync ───────────────────────────────────────
    const tablesAfter = await getTableList()
    // Use createdTables set for accurate "new tables" tracking
    // (avoids mismatch between tablesBefore/tablesAfter and the applied count)
    const newTables = Array.from(createdTables)

    // ─── Summary ─────────────────────────────────────────────────────────
    const successCount = results.filter((r) => r.status === 'ok').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length
    const errorCount = results.filter((r) => r.status === 'error').length
    const errorResults = results.filter((r) => r.status === 'error')

    if (errorResults.length > 0) {
      console.error('[sync-schema] Errors:', errorResults.map(r => `${r.name}: ${r.error}`).join('; '))
    }

    console.log(`[sync-schema] Complete (${dbType}): ${successCount} applied, ${skippedCount} skipped, ${errorCount} errors`)

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: results.length,
        applied: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results,
      databaseType: dbType,
      tablesBefore,
      tablesAfter,
      newTables,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[sync-schema] Fatal error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: `Schema sync failed: ${message}`,
        results: [
          {
            name: 'Schema sync',
            status: 'error',
            error: message,
          },
        ],
        summary: {
          total: 1,
          applied: 0,
          skipped: 0,
          errors: 1,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Require JWT admin authentication
  const auth = await authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const dbType = getDatabaseType()

  // Check current schema status
  try {
    let tables: string[] = []
    let userColumns: string[] = []

    if (dbType === 'postgresql') {
      tables = (await db.$queryRawUnsafe(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      ) as any[])?.map((t: any) => t.tablename) || []
      const cols = await db.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User'`
      ) as any[]
      userColumns = cols.map((c: any) => c.column_name)
    } else {
      tables = (await db.$queryRawUnsafe(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`
      ) as any[])?.map((t: any) => t.name) || []
      const cols = await db.$queryRawUnsafe(`PRAGMA table_info("User")`) as any[]
      userColumns = cols.map((c: any) => c.name)
    }

    return NextResponse.json({
      status: 'ready',
      message: 'POST to this endpoint to sync schema (creates missing tables/columns via raw SQL)',
      databaseType: dbType,
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      isSqlite: dbType === 'sqlite',
      isPostgres: dbType === 'postgresql',
      tables,
      userColumns,
    })
  } catch (error: unknown) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseType: dbType,
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
    })
  }
}
