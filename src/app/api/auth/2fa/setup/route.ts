import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { generateTOTPSecret, generateQRCode, generateBackupCodes, hashBackupCode } from '@/lib/two-factor';

async function handler(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, maxRequests: 3, key: `2fa-setup:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: '2FA is already enabled' }, { status: 400 });
    }

    // Generate TOTP secret
    const { secret, totp } = generateTOTPSecret(user.email, user.id);
    const qrCodeUrl = await generateQRCode(totp);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Store secret and backup codes (but don't enable 2FA yet)
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes, // Show once — user must save these
        manualEntryKey: secret,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to setup 2FA' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
