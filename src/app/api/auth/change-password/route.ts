import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit';
import { authenticateRequestWithSession, signToken, signRefreshToken, setAuthCookies, extractToken } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';
import { validateInput, changePasswordSchema } from '@/lib/validation';
import { getSafeErrorMessage } from '@/lib/error-handler';
import { revokeAllUserSessions, createSession } from '@/lib/session';

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...authRateLimit,
      key: `change-password:${rateLimitKey}`,
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

    // Authenticate the request (with session validation)
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input with Zod schema
    const validation = validateInput(changePasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { userId, currentPassword, newPassword } = validation.data;

    // Ensure the authenticated user matches the requested userId
    if (auth.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: user ID mismatch' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Revoke all sessions for this user so other devices/sessions must re-authenticate
    await revokeAllUserSessions(userId);

    // Generate a new JWT access token and refresh token
    const authPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signToken(authPayload);
    const refreshToken = signRefreshToken(authPayload);

    // Create a new session for the new access token
    const deviceInfo = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    await createSession(userId, token, deviceInfo, ipAddress);

    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
      token,
      refreshToken,
    });

    // Set httpOnly cookies for both tokens
    setAuthCookies(response, token, refreshToken);

    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to change password') },
      { status: 500 }
    );
  }
});
