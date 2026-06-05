import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmailAsync } from '@/lib/email';
import { emailVerificationEmail } from '@/lib/email-templates';
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 per 15 minutes
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      windowMs: 15 * 60 * 1000,
      maxRequests: 3,
      key: `resend-verification:${rateLimitKey}`,
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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const emailVerifyToken = randomBytes(32).toString('hex');

    await db.user.update({
      where: { id: user.id },
      data: { emailVerifyToken },
    });

    // Send verification email (non-blocking)
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://marketo.fun'}?token=${emailVerifyToken}`;
    sendEmailAsync({
      to: user.email,
      subject: 'Verify Your Email — Marketo',
      html: emailVerificationEmail(user.name, verifyUrl),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
