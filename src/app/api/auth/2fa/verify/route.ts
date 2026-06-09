import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db } from '@/lib/db';
import { authenticateRequest, signToken, signRefreshToken, setAuthCookies } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { verifyTOTP, verifyBackupCode } from '@/lib/two-factor';

async function handler(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, maxRequests: 10, key: `2fa-verify:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many attempts' }, { status: 429 });
    }

    const body = await request.json();
    const { userId, code, setupMode } = body;

    if (!userId || !code) {
      return NextResponse.json({ success: false, error: 'User ID and code are required' }, { status: 400 });
    }

    // For login 2FA, the auth might use a temp token; for setup, must be same user
    if (setupMode && auth.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: '2FA not configured' }, { status: 400 });
    }

    // Try TOTP verification first
    let isValid = verifyTOTP(user.twoFactorSecret, code);

    // If TOTP fails, try backup code
    let usedBackupCode = false;
    if (!isValid) {
      const hashedCodes = JSON.parse(user.twoFactorBackupCodes || '[]') as string[];
      if (verifyBackupCode(code, hashedCodes)) {
        isValid = true;
        usedBackupCode = true;
        // Remove used backup code
        const usedCodeHash = createHmac('sha256', process.env.JWT_SECRET || 'thiora-dev-secret').update(code).digest('hex');
        const remainingCodes = hashedCodes.filter(hc => hc !== usedCodeHash);
        await db.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: JSON.stringify(remainingCodes) },
        });
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // If setup mode, enable 2FA
    if (setupMode && !user.twoFactorEnabled) {
      await db.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorVerifiedAt: new Date(),
        },
      });
    }

    // Generate full auth token and refresh token
    const authPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signToken(authPayload);
    const refreshToken = signRefreshToken(authPayload);

    const { password: _, ...userWithoutPassword } = await db.user.findUnique({
      where: { id: user.id },
      include: { shop: true },
    }) || user;

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: userWithoutPassword,
        usedBackupCode,
      },
    });

    // Set httpOnly cookies for both tokens
    setAuthCookies(response, token, refreshToken);

    return response;
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
