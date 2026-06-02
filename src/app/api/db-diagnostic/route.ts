import { NextResponse } from 'next/server';

/**
 * Database Diagnostic Endpoint
 *
 * GET /api/db-diagnostic?key=marketo-setup-2024
 *
 * Tests the database connection and reports detailed diagnostics.
 * This helps identify connection issues on Vercel/Supabase.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== 'marketo-setup-2024') {
    return NextResponse.json(
      { error: 'Invalid key. Use ?key=marketo-setup-2024' },
      { status: 403 }
    );
  }

  const diagnostics: Record<string, unknown> = {};

  // 1. Check environment variables
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  diagnostics.env = {
    DATABASE_URL_set: !!dbUrl,
    DATABASE_URL_prefix: dbUrl ? dbUrl.substring(0, 30) + '...' : '(not set)',
    DATABASE_URL_is_postgresql: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    DATABASE_URL_is_file: dbUrl.startsWith('file:'),
    DIRECT_URL_set: !!directUrl,
    DIRECT_URL_prefix: directUrl ? directUrl.substring(0, 30) + '...' : '(not set)',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Parse and analyze DATABASE_URL
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      diagnostics.parsedUrl = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || '(default)',
        username: url.username,
        pathname: url.pathname,
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
      const admin = await prisma.user.findUnique({ where: { email: 'admin@marketo.com' } });
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
      error: err.message,
      errorName: err.name,
    };

    // 4. If Prisma fails, try raw pg connection with different formats
    diagnostics.rawConnectionTests = [];

    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      try {
        const pg = await import('pg');
        const Client = (pg as unknown as { Client: typeof import('pg').Client }).Client;

        // Test 1: Use DATABASE_URL as-is
        try {
          const client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
          await client.connect();
          const res = await client.query('SELECT 1 as test');
          await client.end();
          diagnostics.rawConnectionTests.push({
            test: 'DATABASE_URL as-is',
            status: 'SUCCESS',
            result: res.rows[0],
          });
        } catch (e) {
          diagnostics.rawConnectionTests.push({
            test: 'DATABASE_URL as-is',
            status: 'FAILED',
            error: (e as Error).message,
          });
        }

        // Test 2: Try DIRECT_URL if set
        if (directUrl) {
          try {
            const client = new Client({
              connectionString: directUrl,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'DIRECT_URL',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          } catch (e) {
            diagnostics.rawConnectionTests.push({
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
              connectionString: altUrl,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'Pooler port 5432 (session mode)',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          } catch (e) {
            diagnostics.rawConnectionTests.push({
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
            const directConnStr = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
            const client = new Client({
              connectionString: directConnStr,
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'Direct connection (db.*.supabase.co)',
              status: 'SUCCESS',
              result: res.rows[0],
            });
          }
        } catch (e) {
          diagnostics.rawConnectionTests.push({
            test: 'Direct connection (db.*.supabase.co)',
            status: 'FAILED',
            error: (e as Error).message,
          });
        }
      } catch (pgError) {
        diagnostics.rawConnectionTests = {
          error: 'Could not import pg module: ' + (pgError as Error).message,
        };
      }
    }
  }

  // 5. Provide recommendations
  diagnostics.recommendations = [];

  if (!dbUrl) {
    diagnostics.recommendations.push('DATABASE_URL is not set! Add it in Vercel Environment Variables.');
  } else if (dbUrl.startsWith('file:')) {
    diagnostics.recommendations.push('DATABASE_URL is set to SQLite (file:). For Vercel, you need a PostgreSQL URL from Supabase.');
  }

  if (dbUrl && !directUrl) {
    diagnostics.recommendations.push('DIRECT_URL is not set. Prisma needs this for Supabase migrations. Add the direct connection string.');
  }

  const connResult = diagnostics.connection as { status?: string; error?: string } | undefined;
  if (connResult?.status === 'FAILED') {
    const errMsg = connResult.error || '';

    if (errMsg.includes('tenant') || errMsg.includes('ENOTFOUND')) {
      diagnostics.recommendations.push(
        '🔴 SUPABASE PROJECT MAY BE PAUSED! Go to https://supabase.com/dashboard → find your project → click "Restore project"'
      );
      diagnostics.recommendations.push(
        'If project is active, the DATABASE_URL region might be wrong. Check Supabase Dashboard → Settings → Database → Connection string for the correct URL.'
      );
    }

    if (errMsg.includes('password') || errMsg.includes('authentication')) {
      diagnostics.recommendations.push('Database password might be wrong. Check your Supabase database password.');
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
