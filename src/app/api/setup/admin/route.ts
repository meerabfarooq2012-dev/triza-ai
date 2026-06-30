import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

/**
 * Admin Setup Endpoint
 *
 * GET  /api/setup/admin?key=<ADMIN_SETUP_KEY>  → Setup admin (works in browser!)
 * POST /api/setup/admin  Body: { setupKey: "<ADMIN_SETUP_KEY>" } → Setup admin
 *
 * This fixes the admin password hash so login works on Vercel/Supabase.
 * Requires ADMIN_SETUP_KEY env var to be set.
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: max 3 attempts per hour
    const rateLimitKey = getRateLimitKey(request);
    const rl = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3, key: `setup-admin:${rateLimitKey}` });
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many setup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const setupKey = searchParams.get('key');

    const adminSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!adminSetupKey) {
      console.warn('[SECURITY] ADMIN_SETUP_KEY env var is not set. Admin setup is disabled.');
      return NextResponse.json(
        { success: false, error: 'Admin setup is not configured. Set ADMIN_SETUP_KEY environment variable.' },
        { status: 503 }
      );
    }

    if (setupKey !== adminSetupKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    return await setupAdmin();
  } catch (error) {
    console.error('Admin setup error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);

    // Provide helpful diagnostics for common Supabase issues
    const helpInfo: Record<string, string> = {};

    if (errMsg.includes('tenant') || errMsg.includes('ENOTFOUND')) {
      helpInfo.issue = 'SUPABASE_CONNECTION_FAILED';
      helpInfo.cause = 'Your Supabase project is likely PAUSED (free tier auto-pauses after 7 days of inactivity) or the DATABASE_URL has the wrong region.';
      helpInfo.fix = [
        'Step 1: Go to https://supabase.com/dashboard',
        'Step 2: Find your project — if it says "Paused", click "Restore project"',
        'Step 3: Wait 1-2 minutes for the project to come back online',
        'Step 4: Go to Project Settings → Database → Connection string',
        'Step 5: Copy the "Connection pooling" URL (Transaction mode, port 6543) — this is your DATABASE_URL',
        'Step 6: Copy the "Direct connection" URL (Session mode, port 5432) — this is your DIRECT_URL',
        'Step 7: Update both URLs in Vercel → Settings → Environment Variables',
        'Step 8: Redeploy (Deployments → click "..." → Redeploy)',
        'Step 9: Come back and try this setup URL again',
      ].join('\n');
      helpInfo.diagnostic = 'Visit /api/db-diagnostic?key=<ADMIN_SETUP_KEY> for more details';
    } else if (errMsg.includes('password') || errMsg.includes('authentication')) {
      helpInfo.issue = 'DATABASE_AUTH_FAILED';
      helpInfo.cause = 'The database password in your DATABASE_URL is incorrect.';
      helpInfo.fix = 'Check your Supabase database password in Project Settings → Database and update the DATABASE_URL in Vercel.';
    }

    // SECURITY: Don't expose raw error messages — could leak connection strings, file paths
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed. Check server logs for details.',
        help: Object.keys(helpInfo).length > 0 ? helpInfo : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 3 attempts per hour
    const rateLimitKey = getRateLimitKey(request);
    const rl = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3, key: `setup-admin:${rateLimitKey}` });
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many setup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { setupKey } = body;

    const adminSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!adminSetupKey) {
      console.warn('[SECURITY] ADMIN_SETUP_KEY env var is not set. Admin setup is disabled.');
      return NextResponse.json(
        { success: false, error: 'Admin setup is not configured. Set ADMIN_SETUP_KEY environment variable.' },
        { status: 503 }
      );
    }

    if (setupKey !== adminSetupKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    return await setupAdmin();
  } catch (error) {
    console.error('Admin setup error:', error);
    // SECURITY: Don't expose raw error details in production
    return NextResponse.json(
      { success: false, error: 'Setup failed. Check server logs for details.' },
      { status: 500 }
    );
  }
}

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thiora.com';
  const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword();
  const SALT_ROUNDS = 12;

  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  // Check if admin exists
  const existingAdmin = await db.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Update password hash and ensure admin flags are correct
    await db.user.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        isAdmin: true,
        isActive: true,
        isVerified: true,
        role: 'both',
      },
    });

    // Ensure admin has a wallet
    const existingWallet = await db.wallet.findUnique({
      where: { userId: existingAdmin.id },
    });
    if (!existingWallet) {
      await db.wallet.create({
        data: {
          userId: existingAdmin.id,
          balance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0,
          currency: 'USD',
        },
      });
    }

    const response: Record<string, unknown> = {
      success: true,
      message: 'Admin account updated successfully',
    };
    // Include generated password only if ADMIN_PASSWORD env var was not set
    if (!process.env.ADMIN_PASSWORD) {
      response.generatedPassword = adminPassword;
      response.warning = 'No ADMIN_PASSWORD env var set. A random password was generated. Save it now — it won\'t be shown again.';
    }

    return NextResponse.json(response);
  }

  // Create new admin user
  const admin = await db.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'both',
      isAdmin: true,
      isVerified: true,
      isActive: true,
      bio: 'Platform administrator for TRIZA marketplace.',
    },
  });

  // Create wallet
  await db.wallet.create({
    data: {
      userId: admin.id,
      balance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      currency: 'USD',
    },
  });

  // Initialize platform stats if not exists
  const existingStats = await db.platformStats.findFirst();
  if (!existingStats) {
    await db.platformStats.create({
      data: {
        totalUsers: 1,
        totalSellers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      },
    });
  }

  const response: Record<string, unknown> = {
    success: true,
    message: 'Admin account created successfully',
  };
  // Include generated password only if ADMIN_PASSWORD env var was not set
  if (!process.env.ADMIN_PASSWORD) {
    response.generatedPassword = adminPassword;
    response.warning = 'No ADMIN_PASSWORD env var set. A random password was generated. Save it now — it won\'t be shown again.';
  }

  return NextResponse.json(response);
}

/** Generate a cryptographically secure random password */
function generateSecurePassword(): string {
  return randomBytes(24).toString('base64url').slice(0, 32);
}
