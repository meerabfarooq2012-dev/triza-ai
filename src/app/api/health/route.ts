import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Health Check Endpoint
 *
 * GET /api/health → Returns basic app status (public, minimal info)
 * GET /api/health?detailed=true&key=<ADMIN_SETUP_KEY> → Detailed diagnostics (admin only)
 *
 * The basic health check is public and returns only essential status info.
 * Detailed diagnostics require admin auth to prevent information leakage.
 */

interface HealthStatus {
  status: string;
  timestamp: string;
  database?: string;
  // Detailed fields (admin only)
  env?: Record<string, unknown>;
  databaseDetails?: Record<string, unknown>;
  recommendations?: string[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isDetailed = searchParams.get('detailed') === 'true'
  const setupKey = searchParams.get('key')

  // Basic health check — public, minimal info
  if (!isDetailed) {
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };

    // Quick database check (just connected or not)
    try {
      const { db } = await import('@/lib/db');
      await db.$queryRaw`SELECT 1 as test`;
      health.database = 'connected';
    } catch {
      health.database = 'disconnected';
    }

    return NextResponse.json(health, {
      status: health.database === 'disconnected' ? 503 : 200,
    });
  }

  // ─── Detailed health check — requires admin auth ───────────────────────
  const adminSetupKey = process.env.ADMIN_SETUP_KEY;
  let isAuthorized = false;

  // Check setup key
  if (adminSetupKey && setupKey === adminSetupKey) {
    isAuthorized = true;
  }

  // Fall back to JWT admin auth
  if (!isAuthorized) {
    const auth = await authenticateRequest(request);
    if (auth && (auth.role === 'admin' || auth.role === 'both')) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Authentication required for detailed health. Use ?key=<ADMIN_SETUP_KEY> or JWT admin auth.' },
      { status: 401 }
    );
  }

  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV || null,
      // SECURITY: Only boolean flags, no actual values or prefixes
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_is_postgresql: process.env.DATABASE_URL
        ? (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://'))
        : false,
      DIRECT_URL_set: !!process.env.DIRECT_URL,
      JWT_SECRET_set: !!process.env.JWT_SECRET,
    },
  };

  // Try database connection
  try {
    const { db } = await import('@/lib/db');
    await db.$queryRaw`SELECT 1 as test`;
    health.databaseDetails = { status: 'connected' };

    // Check admin existence
    try {
      const admin = await db.user.findUnique({ where: { email: process.env.ADMIN_EMAIL || 'admin@thiora.com' } });
      health.databaseDetails = {
        status: 'connected',
        adminExists: !!admin,
        // SECURITY: Don't expose admin active/verified status in health check
      };
    } catch {
      health.databaseDetails = { status: 'connected', adminExists: 'could not check' };
    }
  } catch (error) {
    const err = error as Error;
    health.databaseDetails = {
      status: 'failed',
      // SECURITY: Use safe error messages, don't expose raw DB errors
      error: err.message?.includes('P1001') ? 'Database unreachable' :
             err.message?.includes('P1003') ? 'Tables do not exist' :
             err.message?.includes('tenant') ? 'DNS resolution failed (project may be paused)' :
             err.message?.includes('password') ? 'Authentication failed' :
             'Connection failed',
    };

    // Provide helpful recommendations
    health.recommendations = [];

    if (err.message.includes('P1001') || err.message.includes("Can't reach")) {
      health.recommendations.push('Database is unreachable. Supabase project may be paused.');
      health.recommendations.push('Go to https://supabase.com/dashboard → Restore project if paused.');
      health.recommendations.push('Check DATABASE_URL format — should start with postgresql://');
    } else if (err.message.includes('P1003') || err.message.includes('does not exist')) {
      health.recommendations.push('Database tables do not exist yet.');
      health.recommendations.push('Run schema sync to create tables.');
    } else if (err.message.includes('tenant') || err.message.includes('ENOTFOUND')) {
      health.recommendations.push('Supabase project appears to be paused or URL is wrong.');
      health.recommendations.push('Go to https://supabase.com/dashboard → Restore project.');
    }
  }

  return NextResponse.json(health, {
    status: (health.databaseDetails as { status?: string })?.status === 'failed' ? 503 : 200,
  });
}
