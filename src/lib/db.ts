// =============================================================================
// TRIZA Database Client — Prisma Singleton
// Safely initializes PrismaClient with error handling for Vercel serverless
// =============================================================================

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use global singleton in ALL environments (including production/serverless)
// to avoid exhausting database connections on Vercel.
//
// PrismaClient connects lazily — no connection is made until the first query.
// If the database is unreachable, the error will surface on the first query,
// not at import time. This is intentional: it allows API routes that don't
// need the database (like /api/health) to work even when the DB is down.
let db: PrismaClient

try {
  db = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
} catch (error) {
  // If PrismaClient initialization fails (unlikely but possible on Vercel),
  // create a fallback that throws descriptive errors on first use.
  // This prevents module-level crashes that cause HTML 500 error pages.
  console.error('[db] Failed to initialize PrismaClient:', error)
  db = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$queryRaw' || prop === '$executeRaw') {
        return () => {
          throw new Error(
            'Database client failed to initialize. ' +
            'Check that @prisma/client is generated and DATABASE_URL is set. ' +
            'Original error: ' + (error instanceof Error ? error.message : String(error))
          )
        }
      }
      return () => {
        throw new Error(
          'Database client failed to initialize. ' +
          'Check that @prisma/client is generated and DATABASE_URL is set. ' +
          'Original error: ' + (error instanceof Error ? error.message : String(error))
        )
      }
    }
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// In production (Vercel serverless), also cache to prevent
// multiple PrismaClient instances across function invocations
if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}

export { db }
