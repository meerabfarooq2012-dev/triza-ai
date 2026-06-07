import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use global singleton in ALL environments (including production/serverless)
// to avoid exhausting database connections on Vercel
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// In production (Vercel serverless), also cache to prevent
// multiple PrismaClient instances across function invocations
if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}