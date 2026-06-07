import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

import { withCsrf } from '@/lib/with-csrf';
/**
 * Admin Setup Endpoint
 *
 * POST /api/setup/admin  Body: { setupKey: "<ADMIN_SETUP_KEY env var>" } → Setup admin
 *
 * This fixes the admin password hash so login works on Vercel/Supabase.
 * The setup key must be provided via the ADMIN_SETUP_KEY environment variable.
 */

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const setupKeyEnv = process.env.ADMIN_SETUP_KEY;
    if (!setupKeyEnv) {
      return NextResponse.json(
        { success: false, error: 'Setup key is not configured on the server. Set ADMIN_SETUP_KEY environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { setupKey } = body;

    if (setupKey !== setupKeyEnv) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    return await setupAdmin();
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
      { status: 500 }
    );
  }
})

async function setupAdmin() {
  const adminEmail = 'admin@marketo.com';
  const adminPassword = 'Admin123!';
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

    return NextResponse.json({
      success: true,
      message: 'Admin account created/updated successfully',
    });
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
      bio: 'Platform administrator for Marketo marketplace.',
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

  return NextResponse.json({
    success: true,
    message: 'Admin account created/updated successfully',
  });
}
