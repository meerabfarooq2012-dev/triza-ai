import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'

/**
 * Deployment info endpoint — helps diagnose Vercel deployment issues.
 * ⚠️ SECURED: Requires admin JWT authentication or ADMIN_SETUP_KEY
 * Returns build-time and runtime information.
 */
export async function GET(request: NextRequest) {
  // SECURITY: Require admin auth or setup key
  const { searchParams } = new URL(request.url)
  const setupKey = searchParams.get('key')
  const adminSetupKey = process.env.ADMIN_SETUP_KEY

  let isAuthorized = false

  // Check setup key first
  if (adminSetupKey && setupKey === adminSetupKey) {
    isAuthorized = true
  }

  // Fall back to JWT admin auth
  if (!isAuthorized) {
    const auth = await authenticateRequest(request)
    if (auth && (auth.role === 'admin' || auth.role === 'both')) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Authentication required. Use ?key=<ADMIN_SETUP_KEY> or JWT admin auth.' },
      { status: 401 }
    )
  }

  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      // Don't expose cwd — could reveal internal paths
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
      // SECURITY: Only show boolean flags, never expose actual values or prefixes
      DATABASE_URL_set: !!process.env.DATABASE_URL,
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
    // SECURITY: Don't expose raw error messages — could contain connection strings
    info.env.DATABASE_error = 'Connection failed'
  }

  return NextResponse.json(info, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
