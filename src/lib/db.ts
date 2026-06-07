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
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// In production (Vercel serverless), also cache to prevent
// multiple PrismaClient instances across function invocations
if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}
