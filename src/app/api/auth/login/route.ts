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
import { normalizeEmail } from '@/lib/sanitize';
import { getSafeErrorMessage } from '@/lib/error-handler';
import { validateInput, loginSchema } from '@/lib/validation';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes (enhanced from 15)

// NOTE: withCsrf is intentionally NOT used on the login endpoint.
// Login is an unauthenticated endpoint — CSRF protection is less critical here
// because the user has no authenticated session to protect yet.
// Requiring CSRF on login can cause failures when the CSRF cookie isn't yet set
// (e.g., first visit, incognito mode, or strict privacy settings).
export const POST = async (request: NextRequest) => {
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

    // Validate input with Zod schema
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { password } = validation.data;
    const email = normalizeEmail(validation.data.email);

    const user = await db.user.findUnique({
      where: { email },
      include: { shop: true },
    });

    // Use generic message to avoid revealing whether email exists
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
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

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
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
      request.headers.get('x-forwarded-for')?.split(',').map(s => s.trim()).slice(-1)[0] ||
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
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to login') },
      { status: 500 }
    );
  }
};
