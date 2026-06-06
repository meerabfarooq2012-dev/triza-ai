import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...authRateLimit,
      key: `verify-email:${rateLimitKey}`,
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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user by email verify token
    const user = await db.user.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear the token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
})
