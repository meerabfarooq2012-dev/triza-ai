import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { getSafeErrorMessage } from '@/lib/error-handler'

/**
 * POST /api/admin/sync-schema
 * 
 * Syncs the Prisma schema with the database by running ALTER TABLE statements.
 * This endpoint is protected by an admin key.
 * 
 * Called after deployments to ensure the database schema is up-to-date.
 * Uses Prisma's $executeRawUnsafe for direct SQL execution.
 */

// All schema migrations that need to be applied
const MIGRATIONS: { name: string; sql: string }[] = [
  // User table - add missing columns
  {
    name: 'User.resetToken',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`
  },
  {
    name: 'User.resetTokenExpiry',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3)`
  },
  {
    name: 'User.emailVerifyToken',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyToken" TEXT`
  },
  {
    name: 'User.emailVerified',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false`
  },
  {
    name: 'User.loginAttempts',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER NOT NULL DEFAULT 0`
  },
  {
    name: 'User.lockoutUntil',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockoutUntil" TIMESTAMP(3)`
  },
  {
    name: 'User.lastLoginAt',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)`
  },
  {
    name: 'User.deletedAt',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`
  },
  {
    name: 'User.termsAcceptedAt',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3)`
  },
  {
    name: 'User.twoFactorEnabled',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false`
  },
  {
    name: 'User.twoFactorSecret',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT`
  },
  {
    name: 'User.twoFactorBackupCodes',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT NOT NULL DEFAULT '[]'`
  },
  {
    name: 'User.twoFactorVerifiedAt',
    sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP(3)`
  },

  // Session table
  {
    name: 'Session table',
    sql: `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "deviceInfo" TEXT,
      "ipAddress" TEXT,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastAccessedAt" TIMESTAMP(3),
      CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'Session.userId index',
    sql: `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`
  },
  {
    name: 'Session.token unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token")`
  },
  {
    name: 'Session.expiresAt index',
    sql: `CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt")`
  },
  {
    name: 'Session FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Session_userId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // DigitalDownload table
  {
    name: 'DigitalDownload table',
    sql: `CREATE TABLE IF NOT EXISTS "DigitalDownload" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "orderId" TEXT,
      "downloadToken" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileName" TEXT,
      "fileSize" INTEGER,
      "maxDownloads" INTEGER NOT NULL DEFAULT 5,
      "downloadCount" INTEGER NOT NULL DEFAULT 0,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastDownloadedAt" TIMESTAMP(3),
      CONSTRAINT "DigitalDownload_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'DigitalDownload.userId index',
    sql: `CREATE INDEX IF NOT EXISTS "DigitalDownload_userId_productId_idx" ON "DigitalDownload"("userId", "productId")`
  },
  {
    name: 'DigitalDownload.token unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "DigitalDownload_downloadToken_key" ON "DigitalDownload"("downloadToken")`
  },
  {
    name: 'DigitalDownload userId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DigitalDownload_userId_fkey') THEN
        ALTER TABLE "DigitalDownload" ADD CONSTRAINT "DigitalDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'DigitalDownload productId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DigitalDownload_productId_fkey') THEN
        ALTER TABLE "DigitalDownload" ADD CONSTRAINT "DigitalDownload_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'DigitalDownload orderId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DigitalDownload_orderId_fkey') THEN
        ALTER TABLE "DigitalDownload" ADD CONSTRAINT "DigitalDownload_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // AuditLog table
  {
    name: 'AuditLog table',
    sql: `CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entityId" TEXT,
      "details" TEXT NOT NULL DEFAULT '{}',
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'AuditLog.userId index',
    sql: `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId")`
  },
  {
    name: 'AuditLog.action index',
    sql: `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`
  },
  {
    name: 'AuditLog.createdAt index',
    sql: `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`
  },
  {
    name: 'AuditLog FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'AuditLog_userId_fkey') THEN
        ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // ProductReport table
  {
    name: 'ProductReport table',
    sql: `CREATE TABLE IF NOT EXISTS "ProductReport" (
      "id" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "reporterId" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "adminNote" TEXT,
      "reviewedBy" TEXT,
      "reviewedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "ProductReport_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'ProductReport.productId index',
    sql: `CREATE INDEX IF NOT EXISTS "ProductReport_productId_idx" ON "ProductReport"("productId")`
  },
  {
    name: 'ProductReport.reporterId index',
    sql: `CREATE INDEX IF NOT EXISTS "ProductReport_reporterId_idx" ON "ProductReport"("reporterId")`
  },
  {
    name: 'ProductReport.status index',
    sql: `CREATE INDEX IF NOT EXISTS "ProductReport_status_idx" ON "ProductReport"("status")`
  },
  {
    name: 'ProductReport.productId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ProductReport_productId_fkey') THEN
        ALTER TABLE "ProductReport" ADD CONSTRAINT "ProductReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'ProductReport.reporterId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ProductReport_reporterId_fkey') THEN
        ALTER TABLE "ProductReport" ADD CONSTRAINT "ProductReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // Cart table
  {
    name: 'Cart table',
    sql: `CREATE TABLE IF NOT EXISTS "Cart" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'Cart.userId unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Cart_userId_key" ON "Cart"("userId")`
  },
  {
    name: 'Cart FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Cart_userId_fkey') THEN
        ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // CartItem table
  {
    name: 'CartItem table',
    sql: `CREATE TABLE IF NOT EXISTS "CartItem" (
      "id" TEXT NOT NULL,
      "cartId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "variantId" TEXT,
      "variantLabel" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'CartItem.cartId index',
    sql: `CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId")`
  },
  {
    name: 'CartItem.cartId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_cartId_fkey') THEN
        ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'CartItem.productId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_productId_fkey') THEN
        ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // Wishlist tables
  {
    name: 'Wishlist table',
    sql: `CREATE TABLE IF NOT EXISTS "Wishlist" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'My Wishlist',
      "slug" TEXT NOT NULL,
      "isPublic" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'Wishlist.userId index',
    sql: `CREATE INDEX IF NOT EXISTS "Wishlist_userId_idx" ON "Wishlist"("userId")`
  },
  {
    name: 'Wishlist.slug unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_slug_key" ON "Wishlist"("slug")`
  },
  {
    name: 'Wishlist FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Wishlist_userId_fkey') THEN
        ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // WishlistItem table
  {
    name: 'WishlistItem table',
    sql: `CREATE TABLE IF NOT EXISTS "WishlistItem" (
      "id" TEXT NOT NULL,
      "wishlistId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'WishlistItem.wishlistId index',
    sql: `CREATE INDEX IF NOT EXISTS "WishlistItem_wishlistId_idx" ON "WishlistItem"("wishlistId")`
  },
  {
    name: 'WishlistItem.productId index',
    sql: `CREATE INDEX IF NOT EXISTS "WishlistItem_productId_idx" ON "WishlistItem"("productId")`
  },
  {
    name: 'WishlistItem FK wishlist',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WishlistItem_wishlistId_fkey') THEN
        ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'WishlistItem FK product',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WishlistItem_productId_fkey') THEN
        ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },

  // NotificationPreference table
  {
    name: 'NotificationPreference table',
    sql: `CREATE TABLE IF NOT EXISTS "NotificationPreference" (
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
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'NotificationPreference.userId unique',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userId_key" ON "NotificationPreference"("userId")`
  },

  // Cart table - add abandoned cart fields
  {
    name: 'Cart.abandonedAt',
    sql: `ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "abandonedAt" TIMESTAMP(3)`
  },
  {
    name: 'Cart.lastReminderSentAt',
    sql: `ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "lastReminderSentAt" TIMESTAMP(3)`
  },
  {
    name: 'Cart.abandonedAt index',
    sql: `CREATE INDEX IF NOT EXISTS "Cart_abandonedAt_idx" ON "Cart"("abandonedAt")`
  },

  // CartItem table (if not already created)
  {
    name: 'CartItem table',
    sql: `CREATE TABLE IF NOT EXISTS "CartItem" (
      "id" TEXT NOT NULL,
      "cartId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "variantId" TEXT,
      "variantLabel" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
    )`
  },
  {
    name: 'CartItem.cartId index',
    sql: `CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId")`
  },
  {
    name: 'CartItem.cartId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_cartId_fkey') THEN
        ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
  {
    name: 'CartItem.productId FK',
    sql: `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_productId_fkey') THEN
        ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`
  },
]

export async function POST(request: NextRequest) {
  try {
    // Require JWT admin authentication
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[sync-schema] Starting schema sync with raw SQL...')
    
    const results: { name: string; status: 'ok' | 'skipped' | 'error'; error?: string }[] = []

    for (const migration of MIGRATIONS) {
      try {
        await db.$executeRawUnsafe(migration.sql)
        results.push({ name: migration.name, status: 'ok' })
        console.log(`[sync-schema] ✓ ${migration.name}`)
      } catch (err: any) {
        // Column/table already exists is OK
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          results.push({ name: migration.name, status: 'skipped' })
          console.log(`[sync-schema] ⏭ ${migration.name} (already exists)`)
        } else {
          results.push({ name: migration.name, status: 'error', error: getSafeErrorMessage(err) })
          console.error(`[sync-schema] ✗ ${migration.name}:`, err.message)
        }
      }
    }

    const successCount = results.filter(r => r.status === 'ok').length
    const skippedCount = results.filter(r => r.status === 'skipped').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({ 
      success: errorCount === 0,
      summary: {
        total: MIGRATIONS.length,
        applied: successCount,
        skipped: skippedCount,
        errors: errorCount
      },
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[sync-schema] Error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: getSafeErrorMessage(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Require JWT admin authentication
  const auth = authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Check current schema status
  try {
    const tables = await db.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    const userColumns = await db.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position
    `)

    return NextResponse.json({ 
      status: 'ready',
      message: 'POST to this endpoint with the correct key to sync schema',
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      directUrlSet: !!process.env.DIRECT_URL,
      isPostgresql: process.env.DATABASE_URL?.startsWith('postgresql://') || false,
      tables: (tables as any[])?.map((t: any) => t.table_name),
      userColumns: (userColumns as any[])?.map((c: any) => c.column_name),
      migrationCount: MIGRATIONS.length
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: getSafeErrorMessage(error),
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      migrationCount: MIGRATIONS.length
    })
  }
}
