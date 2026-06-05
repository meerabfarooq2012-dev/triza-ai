import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import bcrypt from 'bcryptjs';

async function handler(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, maxRequests: 5, key: `2fa-disable:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 400 });
    }

    // Disable 2FA
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: '[]',
        twoFactorVerifiedAt: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ success: false, error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
