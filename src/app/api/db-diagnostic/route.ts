import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getSafeErrorMessage } from '@/lib/error-handler';

/**
 * Database Diagnostic Endpoint
 *
 * GET /api/db-diagnostic                      → Requires JWT admin auth
 * GET /api/db-diagnostic?key=<ADMIN_SETUP_KEY> → Accessible with setup key (for pre-setup debugging)
 *
 * Tests the database connection and reports detailed diagnostics.
 */
export async function GET(request: NextRequest) {
  // Allow access via either JWT admin auth OR setup key
  const { searchParams } = new URL(request.url);
  const setupKey = searchParams.get('key');

  const adminSetupKey = process.env.ADMIN_SETUP_KEY;
  if (!adminSetupKey || setupKey !== adminSetupKey) {
    // Fall back to JWT admin auth
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required. Use ?key=<ADMIN_SETUP_KEY> or JWT admin auth.' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  const diagnostics: Record<string, unknown> = {};
  let rawConnectionTests: Array<Record<string, unknown>> = [];
  let recommendations: string[] = [];

  // 1. Check environment variables
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  diagnostics.env = {
    DATABASE_URL_set: !!dbUrl,
    DATABASE_URL_prefix: dbUrl ? dbUrl.substring(0, 15) + '***' : '(not set)',
    DATABASE_URL_is_postgresql: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    DATABASE_URL_is_file: dbUrl.startsWith('file:'),
    DIRECT_URL_set: !!directUrl,
    DIRECT_URL_prefix: directUrl ? directUrl.substring(0, 15) + '***' : '(not set)',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Parse and analyze DATABASE_URL
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      // Mask sensitive details - never expose full connection strings or passwords
      diagnostics.parsedUrl = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || '(default)',
        username: url.username ? url.username.substring(0, 3) + '***' : '(empty)',
        pathname: url.pathname,
        passwordSet: !!url.password,
        isPooler: url.hostname.includes('pooler'),
        isDirect: url.hostname.includes('db.'),
      };
    } catch {
      diagnostics.parsedUrl = { error: 'Could not parse DATABASE_URL' };
    }
  }

  // 3. Test Prisma connection
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    });

    const startTime = Date.now();
    await prisma.$connect();
    const connectTime = Date.now() - startTime;

    // Try a simple query
    const queryStart = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - queryStart;

    // Check if User table exists and has data
    let userCount = 0;
    let adminExists = false;
    try {
      userCount = await prisma.user.count();
      const admin = await prisma.user.findUnique({ where: { email: process.env.ADMIN_EMAIL || 'admin@thiora.com' } });
      adminExists = !!admin;
    } catch (e) {
      diagnostics.userTableError = (e as Error).message;
    }

    diagnostics.connection = {
      status: 'SUCCESS',
      connectTimeMs: connectTime,
      queryTimeMs: queryTime,
      queryResult: result,
      userCount,
      adminExists,
    };

    await prisma.$disconnect();
  } catch (error) {
    const err = error as Error;
    diagnostics.connection = {
      status: 'FAILED',
      error: getSafeErrorMessage(err),
      errorName: err.name,
    };

    // 4. If Prisma fails, try raw pg connection with different formats
    rawConnectionTests = [];

    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      try {
        const pg = await import('pg');
        const Client = (pg as unknown as { Client: typeof import('pg').Client }).Client;

        // Test 1: Use DATABASE_URL as-is
        try {
          const client = new Client({
            connectionString: dbUrl,
            // WARNING: rejectUnauthorized: false disables TLS certificate verification.
            // This is needed for some Supabase pooler connections but should be used with caution.
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
          await client.connect();
          const res = await client.query('SELECT 1 as test');
          await client.end();
          rawConnectionTests.push({
            test: 'DATABASE_URL as-is',
            status: 'SUCCESS',
            result: res.rows[0],
          });
        } catch (e) {
          rawConnectionTests.push({
            test: 'DATABASE_URL as-is',
            status: 'FAILED',
            error: (e as Error).message,
          });
        }

        // Test 2: Try DIRECT_URL if set
        if (directUrl) {
          try {
            const client = new Client({
              // WARNING: rejectUnauthorized: false disables TLS certificate verification
              connectionString: directUrl,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            rawConnectionTests.push({
              test: 'DIRECT_URL',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          } catch (e) {
            rawConnectionTests.push({
              test: 'DIRECT_URL',
              status: 'FAILED',
              error: (e as Error).message,
            });
          }
        }

        // Test 3: If using pooler with port 6543, try port 5432
        if (dbUrl.includes(':6543')) {
          try {
            const altUrl = dbUrl.replace(':6543', ':5432');
            const client = new Client({
              // WARNING: rejectUnauthorized: false disables TLS certificate verification
              connectionString: altUrl,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            rawConnectionTests.push({
              test: 'Pooler port 5432 (session mode)',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          } catch (e) {
            rawConnectionTests.push({
              test: 'Pooler port 5432 (session mode)',
              status: 'FAILED',
              error: (e as Error).message,
            });
          }
        }

        // Test 4: Try direct connection format
        try {
          const url = new URL(dbUrl);
          const password = url.password;
          // Extract project ref from username (postgres.PROJECT_REF) or hostname
          let projectRef = '';
          if (url.username.includes('.')) {
            projectRef = url.username.split('.')[1];
          } else if (url.hostname.includes('db.')) {
            const parts = url.hostname.split('.');
            projectRef = parts[1] || '';
          }

          if (projectRef) {
            const client = new Client({
              // WARNING: rejectUnauthorized: false disables TLS certificate verification
              connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            rawConnectionTests.push({
              test: 'Direct connection (db.*.supabase.co)',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          }
        } catch (e) {
          rawConnectionTests.push({
            test: 'Direct connection (db.*.supabase.co)',
            status: 'FAILED',
            error: (e as Error).message,
          });
        }
      } catch (pgError) {
        (rawConnectionTests as Array<Record<string, unknown>>) = [{
          error: 'Could not import pg module: ' + (pgError as Error).message,
        }];
      }
    }
  }

  // 5. Provide recommendations
  recommendations = [];

  if (!dbUrl) {
    recommendations.push('DATABASE_URL is not set! Add it in Vercel Environment Variables.');
  } else if (dbUrl.startsWith('file:')) {
    recommendations.push('DATABASE_URL is set to SQLite (file:). For Vercel, you need a PostgreSQL URL from Supabase.');
  }

  if (dbUrl && !directUrl) {
    recommendations.push('DIRECT_URL is not set. Prisma needs this for Supabase migrations. Add the direct connection string.');
  }

  const connResult = diagnostics.connection as { status?: string; error?: string } | undefined;
  if (connResult?.status === 'FAILED') {
    const errMsg = connResult.error || '';

    if (errMsg.includes('tenant') || errMsg.includes('ENOTFOUND')) {
      recommendations.push(
        '🔴 SUPABASE PROJECT MAY BE PAUSED! Go to https://supabase.com/dashboard → find your project → click "Restore project"'
      );
      recommendations.push(
        'If project is active, the DATABASE_URL region might be wrong. Check Supabase Dashboard → Settings → Database → Connection string for the correct URL.'
      );
    }

    if (errMsg.includes('password') || errMsg.includes('authentication')) {
      recommendations.push('Database password might be wrong. Check your Supabase database password.');
    }
  }

  diagnostics.rawConnectionTests = rawConnectionTests;
  diagnostics.recommendations = recommendations;

  // Use a custom JSON serializer to handle BigInt values from PostgreSQL
  // (Prisma $queryRaw returns BigInt for integer columns in PostgreSQL)
  const jsonSafeDiagnostics = JSON.parse(
    JSON.stringify(diagnostics, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );

  return NextResponse.json(jsonSafeDiagnostics, { status: 200 });
}
