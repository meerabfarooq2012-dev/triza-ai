import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint — Does NOT require database connection
 *
 * GET /api/health → Returns basic app status
 *
 * Use this to verify the Vercel deployment is working before
 * attempting database-dependent operations.
 */
interface HealthDatabase {
  status: string;
  adminExists?: boolean | string;
  adminIsActive?: boolean;
  adminIsVerified?: boolean;
  error?: string;
  errorName?: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  env: Record<string, unknown>;
  database?: HealthDatabase;
  recommendations?: string[];
}

export async function GET() {
  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV || null,
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + '***'
        : '(not set)',
      DATABASE_URL_is_postgresql: process.env.DATABASE_URL
        ? (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://'))
        : false,
      DIRECT_URL_set: !!process.env.DIRECT_URL,
      JWT_SECRET_set: !!process.env.JWT_SECRET,
    },
  };

  // Try database connection (optional — won't crash if it fails)
  try {
    const { db } = await import('@/lib/db');
    await db.$queryRaw`SELECT 1 as test`;
    health.database = { status: 'connected' } as HealthDatabase;

    // Check if admin user exists
    try {
      const admin = await db.user.findUnique({ where: { email: 'admin@thiora.com' } });
      health.database.adminExists = !!admin;
      health.database.adminIsActive = admin?.isActive ?? false;
      health.database.adminIsVerified = admin?.isVerified ?? false;
    } catch {
      health.database.adminExists = 'could not check';
    }
  } catch (error) {
    const err = error as Error;
    health.database = {
      status: 'failed',
      error: err.message,
      errorName: err.name,
    } as HealthDatabase;

    // Provide helpful recommendations
    health.recommendations = [];

    if (err.message.includes('P1001') || err.message.includes("Can't reach")) {
      health.recommendations.push('Database is unreachable. Supabase project may be paused.');
      health.recommendations.push('Go to https://supabase.com/dashboard → Restore project if paused.');
      health.recommendations.push('Check DATABASE_URL format — should start with postgresql://');
    } else if (err.message.includes('P1003') || err.message.includes('does not exist')) {
      health.recommendations.push('Database tables do not exist yet.');
      health.recommendations.push('Visit /api/setup/sync-schema?key=thiora-setup-2024 to create tables.');
    } else if (err.message.includes('tenant') || err.message.includes('ENOTFOUND')) {
      health.recommendations.push('Supabase project appears to be paused or URL is wrong.');
      health.recommendations.push('Go to https://supabase.com/dashboard → Restore project.');
    } else if (err.message.includes('password') || err.message.includes('authentication')) {
      health.recommendations.push('Database authentication failed. Check your DATABASE_URL password.');
    }
  }

  return NextResponse.json(health, {
    status: health.database?.status === 'failed' ? 503 : 200,
  });
}
