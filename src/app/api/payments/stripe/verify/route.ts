import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { verifySession, isStripeConfigured } from '@/lib/stripe';
import { withCsrf } from '@/lib/with-csrf';
import { getSafeErrorMessage } from '@/lib/error-handler';

// =============================================================================
// POST /api/payments/stripe/verify
// Verifies a Stripe Checkout Session status.
// Returns payment status to the frontend.
// =============================================================================

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate the request
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Stripe payment gateway is not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { sessionId, orderId } = body;

    if (!sessionId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'sessionId or orderId is required' },
        { status: 400 }
      );
    }

    // If orderId is provided, look up the session ID from payment metadata
    let stripeSessionId = sessionId;

    if (!stripeSessionId && orderId) {
      const payment = await db.payment.findUnique({
        where: { orderId },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, error: 'Payment not found for this order' },
          { status: 404 }
        );
      }

      // Verify the buyer owns this payment
      if (payment.buyerId !== auth.userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: you can only verify your own payments' },
          { status: 403 }
        );
      }

      // Extract Stripe session ID from metadata
      try {
        const metadata = JSON.parse(payment.metadata || '{}');
        stripeSessionId = metadata.stripeSessionId;
      } catch {
        stripeSessionId = undefined;
      }

      if (!stripeSessionId) {
        return NextResponse.json(
          { success: false, error: 'No Stripe session found for this payment' },
          { status: 404 }
        );
      }
    }

    if (!stripeSessionId) {
      return NextResponse.json(
        { success: false, error: 'Could not determine Stripe session ID' },
        { status: 400 }
      );
    }

    // Verify the session with Stripe
    const result = await verifySession(stripeSessionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Payment verification failed',
          data: {
            status: result.status,
            sessionId: result.sessionId,
          },
        },
        { status: 400 }
      );
    }

    // Get the payment record for additional details
    const payment = await db.payment.findFirst({
      where: {
        metadata: { contains: stripeSessionId },
      },
      include: {
        order: { select: { id: true, status: true, paymentStatus: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        paymentIntentId: result.paymentIntentId,
        status: result.status,
        amount: result.amount,
        paymentStatus: payment?.status,
        escrowStatus: payment?.escrowStatus,
        orderStatus: payment?.order?.status,
        orderPaymentStatus: payment?.order?.paymentStatus,
      },
    });
  } catch (error) {
    console.error('[Stripe Verify] Error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to verify Stripe payment') },
      { status: 500 }
    );
  }
});
