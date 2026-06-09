import { NextResponse } from 'next/server'

/**
 * Deployment info endpoint — helps diagnose Vercel deployment issues.
 * Returns build-time and runtime information.
 */
export async function GET() {
  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      VERCEL_BUILD_STEP: process.env.VERCEL_BUILD_STEP || 'not set',
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 30) || 'not set',
      JWT_SECRET_set: !!process.env.JWT_SECRET,
      NEXT_PUBLIC_SUPABASE_URL_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      DATABASE_connected: false as boolean,
      DATABASE_error: null as string | null,
    },
    build: {
      buildId: process.env.__NEXT_BUILD_ID || 'unknown',
    },
  }

  // Test database connection
  try {
    const { db } = await import('@/lib/db')
    await db.$queryRaw`SELECT 1`;
    info.env.DATABASE_connected = true
  } catch (err) {
    info.env.DATABASE_connected = false
    info.env.DATABASE_error = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(info, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
