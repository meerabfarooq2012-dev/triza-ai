import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

/**
 * POST /api/admin/sync-schema
 *
 * Syncs the Prisma schema with the database by running raw SQL
 * to create missing tables and add missing columns.
 *
 * This approach is more reliable than `prisma db push` via child process
 * because it doesn't depend on spawning external processes.
 *
 * Protected by admin JWT authentication.
 */

interface SyncResult {
  name: string
  status: 'ok' | 'skipped' | 'error'
  error?: string
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

    console.log('[sync-schema] Starting schema sync via raw SQL...')

    const results: SyncResult[] = []

    // Helper: safely add a column (ignore if exists)
    const addColumnIfMissing = async (table: string, column: string, type: string) => {
      try {
        // Check if column already exists
        const cols = await db.$queryRawUnsafe(`PRAGMA table_info("${table}")`) as any[]
        const exists = cols.some((c: any) => c.name === column)
        if (exists) {
          results.push({ name: `${table}.${column}`, status: 'skipped' })
          return
        }
        await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type};`)
        results.push({ name: `${table}.${column}`, status: 'ok' })
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (err.message?.includes('already exists')) {
          results.push({ name: `${table}.${column}`, status: 'skipped' })
        } else {
          results.push({ name: `${table}.${column}`, status: 'error', error: err.message?.slice(0, 200) || 'unknown error' })
        }
      }
    }

    // Helper: safely create a table
    const createTableIfMissing = async (table: string, sql: string) => {
      try {
        // Check if table already exists
        const existing = await db.$queryRawUnsafe(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`
        ) as any[]
        if (existing.length > 0) {
          results.push({ name: `Table: ${table}`, status: 'skipped' })
          return
        }
        await db.$executeRawUnsafe(sql)
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
    const createIndexIfMissing = async (name: string, sql: string) => {
      try {
        // Extract index name from SQL for existence check
        const indexNameMatch = sql.match(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+"?([^"\s(]+)"?/i)
        if (indexNameMatch) {
          const indexName = indexNameMatch[1]
          const existing = await db.$queryRawUnsafe(
            `SELECT name FROM sqlite_master WHERE type='index' AND name='${indexName}'`
          ) as any[]
          if (existing.length > 0) {
            results.push({ name: `Index: ${name}`, status: 'skipped' })
            return
          }
        }
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

    // ─── User table missing columns ──────────────────────────────────────
    await addColumnIfMissing('User', 'trustLevel', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('User', 'verifiedAt', 'DATETIME')
    await addColumnIfMissing('User', 'isVerified', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('User', 'isAdmin', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('User', 'isActive', 'BOOLEAN DEFAULT 1')
    await addColumnIfMissing('User', 'bio', 'TEXT')
    await addColumnIfMissing('User', 'phone', 'TEXT')
    await addColumnIfMissing('User', 'location', 'TEXT')
    await addColumnIfMissing('User', 'resetToken', 'TEXT')
    await addColumnIfMissing('User', 'resetTokenExpiry', 'DATETIME')
    await addColumnIfMissing('User', 'emailVerifyToken', 'TEXT')
    await addColumnIfMissing('User', 'emailVerified', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('User', 'loginAttempts', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('User', 'lockoutUntil', 'DATETIME')
    await addColumnIfMissing('User', 'lastLoginAt', 'DATETIME')
    await addColumnIfMissing('User', 'deletedAt', 'DATETIME')
    await addColumnIfMissing('User', 'termsAcceptedAt', 'DATETIME')
    await addColumnIfMissing('User', 'twoFactorEnabled', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('User', 'twoFactorSecret', 'TEXT')
    await addColumnIfMissing('User', 'twoFactorBackupCodes', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('User', 'twoFactorVerifiedAt', 'DATETIME')

    // ─── Shop table missing columns ──────────────────────────────────────
    await addColumnIfMissing('Shop', 'verificationStatus', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustLevel', 'TEXT DEFAULT \'none\'')
    await addColumnIfMissing('Shop', 'trustScore', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'badges', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Shop', 'verifiedAt', 'DATETIME')
    await addColumnIfMissing('Shop', 'totalSales', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'totalReviews', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Shop', 'averageRating', 'REAL DEFAULT 0')
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
    await addColumnIfMissing('Product', 'comparePrice', 'REAL')
    await addColumnIfMissing('Product', 'fileUrl', 'TEXT')
    await addColumnIfMissing('Product', 'fileSize', 'TEXT')
    await addColumnIfMissing('Product', 'sku', 'TEXT')
    await addColumnIfMissing('Product', 'isFeatured', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('Product', 'totalSales', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'totalReviews', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Product', 'averageRating', 'REAL DEFAULT 0')
    await addColumnIfMissing('Product', 'hasVariants', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('Product', 'shortDesc', 'TEXT')

    // ─── Order table missing columns ─────────────────────────────────────
    await addColumnIfMissing('Order', 'shippingMethod', 'TEXT')
    await addColumnIfMissing('Order', 'carrier', 'TEXT')
    await addColumnIfMissing('Order', 'estimatedDelivery', 'DATETIME')
    await addColumnIfMissing('Order', 'deliveredAt', 'DATETIME')
    await addColumnIfMissing('Order', 'platformFee', 'REAL DEFAULT 0')
    await addColumnIfMissing('Order', 'shippingCost', 'REAL DEFAULT 0')
    await addColumnIfMissing('Order', 'taxRate', 'REAL DEFAULT 0')
    await addColumnIfMissing('Order', 'taxAmount', 'REAL DEFAULT 0')
    await addColumnIfMissing('Order', 'shippingPhone', 'TEXT')

    // ─── OrderItem missing columns ───────────────────────────────────────
    await addColumnIfMissing('OrderItem', 'variantId', 'TEXT')
    await addColumnIfMissing('OrderItem', 'variantLabel', 'TEXT')
    await addColumnIfMissing('OrderItem', 'variantSku', 'TEXT')

    // ─── Review missing columns ──────────────────────────────────────────
    await addColumnIfMissing('Review', 'gigId', 'TEXT')
    await addColumnIfMissing('Review', 'images', 'TEXT DEFAULT \'[]\'')
    await addColumnIfMissing('Review', 'helpfulCount', 'INTEGER DEFAULT 0')
    await addColumnIfMissing('Review', 'sellerReply', 'TEXT')
    await addColumnIfMissing('Review', 'sellerReplyAt', 'DATETIME')
    await addColumnIfMissing('Review', 'isVerified', 'BOOLEAN DEFAULT 0')
    await addColumnIfMissing('Review', 'title', 'TEXT')

    // ─── Notification missing columns ────────────────────────────────────
    await addColumnIfMissing('Notification', 'category', 'TEXT DEFAULT \'system\'')
    await addColumnIfMissing('Notification', 'image', 'TEXT')
    await addColumnIfMissing('Notification', 'priority', 'TEXT DEFAULT \'normal\'')
    await addColumnIfMissing('Notification', 'metadata', 'TEXT DEFAULT \'{}\'')

    // ─── Dispute missing columns ─────────────────────────────────────────
    await addColumnIfMissing('Dispute', 'category', 'TEXT DEFAULT \'product_issue\'')
    await addColumnIfMissing('Dispute', 'priority', 'TEXT DEFAULT \'normal\'')
    await addColumnIfMissing('Dispute', 'resolutionType', 'TEXT')
    await addColumnIfMissing('Dispute', 'refundAmount', 'REAL')
    await addColumnIfMissing('Dispute', 'assignedAdminId', 'TEXT')
    await addColumnIfMissing('Dispute', 'sellerResponse', 'TEXT')
    await addColumnIfMissing('Dispute', 'escalatedAt', 'DATETIME')
    await addColumnIfMissing('Dispute', 'resolvedAt', 'DATETIME')
    await addColumnIfMissing('Dispute', 'closedAt', 'DATETIME')
    await addColumnIfMissing('Dispute', 'shopId', 'TEXT')

    // ─── Payment missing columns ─────────────────────────────────────────
    await addColumnIfMissing('Payment', 'escrowStatus', 'TEXT DEFAULT \'held\'')
    await addColumnIfMissing('Payment', 'releasedAt', 'DATETIME')
    await addColumnIfMissing('Payment', 'failureReason', 'TEXT')
    await addColumnIfMissing('Payment', 'metadata', 'TEXT DEFAULT \'{}\'')
    await addColumnIfMissing('Payment', 'paymentProvider', 'TEXT')
    await addColumnIfMissing('Payment', 'sellerPayout', 'REAL DEFAULT 0')

    // ─── Create missing tables ───────────────────────────────────────────

    // ProductVariantOption
    await createTableIfMissing('ProductVariantOption', `
      CREATE TABLE IF NOT EXISTS "ProductVariantOption" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ProductVariantOptionValue
    await createTableIfMissing('ProductVariantOptionValue', `
      CREATE TABLE IF NOT EXISTS "ProductVariantOptionValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "optionId" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ProductVariant
    await createTableIfMissing('ProductVariant', `
      CREATE TABLE IF NOT EXISTS "ProductVariant" (
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
      )
    `)

    // ProductVariantValue
    await createTableIfMissing('ProductVariantValue', `
      CREATE TABLE IF NOT EXISTS "ProductVariantValue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "variantId" TEXT NOT NULL,
        "optionId" TEXT NOT NULL,
        "valueId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ReviewHelpfulVote
    await createTableIfMissing('ReviewHelpfulVote', `
      CREATE TABLE IF NOT EXISTS "ReviewHelpfulVote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reviewId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NotificationPreference
    await createTableIfMissing('NotificationPreference', `
      CREATE TABLE IF NOT EXISTS "NotificationPreference" (
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
      )
    `)

    // SellerVerification
    await createTableIfMissing('SellerVerification', `
      CREATE TABLE IF NOT EXISTS "SellerVerification" (
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
      )
    `)

    // TrustBadge
    await createTableIfMissing('TrustBadge', `
      CREATE TABLE IF NOT EXISTS "TrustBadge" (
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
      )
    `)

    // SellerBadge
    await createTableIfMissing('SellerBadge', `
      CREATE TABLE IF NOT EXISTS "SellerBadge" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "badgeSlug" TEXT NOT NULL,
        "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" DATETIME
      )
    `)

    // SellerTier
    await createTableIfMissing('SellerTier', `
      CREATE TABLE IF NOT EXISTS "SellerTier" (
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
      )
    `)

    // DisputeMessage
    await createTableIfMissing('DisputeMessage', `
      CREATE TABLE IF NOT EXISTS "DisputeMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "senderRole" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isInternal" BOOLEAN NOT NULL DEFAULT 0,
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // DisputeEvidence
    await createTableIfMissing('DisputeEvidence', `
      CREATE TABLE IF NOT EXISTS "DisputeEvidence" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "uploadedBy" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // DisputeTimeline
    await createTableIfMissing('DisputeTimeline', `
      CREATE TABLE IF NOT EXISTS "DisputeTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "disputeId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Coupon
    await createTableIfMissing('Coupon', `
      CREATE TABLE IF NOT EXISTS "Coupon" (
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
      )
    `)

    // CouponUsage
    await createTableIfMissing('CouponUsage', `
      CREATE TABLE IF NOT EXISTS "CouponUsage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "couponId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "discountAmount" REAL NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // FlashSale
    await createTableIfMissing('FlashSale', `
      CREATE TABLE IF NOT EXISTS "FlashSale" (
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
      )
    `)

    // ProductQuestion
    await createTableIfMissing('ProductQuestion', `
      CREATE TABLE IF NOT EXISTS "ProductQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ProductAnswer
    await createTableIfMissing('ProductAnswer', `
      CREATE TABLE IF NOT EXISTS "ProductAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT 0,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GigQuestion
    await createTableIfMissing('GigQuestion', `
      CREATE TABLE IF NOT EXISTS "GigQuestion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "gigId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "isAnswered" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GigAnswer
    await createTableIfMissing('GigAnswer', `
      CREATE TABLE IF NOT EXISTS "GigAnswer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "isSellerAnswer" BOOLEAN NOT NULL DEFAULT 0,
        "helpfulCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Wishlist
    await createTableIfMissing('Wishlist', `
      CREATE TABLE IF NOT EXISTS "Wishlist" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "isPublic" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // WishlistItem
    await createTableIfMissing('WishlistItem', `
      CREATE TABLE IF NOT EXISTS "WishlistItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "wishlistId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // DigitalDownload
    await createTableIfMissing('DigitalDownload', `
      CREATE TABLE IF NOT EXISTS "DigitalDownload" (
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
      )
    `)

    // Session
    await createTableIfMissing('Session', `
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL UNIQUE,
        "deviceInfo" TEXT,
        "ipAddress" TEXT,
        "expiresAt" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ProductReport
    await createTableIfMissing('ProductReport', `
      CREATE TABLE IF NOT EXISTS "ProductReport" (
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
      )
    `)

    // AuditLog
    await createTableIfMissing('AuditLog', `
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entityType" TEXT,
        "entityId" TEXT,
        "details" TEXT NOT NULL DEFAULT '{}',
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // CryptoWallet
    await createTableIfMissing('CryptoWallet', `
      CREATE TABLE IF NOT EXISTS "CryptoWallet" (
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
      )
    `)

    // Cart
    await createTableIfMissing('Cart', `
      CREATE TABLE IF NOT EXISTS "Cart" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "items" TEXT NOT NULL DEFAULT '[]',
        "abandonedAt" DATETIME,
        "lastReminderSentAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // PlatformSettings
    await createTableIfMissing('PlatformSettings', `
      CREATE TABLE IF NOT EXISTS "PlatformSettings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        "platformName" TEXT NOT NULL DEFAULT 'Thiora',
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
      )
    `)

    // FeedbackThread
    await createTableIfMissing('FeedbackThread', `
      CREATE TABLE IF NOT EXISTS "FeedbackThread" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "sessionId" TEXT NOT NULL UNIQUE,
        "status" TEXT NOT NULL DEFAULT 'open',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // FeedbackMessage
    await createTableIfMissing('FeedbackMessage', `
      CREATE TABLE IF NOT EXISTS "FeedbackMessage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threadId" TEXT NOT NULL,
        "senderType" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "messageType" TEXT NOT NULL DEFAULT 'text',
        "category" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ReturnPolicy
    await createTableIfMissing('ReturnPolicy', `
      CREATE TABLE IF NOT EXISTS "ReturnPolicy" (
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
      )
    `)

    // ReturnTimeline
    await createTableIfMissing('ReturnTimeline', `
      CREATE TABLE IF NOT EXISTS "ReturnTimeline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "returnId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "note" TEXT,
        "changedBy" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ShippingZone
    await createTableIfMissing('ShippingZone', `
      CREATE TABLE IF NOT EXISTS "ShippingZone" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shopId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "countries" TEXT NOT NULL DEFAULT '[]',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ShippingRate
    await createTableIfMissing('ShippingRate', `
      CREATE TABLE IF NOT EXISTS "ShippingRate" (
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
      )
    `)

    // Shipment
    await createTableIfMissing('Shipment', `
      CREATE TABLE IF NOT EXISTS "Shipment" (
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
      )
    `)

    // ShopFollow
    await createTableIfMissing('ShopFollow', `
      CREATE TABLE IF NOT EXISTS "ShopFollow" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "shopId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Activity
    await createTableIfMissing('Activity', `
      CREATE TABLE IF NOT EXISTS "Activity" (
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
      )
    `)

    // ShopStory
    await createTableIfMissing('ShopStory', `
      CREATE TABLE IF NOT EXISTS "ShopStory" (
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
      )
    `)

    // StoryView
    await createTableIfMissing('StoryView', `
      CREATE TABLE IF NOT EXISTS "StoryView" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storyId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // SharedProduct
    await createTableIfMissing('SharedProduct', `
      CREATE TABLE IF NOT EXISTS "SharedProduct" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "platform" TEXT NOT NULL DEFAULT 'link',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // PaymentInfo
    await createTableIfMissing('PaymentInfo', `
      CREATE TABLE IF NOT EXISTS "PaymentInfo" (
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
      )
    `)

    // DeliveryAddress
    await createTableIfMissing('DeliveryAddress', `
      CREATE TABLE IF NOT EXISTS "DeliveryAddress" (
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
      )
    `)

    // Gig
    await createTableIfMissing('Gig', `
      CREATE TABLE IF NOT EXISTS "Gig" (
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
      )
    `)

    // PlatformStats
    await createTableIfMissing('PlatformStats', `
      CREATE TABLE IF NOT EXISTS "PlatformStats" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "totalUsers" INTEGER NOT NULL DEFAULT 0,
        "totalSellers" INTEGER NOT NULL DEFAULT 0,
        "totalProducts" INTEGER NOT NULL DEFAULT 0,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalRevenue" REAL NOT NULL DEFAULT 0,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Wallet
    await createTableIfMissing('Wallet', `
      CREATE TABLE IF NOT EXISTS "Wallet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "balance" REAL NOT NULL DEFAULT 0,
        "pendingBalance" REAL NOT NULL DEFAULT 0,
        "totalEarnings" REAL NOT NULL DEFAULT 0,
        "totalWithdrawn" REAL NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Transaction
    await createTableIfMissing('Transaction', `
      CREATE TABLE IF NOT EXISTS "Transaction" (
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
      )
    `)

    // Withdrawal
    await createTableIfMissing('Withdrawal', `
      CREATE TABLE IF NOT EXISTS "Withdrawal" (
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
      )
    `)

    // ─── Create essential indexes ────────────────────────────────────────
    const indexes = [
      { name: 'ProductVariantOption_productId', sql: 'CREATE INDEX IF NOT EXISTS "ProductVariantOption_productId_index" ON "ProductVariantOption"("productId")' },
      { name: 'ProductVariantOptionValue_optionId', sql: 'CREATE INDEX IF NOT EXISTS "ProductVariantOptionValue_optionId_index" ON "ProductVariantOptionValue"("optionId")' },
      { name: 'ProductVariant_productId', sql: 'CREATE INDEX IF NOT EXISTS "ProductVariant_productId_index" ON "ProductVariant"("productId")' },
      { name: 'ProductVariant_sku', sql: 'CREATE INDEX IF NOT EXISTS "ProductVariant_sku_index" ON "ProductVariant"("sku")' },
      { name: 'ProductVariantValue_variantId', sql: 'CREATE INDEX IF NOT EXISTS "ProductVariantValue_variantId_index" ON "ProductVariantValue"("variantId")' },
      { name: 'ReviewHelpfulVote_reviewId', sql: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_reviewId_index" ON "ReviewHelpfulVote"("reviewId")' },
      { name: 'ReviewHelpfulVote_userId', sql: 'CREATE INDEX IF NOT EXISTS "ReviewHelpfulVote_userId_index" ON "ReviewHelpfulVote"("userId")' },
      { name: 'DisputeMessage_disputeId', sql: 'CREATE INDEX IF NOT EXISTS "DisputeMessage_disputeId_index" ON "DisputeMessage"("disputeId")' },
      { name: 'DisputeEvidence_disputeId', sql: 'CREATE INDEX IF NOT EXISTS "DisputeEvidence_disputeId_index" ON "DisputeEvidence"("disputeId")' },
      { name: 'DisputeTimeline_disputeId', sql: 'CREATE INDEX IF NOT EXISTS "DisputeTimeline_disputeId_index" ON "DisputeTimeline"("disputeId")' },
      { name: 'CouponUsage_couponId', sql: 'CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_index" ON "CouponUsage"("couponId")' },
      { name: 'CouponUsage_userId', sql: 'CREATE INDEX IF NOT EXISTS "CouponUsage_userId_index" ON "CouponUsage"("userId")' },
      { name: 'CryptoWallet_currency', sql: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_currency_index" ON "CryptoWallet"("currency")' },
      { name: 'CryptoWallet_isActive', sql: 'CREATE INDEX IF NOT EXISTS "CryptoWallet_isActive_index" ON "CryptoWallet"("isActive")' },
      { name: 'Cart_userId', sql: 'CREATE INDEX IF NOT EXISTS "Cart_userId_index" ON "Cart"("userId")' },
      { name: 'Cart_updatedAt', sql: 'CREATE INDEX IF NOT EXISTS "Cart_updatedAt_index" ON "Cart"("updatedAt")' },
      { name: 'Session_userId', sql: 'CREATE INDEX IF NOT EXISTS "Session_userId_index" ON "Session"("userId")' },
      { name: 'Session_tokenHash', sql: 'CREATE INDEX IF NOT EXISTS "Session_tokenHash_index" ON "Session"("tokenHash")' },
      { name: 'AuditLog_userId', sql: 'CREATE INDEX IF NOT EXISTS "AuditLog_userId_index" ON "AuditLog"("userId")' },
      { name: 'AuditLog_action', sql: 'CREATE INDEX IF NOT EXISTS "AuditLog_action_index" ON "AuditLog"("action")' },
      { name: 'AuditLog_createdAt', sql: 'CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_index" ON "AuditLog"("createdAt")' },
    ]

    for (const idx of indexes) {
      await createIndexIfMissing(idx.name, idx.sql)
    }

    // ─── Capture tables after sync ───────────────────────────────────────
    const tablesAfter = await getTableList()
    const newTables = tablesAfter.filter((t) => !tablesBefore.includes(t))

    // ─── Summary ─────────────────────────────────────────────────────────
    const successCount = results.filter((r) => r.status === 'ok').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length
    const errorCount = results.filter((r) => r.status === 'error').length
    const errorResults = results.filter((r) => r.status === 'error')

    if (errorResults.length > 0) {
      console.error('[sync-schema] Errors:', errorResults.map(r => `${r.name}: ${r.error}`).join('; '))
    }

    console.log(`[sync-schema] Complete: ${successCount} applied, ${skippedCount} skipped, ${errorCount} errors`)

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: results.length,
        applied: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results,
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

  // Check current schema status
  try {
    const tables = await getTableList()

    // Get column info for User table
    let userColumns: string[] = []
    try {
      const cols = await db.$queryRawUnsafe(`PRAGMA table_info("User")`)
      userColumns = (cols as any[])?.map((c: any) => c.name) || []
    } catch {
      // Table might not exist yet
    }

    return NextResponse.json({
      status: 'ready',
      message: 'POST to this endpoint to sync schema (creates missing tables/columns via raw SQL)',
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      isSqlite: true,
      tables,
      userColumns,
    })
  } catch (error: unknown) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
    })
  }
}

/** Helper: Get list of user tables from SQLite */
async function getTableList(): Promise<string[]> {
  try {
    const tables = await db.$queryRawUnsafe(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`
    )
    return (tables as any[])?.map((t: any) => t.name) || []
  } catch {
    return []
  }
}
