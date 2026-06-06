import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';
import { getSafeErrorMessage } from '@/lib/error-handler';

// In-memory rate limiter for verification attempts
const verifyAttempts = new Map<string, { count: number; resetAt: number }>();
const VERIFY_RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const VERIFY_RATE_LIMIT_MAX = 5;

function checkVerifyRateLimit(paymentId: string): boolean {
  const now = Date.now();
  const entry = verifyAttempts.get(paymentId);

  if (!entry || now > entry.resetAt) {
    verifyAttempts.set(paymentId, { count: 1, resetAt: now + VERIFY_RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= VERIFY_RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { paymentId, verificationToken, buyerId } = body;

    if (!paymentId || !verificationToken || !buyerId) {
      return NextResponse.json(
        { success: false, error: 'paymentId, verificationToken, and buyerId are required' },
        { status: 400 }
      );
    }

    // Rate limit verification attempts
    if (!checkVerifyRateLimit(paymentId)) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Only the buyer can verify
    if (payment.buyerId !== buyerId) {
      return NextResponse.json(
        { success: false, error: 'Only the buyer can verify this payment' },
        { status: 403 }
      );
    }

    // Payment must be in processing state
    if (payment.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: `Payment cannot be verified from ${payment.status} state` },
        { status: 400 }
      );
    }

    // Parse metadata to get verification token
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(payment.metadata || '{}');
    } catch {
      metadata = {};
    }

    const storedToken = metadata.verificationToken as string | undefined;
    const expiresAt = metadata.verificationExpiresAt as string | undefined;

    if (!storedToken) {
      // Legacy payment without verification token - auto-confirm
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          escrowStatus: 'held',
          paidAt: new Date(),
          metadata: JSON.stringify({
            ...metadata,
            verifiedAt: new Date().toISOString(),
            verificationMethod: 'legacy_auto',
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment verified (legacy)',
      });
    }

    // Verify the token matches
    if (storedToken !== verificationToken) {
      // Log the failed attempt
      await db.payment.update({
        where: { id: paymentId },
        data: {
          metadata: JSON.stringify({
            ...metadata,
            lastFailedVerifyAttempt: new Date().toISOString(),
            failedVerifyAttempts: ((metadata.failedVerifyAttempts as number) || 0) + 1,
          }),
        },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid verification token. Payment not confirmed.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired. Please initiate a new payment.' },
        { status: 400 }
      );
    }

    // Token is valid - confirm the payment
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        escrowStatus: 'held',
        paidAt: new Date(),
        metadata: JSON.stringify({
          ...metadata,
          verifiedAt: new Date().toISOString(),
          verificationMethod: 'token',
          verifiedIp: request.headers.get('x-forwarded-for') || 'unknown',
        }),
      },
      include: {
        order: true,
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create notification for buyer
    await db.notification.create({
      data: {
        userId: payment.buyerId,
        title: 'Payment Confirmed',
        message: `Your payment of $${payment.amount.toFixed(2)} for order #${payment.orderId.slice(-8)} has been confirmed and is held in escrow.`,
        type: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Payment verified and confirmed successfully',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to verify payment') },
      { status: 500 }
    );
  }
});
