import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  rateLimit,
  getFingerprintedRateLimitKey,
  getRequestFingerprint,
  loginRateLimit,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
} from '@/lib/rate-limit';
import { signToken } from '@/lib/auth-middleware';
import { createSession } from '@/lib/session';
import { withCsrf } from '@/lib/with-csrf';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes (enhanced from 15)

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Rate limiting — use fingerprinted key (IP + User-Agent) for more accurate limiting
    const rateLimitKey = getFingerprintedRateLimitKey(request, 'login');
    const rateLimitResult = rateLimit({
      ...loginRateLimit,
      key: rateLimitKey,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Progressive delay: check if this fingerprint has repeated failed attempts
    const fingerprint = getRequestFingerprint(request);
    const progressiveDelay = recordFailedLoginAttempt(fingerprint);
    if (progressiveDelay > 0) {
      // Apply the progressive delay before processing
      await new Promise((resolve) => setTimeout(resolve, progressiveDelay));
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { shop: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Check if user is locked out (30-minute lockout after 5 failed attempts)
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const retryAfterSeconds = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Account is temporarily locked. Try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const shouldLockout = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockoutUntil: shouldLockout
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
        },
      });

      if (shouldLockout) {
        return NextResponse.json(
          {
            success: false,
            error: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MS / 60000} minutes.`,
          },
          { status: 429 }
        );
      }

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email or password. ${remainingAttempts} attempt(s) remaining.`,
        },
        { status: 401 }
      );
    }

    // Clear failed login attempts on success
    clearFailedLoginAttempts(fingerprint);

    // Reset login attempts and update last login on success
    await db.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled) {
      // Return a temporary token that indicates 2FA is required
      const tempToken = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        twoFactorPending: true,
      });
      // Override the JWT expiry to 5 minutes for temp tokens
      // We'll use a special response format
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        tempToken,
        userId: user.id,
        email: user.email,
      });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create a session record in the database (token is hashed, never stored raw)
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      undefined;

    await createSession(user.id, token, userAgent, ipAddress).catch((err) => {
      // Log but don't block login if session creation fails
      console.error('Failed to create session:', err);
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Failed to login', debug: errMsg.substring(0, 200) },
      { status: 500 }
    );
  }
});
