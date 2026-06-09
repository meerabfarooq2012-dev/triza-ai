import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { rateLimit, getRateLimitKey, passwordResetRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { validateInput, resetPasswordSchema } from '@/lib/validation';
import { getSafeErrorMessage } from '@/lib/error-handler';
import { revokeAllUserSessions } from '@/lib/session';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...passwordResetRateLimit,
      key: `reset-password:${rateLimitKey}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input with Zod schema
    const validation = validateInput(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find user by hashed reset token where the token has not expired
    const user = await db.user.findFirst({
      where: {
        resetToken: hashToken(token),
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user: set new password, clear reset token and expiry
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // Revoke all sessions for this user so they must re-authenticate with the new password
    await revokeAllUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to reset password') },
      { status: 500 }
    );
  }
});
