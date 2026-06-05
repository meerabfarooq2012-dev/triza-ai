import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getRateLimitKey, passwordResetRateLimit } from '@/lib/rate-limit';
import { generateResetToken, generateResetExpiry } from '@/lib/auth-middleware';
import { sendEmailAsync } from '@/lib/email';
import { passwordResetEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 5 per 15 minutes
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...passwordResetRateLimit,
      key: `forgot-password:${rateLimitKey}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to avoid revealing whether the email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token and expiry
    const resetToken = generateResetToken();
    const resetTokenExpiry = generateResetExpiry();

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email (non-blocking)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://marketo.fun'}/reset-password?token=${resetToken}`;
    sendEmailAsync({
      to: email,
      subject: 'Reset Your Marketo Password',
      html: passwordResetEmail(user.name, resetUrl),
    });

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
