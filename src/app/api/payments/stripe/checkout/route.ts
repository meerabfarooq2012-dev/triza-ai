import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';
import { withCsrf } from '@/lib/with-csrf';
import { getSafeErrorMessage } from '@/lib/error-handler';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';

// =============================================================================
// POST /api/payments/stripe/checkout
// Creates a Stripe Checkout Session for the given order.
// Returns sessionId + redirectUrl to the frontend.
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
    const { orderId, buyerId, amount, successUrl, cancelUrl } = body;

    // ----- Validation -----
    if (!orderId || !buyerId || !amount) {
      return NextResponse.json(
        { success: false, error: 'orderId, buyerId, and amount are required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user matches the buyerId
    if (auth.userId !== buyerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: buyer ID mismatch' },
        { status: 403 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // ----- Verify order exists and belongs to buyer -----
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId !== buyerId) {
      return NextResponse.json(
        { success: false, error: 'Order does not belong to this buyer' },
        { status: 403 }
      );
    }

    // ----- Verify payment exists for this order -----
    const payment = await db.payment.findUnique({
      where: { orderId },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'No payment record found for this order. Create payment first.' },
        { status: 404 }
      );
    }

    // Don't re-initiate if already completed
    if (payment.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Payment has already been completed for this order' },
        { status: 400 }
      );
    }

    // ----- Calculate platform fee and seller payout -----
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;
    const sellerPayout = Math.round((amount - platformFee) * 100) / 100;

    // ----- Create Stripe Checkout Session -----
    const result = await createCheckoutSession({
      orderId,
      amount,
      buyerEmail: payment.buyer?.email || undefined,
      buyerId,
      sellerId: payment.sellerId,
      description: `TRIZA Order #${orderId.slice(-8)}`,
      platformFee,
      sellerPayout,
      successUrl,
      cancelUrl,
    });

    // ----- Update payment with Stripe info -----
    const existingMetadata = JSON.parse(payment.metadata || '{}');
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'processing',
        paymentMethod: 'stripe',
        paymentProvider: result.sessionId,
        metadata: JSON.stringify({
          ...existingMetadata,
          stripeSessionId: result.sessionId,
          gatewayMode: 'stripe',
          initiatedAt: new Date().toISOString(),
          platformFee: platformFee.toFixed(2),
          sellerPayout: sellerPayout.toFixed(2),
        }),
      },
    });

    // ----- Return session info to frontend -----
    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        sessionId: result.sessionId,
        redirectUrl: result.url,
        amount: payment.amount,
        platformFee,
        sellerPayout,
      },
    });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to create Stripe checkout session') },
      { status: 500 }
    );
  }
});
