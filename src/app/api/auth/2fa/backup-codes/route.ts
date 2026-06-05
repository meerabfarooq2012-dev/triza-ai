import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { generateBackupCodes, hashBackupCode, verifyTOTP } from '@/lib/two-factor';

async function handler(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, maxRequests: 3, key: `2fa-backup:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify current TOTP code
    if (!verifyTOTP(user.twoFactorSecret, code)) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    await db.user.update({
      where: { id: user.id },
      data: { twoFactorBackupCodes: JSON.stringify(hashedBackupCodes) },
    });

    return NextResponse.json({
      success: true,
      data: { backupCodes },
    });
  } catch (error) {
    console.error('2FA backup codes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to regenerate backup codes' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
