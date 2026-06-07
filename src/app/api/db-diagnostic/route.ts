import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Database Diagnostic Endpoint
 *
 * GET /api/db-diagnostic
 *
 * Tests the database connection and reports diagnostics.
 * Requires admin JWT authentication.
 * Sensitive info (passwords, full hostnames) is masked.
 */
export async function GET(request: NextRequest) {
  // Require admin JWT auth
  const authPayload = authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin JWT authentication required.' },
      { status: 401 }
    );
  }

  if (authPayload.role !== 'admin' && authPayload.role !== 'both') {
    return NextResponse.json(
      { error: 'Forbidden. Admin access required.' },
      { status: 403 }
    );
  }

  const diagnostics: Record<string, unknown> = {};

  // 1. Check environment variables (mask sensitive info)
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  diagnostics.env = {
    DATABASE_URL_set: !!dbUrl,
    DATABASE_URL_prefix: dbUrl ? dbUrl.substring(0, 15) + '...' : '(not set)',
    DATABASE_URL_is_postgresql: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    DATABASE_URL_is_file: dbUrl.startsWith('file:'),
    DIRECT_URL_set: !!directUrl,
    DIRECT_URL_prefix: directUrl ? directUrl.substring(0, 15) + '...' : '(not set)',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Parse and analyze DATABASE_URL (mask sensitive fields)
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      diagnostics.parsedUrl = {
        protocol: url.protocol,
        // Only show first 15 chars of hostname to avoid leaking full internal hostnames
        hostname: url.hostname.length > 15 ? url.hostname.substring(0, 15) + '...' : url.hostname,
        port: url.port || '(default)',
        username: url.username ? '***' : '(empty)',
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
            // WARNING: rejectUnauthorized: false disables TLS certificate verification.
            // This should only be used in development or with trusted networks.
            // In production, proper SSL certificates should be configured instead.
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
          await client.connect();
          const res = await client.query('SELECT 1 as test');
          await client.end();
          diagnostics.rawConnectionTests.push({
            test: 'DATABASE_URL as-is',
            status: 'SUCCESS',
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
              // WARNING: Same as above — rejectUnauthorized: false is insecure for production.
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'DIRECT_URL',
              status: 'SUCCESS',
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
              // WARNING: Same as above — rejectUnauthorized: false is insecure for production.
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'Pooler port 5432 (session mode)',
              status: 'SUCCESS',
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
              // WARNING: Same as above — rejectUnauthorized: false is insecure for production.
              ssl: { rejectUnauthorized: false },
              connectionTimeoutMillis: 5000,
            });
            await client.connect();
            const res = await client.query('SELECT 1 as test');
            await client.end();
            diagnostics.rawConnectionTests.push({
              test: 'Direct connection (db.*.supabase.co)',
              status: 'SUCCESS',
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
    diagnostics.recommendations.push('DATABASE_URL is not set! Add it in your hosting Environment Variables.');
  } else if (dbUrl.startsWith('file:')) {
    diagnostics.recommendations.push('DATABASE_URL is set to SQLite (file:). For production, you need a PostgreSQL URL.');
  }

  if (dbUrl && !directUrl) {
    diagnostics.recommendations.push('DIRECT_URL is not set. Prisma needs this for migrations. Add the direct connection string.');
  }

  const connResult = diagnostics.connection as { status?: string; error?: string } | undefined;
  if (connResult?.status === 'FAILED') {
    const errMsg = connResult.error || '';

    if (errMsg.includes('tenant') || errMsg.includes('ENOTFOUND')) {
      diagnostics.recommendations.push(
        'SUPABASE PROJECT MAY BE PAUSED! Go to the dashboard and restore the project.'
      );
    }

    if (errMsg.includes('password') || errMsg.includes('authentication')) {
      diagnostics.recommendations.push('Database password might be wrong. Check your database credentials.');
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
